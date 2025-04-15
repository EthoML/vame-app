
import { post } from "@renderer/utils/requests"

type ConfigureProjectProps = {
    project: string
    [key: string]: any
}

export const configureVAMEProject = async (data: ConfigureProjectProps) => {
    const result = await post<ProjectType>('configure', { ...data })

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}