import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { open } from '@renderer/utils/folders';
import { post } from '@renderer/utils/requests';
import { onConnected, onProjectReady } from '@renderer/utils/vame';
import { formatDatetime } from '@renderer/utils/date';

import { useProjects } from '@renderer/context/Projects';

import Tabs from '@renderer/components/Tabs';
import Header from '@renderer/components/Header';
import { Container, HeaderButton, HeaderButtonContainer, ProjectHeader, ProjectInformation, ProjectInformationCapsule } from './styles';

import ProjectConfiguration from './Tabs/ProjectConfiguration';
import Preprocessing from './Tabs/Preprocessing';
import ModelTrainingAccordion from './Tabs/ModelTrainingAccordion';
import PoseSegmentationAccordion from './Tabs/PoseSegmentationAccordion';
import CommunityAnalysisAccordion from './Tabs/CommunityAnalysisAccordion';
import { MainContainer } from '@renderer/components/Container';
import { useSettings } from '@renderer/context/Settings';
import Report from './Tabs/Report';

const Project: React.FC = () => {

  const [searchParams] = useSearchParams();
  const projectPath = searchParams.get("path")
  const {
    getProject,
    refresh,
    configureProject,
    runPreprocessing,
  } = useProjects()

  const {
    tabsLock
  } = useSettings()

  const [project, setProject] = useState<ProjectType | undefined>()
  const [blockSubmit, setBlockSubmit] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("project-configuration");

  const navigate = useNavigate()

  // Function to handle tab submission
  const submitTab = useCallback(async (
    callback: () => Promise<void>,
    tab?: string
  ) => {
    try {
      setBlockSubmit(true)
      await callback()

      if (tab) {
        const localItem = `selected-tab-${project?.config.project_name}`
        localStorage.setItem(localItem, tab)
        setSelectedTab(tab)
      }

      await refresh()
    } catch (e) {
      console.log("[DEBUG] Error in submitTab:", e);
    } finally {
      setBlockSubmit(false);
    }
  }, [project])


  useEffect(() => {
    console.log("[DEBUG] projectPath on mount:", projectPath);
    if (projectPath) {
      onConnected(async () => {
        post('project/register', { project: projectPath }).then(res => {
          console.log("[DEBUG] post('project/register') result:", res);
          if (res.success)
            setProject(getProject(projectPath))
        })
      })

      onProjectReady(projectPath, () => {
        setBlockSubmit(false);
      })
    }
  }, [projectPath])

  useEffect(() => {
    if (project) {
      const loadedTab = localStorage.getItem(`selected-tab-${project?.config.project_name}`)
      if (loadedTab) {
        setSelectedTab(loadedTab)
      }
    }
  }, [project])

  if (!project) {
    return (
      <MainContainer>
        <div>
          <b>Loading project details...</b>
          <br />
          <small>{projectPath}</small>
        </div>
      </MainContainer>
    );
  }

  // Check if states exist and have expected properties
  const configuredState = (project.states as any)?.update_config || {};
  const preprocessingState = project.states?.preprocessing || {};
  const preprocessingVisualizationState = project.states?.preprocessing_visualization || {};
  const create_trainset = project.states?.create_trainset || {};
  const train_model = project.states?.train_model || {};
  const evaluate_model = project.states?.evaluate_model || {};
  const segment_session = project.states?.segment_session || {};
  const motif_videos = project.states?.motif_videos || {};
  const community = project.states?.community || {};
  const community_videos = project.states?.community_videos || {};
  const visualize_umap = project.states?.visualize_umap || {};

  const projectConfigured = configuredState.execution_state === "success";
  const projectPreprocessed = preprocessingState.execution_state === "success" && preprocessingVisualizationState.execution_state === "success";
  const trainsetCreated = create_trainset.execution_state === "success";
  const modelCreated = train_model.execution_state === "success";
  const modelEvaluated = evaluate_model.execution_state === "success";
  const segmented = segment_session.execution_state === "success";
  const motif_videos_created = motif_videos.execution_state === "success" && project.workflow?.motif_videos_created;
  const community_videos_created = community_videos.execution_state === "success" && project.workflow?.community_videos_created;
  const umaps_created = visualize_umap.execution_state === "success" && project.workflow?.umaps_created;

  // Create tabs with original properties but placeholder content
  const tabs = [
    {
      id: 'project-configuration',
      label: '1. Project Configuration',
      complete: projectConfigured,
      content: (() => {
        try {
          return (
            <ProjectConfiguration
              project={project}
              blockSubmission={blockSubmit}
              blockTooltip="Waiting VAME to be ready."
              onFormSubmit={async (formData) => submitTab(async () => {
                const { advanced_options, ...mainProperties } = formData as any
                await configureProject(
                  {
                    config: { ...mainProperties, ...advanced_options },
                    project: project.config.project_path
                  }).catch(e => alert(e))
              },
                'preprocessing')
              }
            />
          );
        } catch (error) {
          console.error("Error rendering ProjectConfiguration:", error);
          return (
            <div style={{ padding: 20, background: "#f5f5f5" }}>
              <h3>Project Configuration Content (Fallback)</h3>
              <p>Error rendering the ProjectConfiguration component.</p>
              <p><b>Error:</b> {String(error)}</p>
              <p><b>Original props:</b></p>
              <ul>
                <li>project: {JSON.stringify(project.config?.Project)}</li>
                <li>blockSubmission: {String(blockSubmit)}</li>
              </ul>
            </div>
          );
        }
      })()
    },
    {
      id: 'preprocessing',
      label: '2. Preprocessing',
      disabled: tabsLock && !projectConfigured,
      complete: projectPreprocessed,
      tooltip: "Finish project configuration first.",
      content: (() => {
        try {
          return (
            <Preprocessing
              project={project}
              blockSubmission={blockSubmit}
              blockTooltip="Waiting VAME to be ready."
              onFormSubmit={
                async (params) => submitTab(
                  async () => {
                    await runPreprocessing({
                      project: project.config.project_path,
                      ...params
                    });
                  },
                  'preprocessing'
                )
              }
            />
          );
        } catch (error) {
          console.error("Error rendering Preprocessing component:", error);
          return (
            <div style={{ padding: 20, background: "#f5f5f5" }}>
              <h3>Preprocessing Content (Fallback)</h3>
              <p>Error rendering the Preprocessing component.</p>
              <p><b>Error:</b> {String(error)}</p>
              <p><b>Original props:</b></p>
              <ul>
                <li>project: {JSON.stringify((project.config as any).project_name || (project.config as any).Project)}</li>
                <li>blockSubmission: {String(blockSubmit)}</li>
              </ul>
            </div>
          );
        }
      })()
    },
    {
      id: 'model-training',
      label: '3. Model Training',
      disabled: tabsLock && !projectPreprocessed,
      complete: trainsetCreated && modelCreated && modelEvaluated,
      tooltip: "Organize your project first.",
      content: (
        <ModelTrainingAccordion
          project={project}
          onFormSubmit={async () => submitTab(async () => { }, 'model-training')}
          blockSubmit={blockSubmit}
          setBlockSubmit={setBlockSubmit}
        />
      )
    },
    {
      id: 'segmentation',
      label: '4. Pose Segmentation',
      disabled: tabsLock && !modelEvaluated,
      complete: segmented,
      tooltip: "Model your project first.",
      content: (
        <PoseSegmentationAccordion
          project={project}
          blockSubmit={blockSubmit}
          setBlockSubmit={setBlockSubmit}
          onFormSubmit={async () => submitTab(async () => { }, 'segmentation')}
        />
      )
    },
    {
      id: 'community-analysis',
      label: '5. Community Analysis',
      disabled: tabsLock && !segmented,
      complete: community?.execution_state === "success",
      tooltip: "Need Pose Segmentation.",
      content: (
        <CommunityAnalysisAccordion
          project={project}
          blockSubmit={blockSubmit}
          setBlockSubmit={setBlockSubmit}
          onFormSubmit={async () => submitTab(async () => { }, 'community-analysis')}
        />
      )
    },
    {
      id: 'report',
      label: '6. Report',
      complete: umaps_created,
      disabled: tabsLock && !segmented,
      tooltip: "Need segmentation.",
      content: (
        <Report
          project={project}
          blockSubmission={blockSubmit}
          blockTooltip="Waiting VAME to be ready."
          onFormSubmit={async () => submitTab(async () => { }, 'report')}
        />
      )
    },
  ];

  return (
    <Container>
      <ProjectHeader>
        <Header title={project.config.project_name || project.config.project_path}>
          <HeaderButtonContainer>
            <HeaderButton
              onClick={() => {
                open(project.config.project_path)
              }}>
              Open in File Explorer
            </HeaderButton>
            <HeaderButton
              onClick={() => {
                navigate({
                  pathname: '/create',
                  search: `?project=${project.config.project_path}`
                })
              }}>
              Restart Project
            </HeaderButton>
          </HeaderButtonContainer>
        </Header>
        <ProjectInformation>
          <ProjectInformationCapsule>
            <small>
              <b>Creation Date: </b>
              <small>
                {project.config.creation_datetime ? formatDatetime(project.config.creation_datetime) : ""}
              </small>
            </small>
          </ProjectInformationCapsule>
          <ProjectInformationCapsule>
            <small>
              <b>Project Location</b>
              <small>
                {project.config.project_path || ""}
              </small>
            </small>
          </ProjectInformationCapsule>
          <ProjectInformationCapsule>
            <small>
              <b>VAME Version: </b>
              <small>
                {project.config.vame_version || ""}
              </small>
            </small>
          </ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>
      <Tabs
        tabs={tabs}
        selected={selectedTab}
      />
    </Container>
  );
};

export default Project;
