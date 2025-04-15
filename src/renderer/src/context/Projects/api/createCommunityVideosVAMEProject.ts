
import { post } from "@renderer/utils/requests"

type CreateCommunityVideosProps = {
  project: string
  [key: string]: any
}

export const createCommunityVideosVAMEProject = async (data: CreateCommunityVideosProps) => {
  const result = await post<ProjectType>('community_videos', { ...data })

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error)
  }
}