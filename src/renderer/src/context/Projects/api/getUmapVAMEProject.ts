import { get } from "@renderer/utils/requests";

type GetUmapVAMEProjectProps = {
    project: string;
    segmentation_algorithm: string;
};

export const getUmapVAMEProject = async ({
    project,
    segmentation_algorithm,
}: GetUmapVAMEProjectProps) => {
    // UMAP embeddings are cohort-wide (all sessions combined), so no session.
    const query = [
        `project=${encodeURIComponent(project)}`,
        `segmentation_algorithm=${encodeURIComponent(segmentation_algorithm)}`,
    ].join("&");
    const result = await get<{
        umap_images: Record<"no_label" | "motif" | "community", { filename: string; content: string }>;
    }>(`umap?${query}`);

    if (result.success) {
        return result.data.umap_images;
    }
    throw new Error(result.error);
};
