import { post } from "@renderer/utils/requests";

/**
 * Fetches preprocessing visualization images for a given session.
 * @param data - Object containing project and session_name.
 * @returns An object with keys: timeseries, scatter, cloud (each a base64 string or null if not found).
 */
type PreprocessingVisualizationProps = {
    project: string;
    session_name: string;
};

type PreprocessingVisualizationResult = {
    timeseries?: string | null;
    scatter?: string | null;
    cloud?: string | null;
};

export const preprocessingVisualization = async (
    data: PreprocessingVisualizationProps
): Promise<PreprocessingVisualizationResult> => {
    // The backend returns a JSON object with base64-encoded PNGs as strings (or null if not found).
    const result = await post("/preprocessing-images", data);

    if (result.success) {
        // result.data is expected to be an object with keys: timeseries, scatter, cloud
        // Each value is either a base64 string (without data URL prefix) or null
        const images: PreprocessingVisualizationResult = {};
        for (const key of ["timeseries", "scatter", "cloud"] as const) {
            const value = (result.data as Record<string, string | null>)[key];
            if (value) {
                // Add data URL prefix for rendering in <img>
                images[key] = value.startsWith("data:image/png;base64,")
                    ? value
                    : `data:image/png;base64,${value}`;
            } else {
                images[key] = null;
            }
        }
        return images;
    } else {
        throw new Error(result.error);
    }
};
