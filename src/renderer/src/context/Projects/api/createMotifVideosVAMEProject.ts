
import { post } from "@renderer/utils/requests"

type CreateMotifVideosProps = {
    project: string
    [key: string]: any
}

export const createMotifVideosVAMEProject = async (data: CreateMotifVideosProps) => {
    const result = await post<ProjectType>('motif-videos', { ...data })

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}