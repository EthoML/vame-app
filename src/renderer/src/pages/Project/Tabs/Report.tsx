import React, { useState, useEffect } from 'react';
import { Accordion, AccordionHeader, AccordionContent } from '@renderer/components/DynamicForm/styles';
import { PaddedTab } from '@renderer/components/Tabs/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { TabProps } from './types';
import DynamicForm from '@renderer/components/DynamicForm';
import { generateReportVAMEProject } from '../../../context/Projects/api/generateReportVAMEProject';
import { getProjectStateVAMEProject } from '../../../context/Projects/api/getProjectStateVAMEProject';

const Report: React.FC<TabProps> = ({
    project,
    onFormSubmit,
    blockSubmission,
    blockTooltip,
}) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);

    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [isPollingReport, setIsPollingReport] = useState(false);
    const [reportState, setReportState] = useState<string | null>(null);

    const reportSession = project.states?.generate_reports || {};
    const reportCompleted = reportSession.execution_state === 'success';

    const handleToggle = (idx: number) => {
        setOpenSteps((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    // prevent unused variable warnings for placeholder component
    void project;
    void onFormSubmit;
    void blockSubmission;
    void blockTooltip;

    const handleGenerateReport = async () => {
        setReportLoading(true);
        setReportError(null);
        try {
            await generateReportVAMEProject({ project: project.config.project_path });
            setIsPollingReport(true);
        } catch (err: any) {
            setReportError(err.message || 'Failed to start report generation.');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPollingReport) {
            interval = setInterval(async () => {
                try {
                    const state = (
                        await getProjectStateVAMEProject({ project: project.config.project_path })
                    ).states?.generate_reports?.execution_state || null;
                    setReportState(state);
                    if (
                        state === 'success' ||
                        state === 'failed' ||
                        state === 'aborted' ||
                        state === 'not_found'
                    ) {
                        if (interval) clearInterval(interval);
                        setIsPollingReport(false);
                        await onFormSubmit({});
                        setOpenSteps([false, false, false]);
                    }
                } catch {
                    if (interval) clearInterval(interval);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPollingReport, project.config.project_path, onFormSubmit]);

    return (
        <PaddedTab>
            {/* Accordion 1: Generate Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(0)}>
                    1. Generate Report
                    {reportCompleted && (
                        <span style={{ color: 'green', marginLeft: 8, fontWeight: 700, fontSize: 18 }} title="Success">
                            ✓
                        </span>
                    )}
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <>
                        <DynamicForm
                            schema={{ title: 'Generate Report', type: 'object', properties: {}, required: [] }}
                            blockSubmission={blockSubmission || reportLoading || isPollingReport}
                            submitText={reportLoading ? 'Generating...' : 'Generate Report'}
                            onFormSubmit={handleGenerateReport}
                        />
                        {reportError && (
                            <div style={{ color: 'red', marginTop: 8 }}>{reportError}</div>
                        )}
                        {(isPollingReport || reportState) && (
                            <div style={{ marginTop: 8 }}>
                                {isPollingReport && (
                                    <span style={{ color: '#888' }}>
                                        Polling report state…
                                    </span>
                                )}
                                {reportState === 'running' && (
                                    <span style={{ color: '#007bff', marginLeft: 8 }}>
                                        State: <b>Running</b>
                                    </span>
                                )}
                                {reportState === 'success' && (
                                    <span style={{ color: 'green', marginLeft: 8 }}>
                                        State: <b>Success</b> — Report generated successfully.
                                    </span>
                                )}
                                {reportState === 'failed' && (
                                    <span style={{ color: 'red', marginLeft: 8 }}>
                                        State: <b>Failed</b> — Report generation failed.
                                    </span>
                                )}
                                {reportState === 'aborted' && (
                                    <span style={{ color: 'orange', marginLeft: 8 }}>
                                        State: <b>Aborted</b> — Report was aborted.
                                    </span>
                                )}
                                {reportState === 'not_found' && (
                                    <span style={{ color: '#888', marginLeft: 8 }}>
                                        State: <b>Not Found</b> — No report generation state found.
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                </AccordionContent>
            </Accordion>

            {/* Accordion 2: Visualize Motif/Community Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(1)}>
                    2. Visualize Motif/Community Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div style={{ padding: 20 }}>
                        Motif/Community report visualization placeholder content.
                    </div>
                </AccordionContent>
            </Accordion>

            {/* Accordion 3. Visualize UMAP Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(2)}>
                    3. Visualize UMAP Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div style={{ padding: 20 }}>
                        UMAP report visualization placeholder content.
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default Report;
