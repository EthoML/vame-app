import {
  createVAMEProject,
  deleteVAMEProject,
  configureVAMEProject,
  preprocessingVAMEProject,
  createTrainsetVAMEProject,
  trainVAMEProject,
  evaluateVAMEProject,
  segmentVAMEProject,
  createMotifVideosVAMEProject,
  createUMAPVisualizationVAMEProject,
  communityAnalysisVAMEProject,
  createCommunityVideosVAMEProject,
} from "./api"

export type ProjectStates = {
  preprocessing: any;
  create_trainset: any;
  evaluate_model: any;
  train_model: any;
  segment_session: any;
  motif_videos: any;
  community: any;
  community_videos: any;
  visualize_umap: any;
};

export interface Project {
  config?: any;
  assets?: any;
  videos?: string[];
  pes_paths?: string[];
  workflow?: any;
  states?: ProjectStates;
  creation_datetime?: string;
  error?: string;
}

export type IProjectContext = {
  projects: Project[]
  recentProjects: Project[]
  refresh: () => Promise<void>
  getProject: (path: string) => Project | undefined;
  getAssetsPath: (projectPath: string, asset: string, basePath?: string) => string | undefined

  createProject: typeof createVAMEProject
  deleteProject: typeof deleteVAMEProject
  configureProject: typeof configureVAMEProject

  runPreprocessing: typeof preprocessingVAMEProject

  createTrainset: typeof createTrainsetVAMEProject

  train: typeof trainVAMEProject
  evaluate: typeof evaluateVAMEProject

  segment: typeof segmentVAMEProject
  createMotifVideos: typeof createMotifVideosVAMEProject

  communityAnalysis: typeof communityAnalysisVAMEProject
  createCommunityVideos: typeof createCommunityVideosVAMEProject

  createUMAPVisualization: typeof createUMAPVisualizationVAMEProject
}
