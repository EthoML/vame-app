import { post } from "@renderer/utils/requests";

type PreprocessingProjectProps = {
    project: string;
    [key: string]: any;
};

export const preprocessingVAMEProject = async (data: PreprocessingProjectProps) => {
    const result = await post<Project>("preprocessing", { ...data });

    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.error);
    }
};