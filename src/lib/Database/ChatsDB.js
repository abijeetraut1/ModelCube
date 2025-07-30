import IndexedDB from "@/config/IndexedDb";
import { createDatabase } from "./CodesDB";

export const saveChats = async (conversation_id, message) => {

    const checkIfTableCreated = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();
    if (!checkIfTableCreated) {
        return console.log("Please Wait Till the Generation")
    }

    const PrevChats = checkIfTableCreated?.conversation || [];

    const updatedChats = [...PrevChats, message];


    // console.log(checkIfTableCreated, updateChatArray)

    const msg = await IndexedDB.conversations.update(checkIfTableCreated.conversation_id, {
        conversation: updatedChats
    })

    return msg;
};

export const fetchChats = async (conversation_id) => {
    const FetchChats = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();

    if (!FetchChats) return console.log("Cannot Fetch Previous Chats");


    return FetchChats.conversation;
};

export const fetchNormalChats = async (conversation_id) => {
    const FetchChats = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();
    console.log(FetchChats)

    if (!FetchChats) return console.log("Cannot Fetch Previous Chats");
    return FetchChats.chats;
};

export const saveNormalChats = async (conversation_id, message) => {

    const checkIfTableCreated = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();
    if (!checkIfTableCreated) {
        await createDatabase(conversation_id);

        // return console.log("Please Wait Till the Generation")
    }

    const PrevChats = checkIfTableCreated?.chats || [];

    const updatedChats = [...PrevChats, message];

    const msg = await IndexedDB.conversations.update(conversation_id, {
        chats: updatedChats
    })

    return msg;
};

