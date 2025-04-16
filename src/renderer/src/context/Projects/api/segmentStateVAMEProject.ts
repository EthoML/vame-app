import { post } from "@renderer/utils/requests";

type SegmentStateProjectProps = {
    project: string;
    [key: string]: any;
};

export const segmentStateVAMEProject = async (data: SegmentStateProjectProps): Promise<string> => {
    const result = await post<{ segment_state: string }>("segment_state", { ...data });

    if (result.success && result.data && typeof result.data.segment_state === "string") {
        return result.data.segment_state;
    } else if (!result.success && result.error) {
        throw new Error(result.error);
    } else {
        throw new Error("Failed to get segmentation state.");
    }
};
