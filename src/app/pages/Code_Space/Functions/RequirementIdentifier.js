import { show } from "@/lib/Database/CodesDB";

const RequirementArray = {
    routes: ["utils", "config", "middlewares"],
    controllers: ["prisma"]
};

export const RequirementIdentifier = async (slug, Category, GeneratedFolders, toGeneratePath) => {

    const splitFolderAddress = toGeneratePath.split("/");
    const folder = splitFolderAddress[0];
    const prefix = splitFolderAddress.length > 2 ? splitFolderAddress[1] : null;
    const file = splitFolderAddress.length >= 3 ? splitFolderAddress[2] : splitFolderAddress[1];
    let storeAssociatedFileCode;

    if (folder === "routes") {
        const associatedFolders = GeneratedFolders.filter(el => RequirementArray[folder].includes(el.Folder))

        const extractedDatas = await AssociatedFileExtractor(slug, Category, associatedFolders);

        storeAssociatedFileCode = extractedDatas;
    } else if (folder === "controllers") {
        const baseFileName = file.replace("Controller.js", "");
        const routes = {
            Files: [`${baseFileName}Routes.js`],
            Folder: `routes/${prefix}`,
        }


        const associatedFolders = GeneratedFolders.filter(el => RequirementArray[folder].includes(el.Folder))
        associatedFolders.push(routes);


        const extractedDatas = await AssociatedFileExtractor(slug, Category, associatedFolders);

        storeAssociatedFileCode = extractedDatas;
    }

    return storeAssociatedFileCode;
}

const AssociatedFileExtractor = async (slug, Category, associatedFolders) => {
    const associatedPathArray = PathCreator(associatedFolders);
    const user_id = 123123;

    const fileCodePromises = associatedPathArray.map(async (path) => {
        const showData = await show(slug, user_id, path);

        if (!showData || !showData.value?.length) {
            console.log("No Data to show:", path);
            return null;
        }

        const latestCodeIndex = showData.value.length - 1;

        return {
            path: showData.path,
            code: showData.value[latestCodeIndex].code,
        };
    });

    const resolvedCodeArray = await Promise.all(fileCodePromises);

    // Filter out any nulls
    const AssociatedCodeArray = resolvedCodeArray.filter(Boolean);

    console.log(AssociatedCodeArray);
    return AssociatedCodeArray;
};




const PathCreator = (associatedFolders) => {
    let FolderArray = [];

    associatedFolders.forEach(folders => {

        if (Array.isArray(folders.Files)) {
            const path = folders?.Files.map(el => folders.Folder + "/" + el);
            path.map(el => FolderArray.push(el));
        }

    });

    return FolderArray;
}