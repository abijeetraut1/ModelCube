import JSZip from "jszip";
import { saveAs } from "file-saver";
import IndexedDB from "@/config/IndexedDb";

const zip = new JSZip();

export const DownloadSourceCode = async (conversation_id, Category) => {

    const checkIfTableCreated = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();

    zip.folder(Category);
    const codes = checkIfTableCreated.codes;

    codes.forEach(element => {
        const codeIndex = element.value.length === 0 ? 0 : element.value.length - 1;
        const latestCode = element.value[codeIndex].code;
        zip.file(element.path, latestCode);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${Category}.zip`);
};

export const DownloadSingleFile = async (path, codes) => {
    // console.log(path, codes[0].code);

    if (!path || !codes) return console.log("Please select a File");

    var fileData = new Blob([codes[0].code], { type: "text/plain;charset=utf-8" });
    saveAs(fileData, path);
}