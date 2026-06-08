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
    const result = await get<{ tree_image: { filename: string; content: string } | null }>(`community-images?${query}`);
    if (result.success) {
        // Tree image may not exist yet — guard so a null/absent body can't crash.
        return result.data ?? { tree_image: null };
    }
    throw new Error(result.error);
};
