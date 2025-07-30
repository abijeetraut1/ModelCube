import IndexedDB from "@/config/IndexedDb";

export const createDatabase = async (conversation_id) => {
    const checkIfTableCreated = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();
    if (!checkIfTableCreated) {
        await IndexedDB.conversations.add({
            conversation_id: conversation_id, // slug
            codes: [],
            conversation: [],
            chats: []
        });
    }
}

export const addChats = async (conversation_id, codeBlocks, path) => {

    const checkIfTableCreated = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();

    if (!checkIfTableCreated) {

        await IndexedDB.conversations.add({
            conversation_id: conversation_id, // slug
            codes: [
                {
                    id: 0 + " - " + path,
                    path: path,
                    value: [{
                        version: 0,
                        code: codeBlocks.code,
                        text: codeBlocks.text
                    }]
                }
            ],
            conversation: [
                // {
                //     id: "asdf-asdf-asdf-" + path,
                //     provider: "user",
                //     text: "hello world"
                // }
            ],
            chats: [
                // {
                // id: "asdf-asdf-asdf-asdf",
                // provider: "user"
                // message: "hello world"
                // }
            ]
        });
    }

    const check_if_path_generated = checkIfTableCreated.codes.find(el => el.path === path);


    if (check_if_path_generated) {
        const next_version_gen_code = {
            version: check_if_path_generated.value.length,
            code: codeBlocks.code,
            text: codeBlocks.text
        };

        const updatedCodes = checkIfTableCreated.codes.map(code => {
            if (code.path === path) {
                return {
                    ...code,
                    value: [...code.value, next_version_gen_code]
                };
            }
            return code;
        });

        await IndexedDB.conversations.update(checkIfTableCreated.conversation_id, {
            codes: updatedCodes
        });

        console.log("Updated codes with new version for path:", path);
    } else {
        const Codes_in_DB = checkIfTableCreated.codes;
        const codes = [...Codes_in_DB, {
            id: Codes_in_DB.length + " - " + path,
            path: path,
            value: [{
                version: Codes_in_DB.length,
                code: codeBlocks.code,
                text: codeBlocks.text
            }]
        }];

        await IndexedDB.conversations.update(checkIfTableCreated.conversation_id, {
            codes: codes,
        })
    }
}

export const show = async (conversation_id, path) => {
    const checkIfTableCreated = await IndexedDB.conversations.where("conversation_id").equals(conversation_id).first();

    if (!checkIfTableCreated) {
        return console.log("cannot find the table with that id");
    }

    // console.log(checkIfTableCreated.codes)
    const code = checkIfTableCreated.codes.find(el => el.path === path);
    // console.log(code);
    return code;
}

export const updateCodes = async (conversation_id, path, version, updateCode) => {
    const checkIfTableCreated = await IndexedDB.conversations
        .where("conversation_id")
        .equals(conversation_id)
        .first();

    if (!checkIfTableCreated) {
        console.log("Cannot find the table with that ID");
        return;
    }

    const updatedArray = checkIfTableCreated.codes.map((code) => {
        if (code.path === path) {
            const latestVersion = code.value.length - 1;

            const updatedValue = [...code.value];
            updatedValue[latestVersion] = {
                ...updatedValue[latestVersion],
                code: updateCode,
            };

            return {
                ...code,
                value: updatedValue,
            };
        }

        return code;
    });

    await IndexedDB.conversations.update(checkIfTableCreated.conversation_id, {
        codes: updatedArray,
    });
};
