import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { post } from '@renderer/utils/requests';
import { onConnected, onProjectReady } from '@renderer/utils/vame';
import { formatDatetime } from '@renderer/utils/date';

import { useProjects } from '@renderer/context/Projects';

import Tabs from '@renderer/components/Tabs';
import Header from '@renderer/components/Header';
import { Container, ProjectHeader, ProjectInformation, ProjectInformationCapsule } from './styles';

import Preprocessing from './Tabs/Preprocessing';
import ModelTrainingAccordion from './Tabs/ModelTrainingAccordion';
import PoseSegmentationAccordion from './Tabs/PoseSegmentationAccordion';
import CommunityAnalysisAccordion from './Tabs/CommunityAnalysisAccordion';
import { MainContainer } from '@renderer/components/Container';
import RawDataTab from './Tabs/RawDataTab';
import Report from './Tabs/Report';

const Project: React.FC = () => {

  const [searchParams] = useSearchParams();
  const projectPath = searchParams.get("path")
  const {
    getProject,
    refresh,
    runPreprocessing,
  } = useProjects()

  const [project, setProject] = useState<ProjectType | undefined>()
  const [blockSubmit, setBlockSubmit] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("input-data");

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
      console.error("Error in submitTab:", e);
    } finally {
      setBlockSubmit(false);
    }
  }, [project])


  useEffect(() => {
    if (projectPath) {
      onConnected(async () => {
        post('project/register', { project: projectPath }).then(res => {
          if (res.success) {
            setProject(getProject(projectPath) as ProjectType);
          }
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
  const preprocessingState = project.states?.preprocessing || {};
  const preprocessingVisualizationState = project.states?.preprocessing_visualization || {};
  const create_trainset = project.states?.create_trainset || {};
  const train_model = project.states?.train_model || {};
  const evaluate_model = project.states?.evaluate_model || {};
  const segment_session = project.states?.segment_session || {};
  const community = project.states?.community || {};

  const projectPreprocessed = preprocessingState.execution_state === "success" && preprocessingVisualizationState.execution_state === "success";
  const trainsetCreated = create_trainset.execution_state === "success";
  const modelCreated = train_model.execution_state === "success";
  const modelEvaluated = evaluate_model.execution_state === "success";
  const segmented = segment_session.execution_state === "success";
  const report_session = project.states?.generate_reports || {};
  const reportCompleted = report_session.execution_state === "success";

  // A step that died (failed/aborted) surfaces a ✕ on its tab so a broken
  // stage is visible at a glance, not hidden behind an unchanged label.
  const isFailed = (s: { execution_state?: string } = {}) =>
    s.execution_state === "failed" || s.execution_state === "aborted";

  const tabs = [
    {
      id: 'input-data',
      label: '1. Input Data',
      complete: true,
      content: (() => {
        try {
          return (
            <RawDataTab
              projectPath={project.config.project_path}
              sessionNames={(project.config as any)?.session_names || []}
            />
          );
        } catch (error) {
          console.error("Error rendering ProjectConfiguration:", error);
          return (
            <div style={{ padding: 20, background: "var(--color-surface-sunken)" }}>
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
      disabled: false,
      complete: projectPreprocessed,
      failed: isFailed(preprocessingState) || isFailed(preprocessingVisualizationState),
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
            <div style={{ padding: 20, background: "var(--color-surface-sunken)" }}>
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
      disabled: !projectPreprocessed,
      complete: trainsetCreated && modelCreated && modelEvaluated,
      failed: isFailed(create_trainset) || isFailed(train_model) || isFailed(evaluate_model),
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
      disabled: !modelEvaluated,
      complete: segmented,
      failed: isFailed(segment_session),
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
      disabled: !segmented,
      complete: community?.execution_state === "success",
      failed: isFailed(community),
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
      complete: reportCompleted,
      failed: isFailed(report_session),
      disabled: !segmented,
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
        <Header title={project.config.project_name || project.config.project_path} />
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
