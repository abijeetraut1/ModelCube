import { defaultModelOptions } from "./settings.js";
import fs from 'fs';
import path from 'path';
import { app } from "electron";
import os from "os";

const isDev = !app.isPackaged;


let llama = null;
let model = null;
let isInitialized = false;
const sessions = new Map();
let abortController = new AbortController();

let modelPath;

const maxCacheSize = 3;
const cacheTtl = 300000; // 5 minutes

async function printModelInfo(path) {

  const { Llama, LlamaModel } = await import("node-llama-cpp");

  await Llama.init();

  const model = new LlamaModel({
    modelPath: path,
  });

  const meta = model.getMeta();

  console.log("Model Metadata:");
  console.log(meta);

  if ('num_layer' in meta) {
    console.log("✅ Number of Layers:", meta.num_layer);
  } else {
    console.log("⚠️ Could not find number of layers in metadata.");
  }

  model.free(); // clean up
}


async function initializeLLM(path) {
  const { getLlama } = await import("node-llama-cpp");

  try {
    if (!path) return;
    modelPath = path;

    if (isInitialized) {
      console.log("Llama model already initialized");
      return true;
    }

    console.log("Initializing Llama model with 4GB VRAM optimization...");

    const isMac = os.platform() === "darwin";
    llama = await getLlama();
    console.log("GPU type:", llama.gpu);

    // const ModelInfo = await printModelInfo(path);
    // console.log(ModelInfo);

    // const gpuLayersOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40];
    let initialized = false;
    let lastError = null;

    // for (const layers of gpuLayersOptions) {


    if (isMac) {
      try {
        console.log(`Attempting initialization with CPU`);
        model = await llama.loadModel({
          modelPath: path,
          ...defaultModelOptions,
          gpuLayers: 0,
          nGpuLayers: 0
        });
        initialized = true;
        console.log("Successfully initialized with CPU");
        // break;
      } catch (error) {
        lastError = error;
        console.warn(`Failed with CPU layers`);
        // if (error.message.includes('VRAM')) continue;
        throw error;
      }
    } else {
      const layers = isMac ? 20 : 0;
      for (let i = 0; i <= layers; i++) {
        try {
          console.log(`Attempting initialization with ${i} GPU layers...`);
          model = await llama.loadModel({
            modelPath: path,
            ...defaultModelOptions,
            gpuLayers: i,
            nGpuLayers: i
          });
          initialized = true;
          console.log(`Successfully initialized with ${layers} GPU layers`);
          // break;
        } catch (error) {
          lastError = error;
          console.warn(`Failed with ${layers} GPU layers: ${error.message}`);
          if (error.message.includes('VRAM')) continue;
          throw error;
        }
      }
    }

    if (!initialized) throw lastError || new Error("All initialization attempts failed");

    isInitialized = true;
    return {
      status: 200,
      message: "Model Initialized",
      isInitialized: true
    };
  } catch (error) {
    console.log(error);
    return {
      status: 404,
      message: "Model initialization failed",
      isInitialized: false
    };
  }
}

async function createLLMSession(sessionId) {
  const { LlamaChatSession } = await import("node-llama-cpp");




  try {
    if (sessions.has(sessionId)) {
      console.log(`Session ${sessionId} already exists`);
      return sessions.get(sessionId);
    }

    const startTime = Date.now();
    const context = await model.createContext({ ...defaultModelOptions });


    const session = new LlamaChatSession({
      contextSequence: context.getSequence(),
    });

    const sessionData = {
      session,
      context,
      createdAt: new Date(),
      lastUsed: new Date(),
      cache: new Map(),
      cacheTimestamps: new Map()
    };

    sessions.set(sessionId, sessionData);
    console.log(`Created session ${sessionId} in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    return sessionData;
  } catch (error) {
    console.error(`Session creation failed for ${sessionId}:`, error);
    throw error;
  }
}

function terminateSession() {
  abortController.abort();
}

function restartSession() {
  abortController = new AbortController();
}

async function chatWithLLM(sessionId, message, SamplingParameters, IPC_event) {
  try {
    const sessionData = sessions.get(sessionId);
    if (!sessionData) throw new Error(`Session ${sessionId} not found`);

    const cacheKey = message.trim().toLowerCase();
    if (sessionData.cache.has(cacheKey)) {
      const cached = sessionData.cache.get(cacheKey);
      const cacheAge = Date.now() - sessionData.cacheTimestamps.get(cacheKey);

      if (cacheAge < cacheTtl) {
        console.log(`Returning cached response for ${sessionId}`);
        return {
          success: true,
          response: cached,
          sessionId,
          cached: true
        };
      }

      sessionData.cache.delete(cacheKey);
      sessionData.cacheTimestamps.delete(cacheKey);
    }

    console.log(`Processing message for ${sessionId}`);
    const startTime = Date.now();

    const response = await sessionData.session.prompt(message, {
      temperature: .7 || SamplingParameters.temp,
      topP: .9 || SamplingParameters.topP,
      stream: true,
      stopOnAbortSignal: true,
      signal: abortController.signal,
      onResponseChunk(chunk) {
        // console.log(chunk.type, chunk.segmentType, chunk.text, chunk.segmentStartTime, chunk.segmentEndTime);
        IPC_event.reply("on-chat", chunk);
      }
    });

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Generated response in ${responseTime}s`);

    IPC_event.reply("on-chat-end", {
      timeTook: responseTime,
      message: "finished",
      status: 200
    });

    if (sessionData.cache.size >= maxCacheSize) {
      const oldestKey = sessionData.cache.keys().next().value;
      sessionData.cache.delete(oldestKey);
      sessionData.cacheTimestamps.delete(oldestKey);
    }

    sessionData.cache.set(cacheKey, response);
    sessionData.cacheTimestamps.set(cacheKey, Date.now());
    sessionData.lastUsed = new Date();

    return {
      success: true,
      response,
      sessionId,
      cached: false,
      responseTime
    };
  } catch (error) {
    console.error(`Chat failed for ${sessionId}:`, error);
    return {
      success: false,
      error: error.message,
      sessionId,
    };
  }
}

function getLLMSessionInfo(sessionId) {
  const sessionData = sessions.get(sessionId);
  if (!sessionData) return null;
  return {
    sessionId,
    createdAt: sessionData.createdAt,
    lastUsed: sessionData.lastUsed,
    cacheSize: sessionData.cache.size,
    exists: true,
  };
}

async function removeLLMSession(sessionId) {
  try {
    const sessionData = sessions.get(sessionId);
    if (!sessionData) return false;
    if (sessionData.context) await sessionData.context.dispose();
    sessions.delete(sessionId);
    console.log(`Removed session ${sessionId}`);
    return true;
  } catch (error) {
    console.error(`Error removing session ${sessionId}:`, error);
    return false;
  }
}

function getLLMActiveSessions() {
  return Array.from(sessions.keys());
}

async function cleanupLLM() {
  try {
    const sessionIds = getLLMActiveSessions();
    for (const sessionId of sessionIds) {
      await removeLLMSession(sessionId);
    }
    console.log("Cleaned up all sessions");
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

function isLLMReady() {
  return isInitialized;
}

function getLLMStatus() {
  return {
    initialized: isInitialized,
    activeSessions: sessions.size,
    modelPath: modelPath,
    options: defaultModelOptions,
  };
}

export {
  initializeLLM,
  createLLMSession,
  chatWithLLM,
  terminateSession,
  restartSession,
  getLLMSessionInfo,
  removeLLMSession,
  getLLMActiveSessions,
  cleanupLLM,
  isLLMReady,
  getLLMStatus
};