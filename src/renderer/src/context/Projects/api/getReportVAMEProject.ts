import { get } from "@renderer/utils/requests";

type GetReportVAMEProjectProps = {
    project: string;
    segmentation_algorithm: string;
    session: string;
};

export const getReportVAMEProject = async ({
    project,
    segmentation_algorithm,
    session,
}: GetReportVAMEProjectProps) => {
    const query = [
        `project=${encodeURIComponent(project)}`,
        `segmentation_algorithm=${encodeURIComponent(segmentation_algorithm)}`,
        `session=${encodeURIComponent(session)}`,
    ].join("&");
    const result = await get<{ report_image: { filename: string; content: string } }>(
        `report?${query}`
    );

    if (result.success) {
        return result.data.report_image;
    }
    throw new Error(result.error);
};
