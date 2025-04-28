import { post } from "@renderer/utils/requests";

type GenerateReportVAMEProjectProps = {
    project: string;
};

export const generateReportVAMEProject = async (data: GenerateReportVAMEProjectProps) => {
    const result = await post<{ status: string }>("report", { ...data });

    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.error);
    }
};
