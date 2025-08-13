import IndexedDB from "@/config/IndexedDb";
import { createDatabase } from "./CodesDB";

export const saveChats = async (conversation_id, message) => {
    const conversation = await IndexedDB.conversations.get(conversation_id);
    if (!conversation) {
        return console.log("Please Wait Till the Generation");
    }

    const PrevChats = conversation?.chats || [];
    const updatedChats = [...PrevChats, message];

    const msg = await IndexedDB.conversations.update(conversation_id, {
        chats: updatedChats
    });

    return msg;
};

export const fetchChats = async (conversation_id) => {
    const conversation = await IndexedDB.conversations.get(conversation_id);
    if (!conversation) return console.log("Cannot Fetch Previous Chats");
    return conversation.chats || [];
};

export const fetchNormalChats = fetchChats;

// export const fetchNormalChats = async (conversation_id) => {
//     const FetchChats = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();
//     console.log(FetchChats)

//     if (!FetchChats) return console.log("Cannot Fetch Previous Chats");
//     return FetchChats.chats;
// };

export const saveNormalChats = async (conversation_id, message) => {
    const conversation = await IndexedDB.conversations.get(conversation_id);
    if (!conversation) {
        await createDatabase(conversation_id);
        return saveNormalChats(conversation_id, message); // retry after creation
    }

    const PrevChats = conversation.chats || [];
    const updatedChats = [...PrevChats, message];

    return IndexedDB.conversations.update(conversation_id, {
        chats: updatedChats
    });
};

export const updateTitle = async (conversation_id, title) => {
    const conversation = await IndexedDB.conversations.get(conversation_id);

    if (!conversation) {
        await IndexedDB.conversations.add({
            conversation_id,
            chats: [],
            title
        });
        return;
    }

    return IndexedDB.conversations.update(conversation_id, { title });
};

export const fetchTitle = async (conversation_id) => {

    console.log(conversation_id)
    const conversation = await IndexedDB.conversations.get(conversation_id);
    if (!conversation) {
        console.log("Cannot fetch title - conversation not found");
        return null;
    }
    return conversation.title;
};
