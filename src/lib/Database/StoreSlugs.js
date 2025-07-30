import IndexedDB from "@/config/IndexedDb";

export const storeSlugs = async (slugs) => {
    const ids = await IndexedDB.conversations.where("conversation_id").equals(slugs).first();

    if (!ids) {
        await IndexedDB.slugs.add({
            slugs: slugs,
            isUsed: false,
            createdAt: Date.now(),
        });
    }
}

export const getSlugs = async () => {
    const all_slugs = await IndexedDB.slugs.toArray();

    if (all_slugs.length === 0) {
        return {
            message: "no slugs found",
            status: 404
        }
    } else {
        const slugsArray = all_slugs.map(el => ({ slug: el.slugs }));
        console.log(slugsArray)

        return {
            message: slugsArray,
            status: 200
        }
    }
}

export const getCurrentSlug = async () => {
    const lastItem = await IndexedDB.slugs.orderBy('createdAt').reverse().first();
    if (lastItem.length === 0) {
        return {
            message: "no slugs found",
            status: 404
        }
    } else {
        return {
            message: lastItem,
            status: 200
        }
    }
}