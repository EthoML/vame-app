import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { PaddedTab } from '@renderer/components/Tabs/styles';
import { ErrorNote } from '@renderer/components/StepStatus';
import { get } from '@renderer/utils/requests';

interface RawDataTabProps {
    projectPath: string;
    sessionNames: string[];
}

// Input Data tab: pick a session from the list on the left, its raw-data
// summary renders on the right. Selection fetches immediately (no submit
// button); the first session is selected by default.
const RawDataTab: React.FC<RawDataTabProps> = ({ projectPath, sessionNames }) => {
    const [selectedSession, setSelectedSession] = useState<string>(sessionNames[0] || '');
    const [rawHtml, setRawHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Default to the first session once the list is available.
    useEffect(() => {
        if (!selectedSession && sessionNames.length) {
            setSelectedSession(sessionNames[0]);
        }
    }, [sessionNames, selectedSession]);

    // Fetch the selected session's raw-data preview. Cancellation guards
    // against races when the user clicks through sessions quickly.
    useEffect(() => {
        if (!selectedSession) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const url =
                    '/project/raw-data?project=' +
                    encodeURIComponent(projectPath) +
                    '&session=' +
                    encodeURIComponent(selectedSession);
                const resp = await get<{ html: string }>(url);
                if (cancelled) return;
                if (!resp.success) {
                    setError(resp.error);
                    setRawHtml('');
                } else {
                    setRawHtml(resp.data.html);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Failed to fetch raw data.');
                    setRawHtml('');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedSession, projectPath]);

    return (
        <PaddedTab>
            <Layout>
                {/* Left: session picker */}
                <SessionList role="radiogroup" aria-label="Sessions">
                    {sessionNames.length === 0 ? (
                        <Empty>No sessions found in this project.</Empty>
                    ) : (
                        sessionNames.map((session) => (
                            <SessionItem key={session} $selected={session === selectedSession}>
                                <input
                                    type="radio"
                                    name="raw-data-session"
                                    checked={session === selectedSession}
                                    onChange={() => setSelectedSession(session)}
                                />
                                <span>{session}</span>
                            </SessionItem>
                        ))
                    )}
                </SessionList>

                {/* Right: data preview for the selected session */}
                <DataPanel>
                    {loading ? (
                        <Centered>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ color: 'var(--color-accent)' }} />
                            <span>Loading {selectedSession}…</span>
                        </Centered>
                    ) : error ? (
                        <ErrorNote>{error}</ErrorNote>
                    ) : rawHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
                    ) : (
                        <Centered>
                            <span>Select a session to preview its input data.</span>
                        </Centered>
                    )}
                </DataPanel>
            </Layout>
        </PaddedTab>
    );
};

const Layout = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 0;
`;

const SessionList = styled.div`
    width: 260px;
    flex-shrink: 0;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
`;

const SessionItem = styled.label<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text);
    border-left: 2px solid ${({ $selected }) => ($selected ? 'var(--color-accent)' : 'transparent')};
    background: ${({ $selected }) => ($selected ? 'var(--color-accent-soft)' : 'transparent')};
    transition: background 0.12s;

    &:hover {
        background: ${({ $selected }) => ($selected ? 'var(--color-accent-soft)' : 'var(--color-surface-sunken)')};
    }

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const DataPanel = styled.div`
    flex: 1;
    min-width: 0;
    overflow: auto;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    padding: 12px;
`;

const Centered = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
`;

const Empty = styled.div`
    padding: 12px;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
`;

export default RawDataTab;
