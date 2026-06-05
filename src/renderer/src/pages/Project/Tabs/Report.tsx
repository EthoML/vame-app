import React, { useState, useEffect, useMemo } from 'react';
import { Accordion, AccordionHeader, AccordionContent } from '@renderer/components/DynamicForm/styles';
import { PaddedTab } from '@renderer/components/Tabs/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { TabProps } from './types';
import DynamicForm from '@renderer/components/DynamicForm';
import { generateReportVAMEProject } from '../../../context/Projects/api/generateReportVAMEProject';
import { getProjectStateVAMEProject } from '../../../context/Projects/api/getProjectStateVAMEProject';
import reportImagesGetSchema from "../../../../../schema/report-get-images.schema.json";
import umapImagesGetSchema from "../../../../../schema/umap-get-images.schema.json";
import { getReportVAMEProject } from '../../../context/Projects/api/getReportVAMEProject';
import { getUmapVAMEProject } from '../../../context/Projects/api/getUmapVAMEProject';
import { StepBadge, StepStateLine, ErrorNote } from '@renderer/components/StepStatus';

const Report: React.FC<TabProps> = ({
    project,
    onFormSubmit,
    blockSubmission,
    blockTooltip,
}) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);

    // Generate Report states
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [isPollingReport, setIsPollingReport] = useState(false);
    const [reportState, setReportState] = useState<string | null>(null);

    // Motif/Community image states
    const [reportImageLoading, setReportImageLoading] = useState(false);
    const [reportGetError, setReportGetError] = useState<string | null>(null);
    const [reportImage, setReportImage] = useState<{ filename: string; content: string } | null>(null);

    // UMAP image states
    const [umapLoading, setUmapLoading] = useState(false);
    const [umapError, setUmapError] = useState<string | null>(null);
    const [umapImages, setUmapImages] = useState<{
        no_label?: { filename: string; content: string };
        motif?: { filename: string; content: string };
        community?: { filename: string; content: string };
    } | null>(null);
    const [umapTab, setUmapTab] = useState<'no_label' | 'motif' | 'community'>('no_label');

    const reportSession = project.states?.generate_reports || {};
    const reportCompleted = reportSession.execution_state === 'success';

    const handleToggle = (idx: number) => {
        setOpenSteps((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    // 1. Generate Report
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
                    if (['success', 'failed', 'aborted', 'not_found'].includes(state!)) {
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
        return () => { if (interval) clearInterval(interval); };
    }, [isPollingReport, project.config.project_path, onFormSubmit]);

    // Schema for Report image GET
    const getReportSchema = useMemo(() => {
        const sessionNames = (project.config as any)?.session_names || [];
        return {
            ...reportImagesGetSchema,
            properties: {
                segmentation_algorithm: reportImagesGetSchema.properties.segmentation_algorithm,
                session: {
                    ...reportImagesGetSchema.properties.session,
                    enum: sessionNames,
                    enumNames: sessionNames,
                },
            },
        };
    }, [project.config]);

    // Handler for motif/community GET
    const handleGetReport = async (formData: any) => {
        setReportImageLoading(true);
        setReportGetError(null);
        try {
            const image = await getReportVAMEProject({
                project: project.config.project_path,
                segmentation_algorithm: formData.segmentation_algorithm,
                session: formData.session,
            });
            setReportImage(image);
        } catch (err: any) {
            setReportGetError(err.message || 'Failed to fetch report image.');
        } finally {
            setReportImageLoading(false);
        }
    };

    // Schema for UMAP GET
    const getUmapSchema = useMemo(() => {
        const sessionNames = (project.config as any)?.session_names || [];
        return {
            ...umapImagesGetSchema,
            properties: {
                segmentation_algorithm: umapImagesGetSchema.properties.segmentation_algorithm,
                session: {
                    ...umapImagesGetSchema.properties.session,
                    enum: sessionNames,
                    enumNames: sessionNames,
                },
            },
        };
    }, [project.config]);

    // Handler for UMAP GET
    const handleGetUmap = async (formData: any) => {
        setUmapLoading(true);
        setUmapError(null);
        setUmapImages(null);
        try {
            const images = await getUmapVAMEProject({
                project: project.config.project_path,
                segmentation_algorithm: formData.segmentation_algorithm,
                session: formData.session,
            });
            setUmapImages(images);
        } catch (err: any) {
            setUmapError(err.message || 'Failed to fetch UMAP images.');
        } finally {
            setUmapLoading(false);
        }
    };

    return (
        <PaddedTab>
            {/* Accordion 1: Generate Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(0)}>
                    5.1 Generate Report
                    <StepBadge state={reportSession.execution_state} />
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <DynamicForm
                        schema={{ title: 'Generate Report', type: 'object', properties: {}, required: [] }}
                        blockSubmission={blockSubmission || reportLoading || isPollingReport}
                        submitText={reportLoading ? 'Generating...' : 'Generate Report'}
                        onFormSubmit={handleGenerateReport}
                        showLogsButton={true}
                        logName={["report"]}
                        projectPath={project.config.project_path}
                    />
                    {reportError && <ErrorNote>{reportError}</ErrorNote>}
                    <StepStateLine state={reportState} polling={isPollingReport} noun="Report generation" />
                </AccordionContent>
            </Accordion>

            {/* Accordion 2: Visualize Motif/Community Report */}
            <Accordion>
                <AccordionHeader $disabled={!reportCompleted} onClick={() => handleToggle(1)}>
                    5.2 Visualize Motif/Community Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <DynamicForm
                        schema={getReportSchema as unknown as Schema}
                        blockSubmission={blockSubmission || reportImageLoading}
                        submitText={reportImageLoading ? "Fetching..." : "Get Image"}
                        onFormSubmit={handleGetReport}
                    />
                    {reportGetError && <ErrorNote>{reportGetError}</ErrorNote>}
                    {reportImage && (
                        <div style={{ marginTop: 12 }}>
                            <img
                                src={`data:image/png;base64,${reportImage.content}`}
                                alt={reportImage.filename}
                                style={{ maxWidth: "100%", borderRadius: 4 }}
                            />
                            <label style={{ display: "block", marginTop: 4 }}>{reportImage.filename}</label>
                        </div>
                    )}
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Visualize UMAP Report */}
            <Accordion>
                <AccordionHeader $disabled={!reportCompleted} onClick={() => handleToggle(2)}>
                    5.3 Visualize UMAP Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <DynamicForm
                        schema={getUmapSchema as unknown as Schema}
                        blockSubmission={blockSubmission || umapLoading}
                        submitText={umapLoading ? "Fetching..." : "Get Images"}
                        onFormSubmit={handleGetUmap}
                    />
                    {umapError && <ErrorNote>{umapError}</ErrorNote>}
                    {umapImages && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                {(['no_label', 'motif', 'community'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setUmapTab(tab)}
                                        style={{
                                            padding: '6px 16px',
                                            borderBottom: umapTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                                            background: 'none',
                                            color: umapTab === tab ? 'var(--color-accent)' : 'var(--color-text)',
                                            fontWeight: umapTab === tab ? 600 : 400,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tab === 'no_label' ? 'No Labels' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div style={{
                                minHeight: 220,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--color-surface-sunken)',
                                borderRadius: 6,
                                overflow: 'auto'
                            }}>
                                {umapImages[umapTab] ? (
                                    <img
                                        src={`data:image/png;base64,${umapImages[umapTab]!.content}`}
                                        alt={umapImages[umapTab]!.filename}
                                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <span style={{ color: 'var(--color-text-muted)' }}>No image available for {umapTab}.</span>
                                )}
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default Report;
