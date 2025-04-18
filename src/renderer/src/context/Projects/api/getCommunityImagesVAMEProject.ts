import { get } from "@renderer/utils/requests";

type GetCommunityImagesProps = {
    project: string;
    segmentation_algorithm: string;
};

export const getCommunityImagesVAMEProject = async ({
    project,
    segmentation_algorithm,
}: GetCommunityImagesProps) => {
    const query = `project=${encodeURIComponent(project)}&segmentation_algorithm=${encodeURIComponent(segmentation_algorithm)}`;
    const result = await get<{ tree_image: { filename: string; content: string } }>(`community-images?${query}`);
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
};
