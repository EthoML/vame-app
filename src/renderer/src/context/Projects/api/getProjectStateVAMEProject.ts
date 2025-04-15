import { post } from "@renderer/utils/requests"

type GetProjectStateProps = {
    project: string
    [key: string]: any
}

export const getProjectStateVAMEProject = async (data: GetProjectStateProps) => {
    const result = await post<{ states: any }>('project/state', { ...data })

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}
