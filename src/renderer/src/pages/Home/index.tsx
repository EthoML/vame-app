import { useProjects } from '@renderer/context/Projects';
import React, { useCallback, useState } from 'react';
import { PaddedContainer } from './styles';
import { ErrorNote } from '@renderer/components/StepStatus';
import Header from '@renderer/components/Header';
import Tippy from '@tippyjs/react';
import Button from '@renderer/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import ProjectsList from './ProjectList';
import { useNavigate } from 'react-router-dom';
import SubHeader from '@renderer/components/SubHeader';

const Home: React.FC = () => {
  const { projects, recentProjects, refresh, deleteProject } = useProjects()
  const navigate = useNavigate()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const onEdit = useCallback((project: ProjectType) => {
    navigate(`project?path=${project.config.project_path}`)
  }, [])

  const onDelete = useCallback(async (project: ProjectType) => {
    setDeleteError(null)
    try {
      await deleteProject(project.config.project_path)
    } catch (e) {
      setDeleteError(
        `Could not delete "${project.config.project_name}": ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }, [])

  return (
    <PaddedContainer>

      <Header title="Projects">
        <Tippy content={<span>Refresh</span>}>
          <>
            <Button variant="icon" onClick={refresh} aria-label="Refresh projects">
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </>
        </Tippy>
      </Header>

      {deleteError && <ErrorNote>{deleteError}</ErrorNote>}

      <SubHeader title="Recents:" />

      {recentProjects && recentProjects?.length > 0 ? (
        <ProjectsList
          projects={recentProjects}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No recent projects found in the VAME Desktop output directory.</p>
      )}

      <SubHeader title="All projects:" />

      {projects && projects?.length > 0 ? (
        <ProjectsList
          projects={projects}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <p>No projects found in the VAME Desktop output directory.</p>
      )}
    </PaddedContainer>
  );
};

export default Home;
