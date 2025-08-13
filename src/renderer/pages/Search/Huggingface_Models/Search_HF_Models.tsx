import axios from "axios";

interface Search_LLMS_interface {
    model_name: string,
}

export default async function Search_LLMS(params: Search_LLMS_interface) {
    const search = params.model_name || "deepseek-coder";
    const limit = 10;


    try {
        const listUrl = `https://huggingface.co/api/models?search=${encodeURIComponent(search)}&limit=${limit}`;
        const listRes = await axios.get(listUrl);
        const models = listRes.data;

        const results = [];

        for (const model of models) {
            const modelId = model.modelId || model.id;
            const author = model.author || model.id.split("/")[0];
            const treeUrl = `https://huggingface.co/api/models/${modelId}/tree/main`;

            try {
                const treeRes = await axios.get(treeUrl);
                const files = treeRes.data;

                const ggufFiles = files.filter((f: { path: string; }) => f.path.endsWith(".gguf"));

                if (ggufFiles.length > 0) {
                    results.push({
                        modelId,
                        developer: author,
                        download: model.downloads,
                        tags: model.tags,
                        likes: model.likes,
                        library_name: model.library_name,
                        pipeline_tag: model.pipeline_tag,
                        createdAt: model.createdAt,
                        files: ggufFiles.map((file: { size: number; path: string; }) => file.size && ({
                            filename: file.path,
                            downloadUrl: `https://huggingface.co/${modelId}/resolve/main/${file.path}`,
                            sizeGB: file.size ? (file.size / (1024 ** 3)).toFixed(2) : "Unknown"
                        }))
                    });
                }
            } catch (err) {
                console.warn(`❌ Failed to fetch tree for ${modelId}: ${(err as Error).message}`);
            }
        }

        if (results.length === 0) {
            return {
                message: "No .gguf files found for given search",
                status: 404
            }
        }

        return {
            status: 200,
            message: "Fetch Successfull",
            models: results
        };
    } catch (err) {
        console.log(err);
        console.error(" Error fetching models:", (err as Error).message);
        return { error: "Please Connect to internet", status: 500 };
    }
}