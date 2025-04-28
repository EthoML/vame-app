import React, { useState, useMemo } from 'react';
import { PaddedTab } from '@renderer/components/Tabs/styles';
import DynamicForm from '@renderer/components/DynamicForm';
import { get } from '@renderer/utils/requests';

interface RawDataTabProps {
    projectPath: string;
    sessionNames: string[];
}

const RawDataTab: React.FC<RawDataTabProps> = ({ projectPath, sessionNames }) => {
    const [rawHtml, setRawHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const schema = useMemo<Schema>(() => ({
        title: 'Check Input Data',
        type: 'object',
        properties: {
            session: {
                title: 'Session',
                type: 'string',
                enum: sessionNames,
                enumNames: sessionNames,
            },
        },
        required: ['session'],
    }), [sessionNames]);

    const handleFormSubmit = async (formData: any) => {
        setLoading(true);
        setError(null);
        try {
            const url =
                '/project/raw-data?project=' +
                encodeURIComponent(projectPath) +
                '&session=' +
                encodeURIComponent(formData.session);
            const resp = await get<{ html: string }>(url);
            if (!resp.success) {
                throw new Error(resp.error);
            }
            setRawHtml(resp.data.html);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch raw data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PaddedTab style={{ height: '100%', minHeight: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                <div style={{ flex: '0 0 auto' }}>
                    <DynamicForm
                        schema={schema}
                        blockSubmission={loading}
                        submitText={loading ? 'Loading...' : 'Check Input Data'}
                        onFormSubmit={handleFormSubmit}
                    />
                </div>
                <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: 8 }}>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    {rawHtml && (
                        <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
                    )}
                </div>
            </div>
        </PaddedTab>
    );
};

export default RawDataTab;
