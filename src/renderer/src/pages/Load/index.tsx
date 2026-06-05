import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeading from '@renderer/components/PageHeading';
import { usePageHeader } from '@renderer/context/PageHeader';
import DynamicForm from '@renderer/components/DynamicForm';
import { ErrorNote } from '@renderer/components/StepStatus';
import { get } from '@renderer/utils/requests';

import loadSchema from '../../../../schema/load-project.schema.json';
import { PaddedContainer } from '../Create/styles';

const Load: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (formData: { project_folder?: string | string[] }) => {
    setError(null);
    const value = formData.project_folder;
    const folder = Array.isArray(value) ? value[0] : value;

    if (!folder) {
      setError('Please select a project folder.');
      return;
    }

    // Validate that the selected folder is a VAME project (has config.yaml).
    setChecking(true);
    try {
      const res = await get<{ entries: { name: string }[] }>(
        `fs/list?path=${encodeURIComponent(folder)}`
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      const hasConfig = res.data.entries.some((e) => e.name === 'config.yaml');
      if (!hasConfig) {
        setError(
          'No config.yaml found in the selected folder. Please choose a valid VAME project directory.'
        );
        return;
      }
      navigate({
        pathname: '/project',
        search: `?path=${encodeURIComponent(folder)}`,
      });
    } finally {
      setChecking(false);
    }
  };

  usePageHeader(<PageHeading title="Load an External Project" />, [])

  return (
    <PaddedContainer>
      <p>
        Select the VAME project directory — the folder that contains{' '}
        <code>config.yaml</code>.
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <DynamicForm
        schema={loadSchema as unknown as Schema}
        onFormSubmit={handleSubmit}
        submitText={checking ? 'Checking…' : 'Load Project'}
        blockSubmission={checking}
      />
    </PaddedContainer>
  );
};

export default Load;
