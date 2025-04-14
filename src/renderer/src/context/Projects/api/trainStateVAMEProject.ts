import { post } from "@renderer/utils/requests";

type TrainStateProps = {
    project: string;
    [key: string]: any;
};

export const getTrainStateVAMEProject = async (data: TrainStateProps) => {
    const result = await post<{ train_model: any }>("train_state", { ...data });

    if (result.success) {
        return result.data.train_model;
    } else {
        throw new Error(result.error);
    }
};
