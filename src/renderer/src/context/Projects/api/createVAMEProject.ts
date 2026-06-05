import { post } from "@renderer/utils/requests"

export interface CreateProps {
  name: string
  source_software: string
  videos: string[]
  pes_paths: string[]
}

export interface CreateResponse {
  config: ProjectType["config"]
  created: boolean
  project: string
}

export const createVAMEProject = async ({ name, source_software, videos, pes_paths }: CreateProps) => {
  const result = await post<CreateResponse>('create', {
    project: name,
    source_software: source_software,
    videos: videos,
    poses_estimations: pes_paths,
  })

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error)
  }
}
