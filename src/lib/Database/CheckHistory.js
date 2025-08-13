import IndexedDB from "@/config/IndexedDb";
import { setGeneratedFolders } from "@/lib/Redux/Reducers/response";

export const checkHistory = async (conversation_id, dispatch) => {
    if (
        typeof conversation_id !== "string" ||
        typeof dispatch !== "function"
    ) {
        console.error("Invalid inputs:", { conversation_id });
        return 0;
    }

    // Validate key value
    if (!conversation_id || conversation_id.trim() === "") {
        console.error("Invalid conversation_id:", conversation_id);
        return 0;
    }

    try {
        const checkIfTableCreated = await IndexedDB.conversations
            .where("conversation_id")
            .equals(conversation_id)
            .first();

        if (!checkIfTableCreated) return 0;

        checkIfTableCreated.codes.forEach((data) => {
            dispatch(setGeneratedFolders(data.path));
        });

        return checkIfTableCreated;
    } catch (error) {
        console.error("checkHistory failed:", error);
        return 0;
    }
};



export const checkHistoryTitle = async () => {
    const checkIfTableCreated = await IndexedDB.conversations.toArray();
    // console.log(checkIfTableCreated)

    if (!checkIfTableCreated) return 0;

    // console.log(checkIfTableCreated)
    const path = checkIfTableCreated.map((el) => {
        if (!el.conversation_id) return;
        return { title: el.title };
    })
    console.log(path)

    return path;
}

// this can be used to generate the new slugs
export const usedSlugs = async () => {
    const checkIfTableCreated = await IndexedDB.conversations.toArray();
    // console.log(checkIfTableCreated)

    if (!checkIfTableCreated) return 0;

    // console.log(checkIfTableCreated)
    const path = checkIfTableCreated.map((el) => {
        if (!el.conversation_id) return;
        return el.conversation_id;
    })
    console.log(path)

    return path;
}