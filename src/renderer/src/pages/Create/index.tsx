import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import Header from '@renderer/components/Header';
import DynamicForm from '@renderer/components/DynamicForm';
import { PaddedContainer, FormOverlay } from './styles';

import { onVAMEReady } from '@renderer/utils/vame';
import { useProjects } from '@renderer/context/Projects';

import createSchema from '../../../../schema/create.schema.json';

const Create: React.FC = () => {
  const navigate = useNavigate()
  const { createProject } = useProjects()

  const [blockSubmission, setBlockSubmission] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    onVAMEReady(() => setBlockSubmission(false))
  }, [])

  const handleFormSubmit = async (formData) => {
    // Set submitting state to show overlay immediately
    setIsSubmitting(true)

    try {
      const result = await createProject(formData)

      if (!result.created) {
        setIsSubmitting(false)
        return alert('A project with this name already exists!')
      }

      // Navigate immediately to the project page
      navigate({
        pathname: "/project",
        search: `?path=${result.config.project_path}`
      });

    } catch (error) {
      setIsSubmitting(false)
      alert(error)
    }
  };

  return (
    <PaddedContainer>
      <Header title="Create a New Project" />
      <DynamicForm
        schema={createSchema as unknown as Schema}
        onFormSubmit={handleFormSubmit}
        blockSubmission={blockSubmission || isSubmitting}
        submitText='Create Project'
      />
      {isSubmitting && (
        <FormOverlay>
          <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#007bff" />
        </FormOverlay>
      )}
    </PaddedContainer>
  );
};

export default Create;
