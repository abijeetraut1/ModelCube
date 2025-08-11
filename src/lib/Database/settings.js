import IndexedDB from "@/config/IndexedDb";
import { toast } from "sonner";

export const updateSettings = async (config) => {
    try {
        console.log("calling")
        // ensure we always have an id for the primary key
        const dataToSave = { id: "app-settings", ...config };

        await IndexedDB.settings.put(dataToSave);
        toast.success("Settings updated successfully");
    } catch (err) {
        console.error("Error saving settings:", err);
        toast.error("Failed to update settings");
    }
};

export const fetchSettings = async () => {
    try {

        const settings = await IndexedDB.settings.get("app-settings");
        // console.log(settings);

        return {
            status: 200,
            response: settings,
            message: "updated successfully",
        }

    } catch (err) {
        console.error("Error saving settings:", err);
        toast.error("Failed to Fetching settings");
    }
}