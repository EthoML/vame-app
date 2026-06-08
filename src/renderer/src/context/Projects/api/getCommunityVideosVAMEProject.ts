import { get } from "@renderer/utils/requests";

type GetSegmentVideosProps = {
    project: string;
    segmentation_algorithm: string;
    session: string;
};

export const getCommunityVideosVAMEProject = async ({ project, segmentation_algorithm, session }: GetSegmentVideosProps) => {
    const query = `project=${encodeURIComponent(project)}&segmentation_algorithm=${encodeURIComponent(segmentation_algorithm)}&session=${encodeURIComponent(session)}`;
    const result = await get<{ videos: { filename: string; url: string }[] }>(`community-videos?${query}`);
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
};
