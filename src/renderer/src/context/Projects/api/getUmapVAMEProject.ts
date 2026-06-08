import { get } from "@renderer/utils/requests";

type GetUmapVAMEProjectProps = {
    project: string;
    segmentation_algorithm: string;
};

// Returns the backend-relative URL of the interactive UMAP HTML (Plotly figure),
// or null if it hasn't been generated yet.
export const getUmapVAMEProject = async ({
    project,
    segmentation_algorithm,
}: GetUmapVAMEProjectProps): Promise<string | null> => {
    // UMAP embeddings are cohort-wide (all sessions combined), so no session.
    const query = [
        `project=${encodeURIComponent(project)}`,
        `segmentation_algorithm=${encodeURIComponent(segmentation_algorithm)}`,
    ].join("&");
    const result = await get<{ umap_html_url: string | null }>(`umap?${query}`);

    if (result.success) {
        // Guard against an empty/absent body while the report task is still running.
        return result.data?.umap_html_url ?? null;
    }
    throw new Error(result.error);
};
