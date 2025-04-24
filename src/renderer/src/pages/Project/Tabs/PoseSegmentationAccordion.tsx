import React, { useState, useEffect, useMemo, useRef, memo } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionContent,
} from "@renderer/components/DynamicForm/styles";
import { PaddedTab } from "@renderer/components/Tabs/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import DynamicForm from "@renderer/components/DynamicForm";
import poseSegmentationSchema from "../../../../../schema/pose-segmentation.schema.json";
import motifVideosGenerateSchema from "../../../../../schema/motif-videos-generate.schema.json";
import motifVideosGetSchema from "../../../../../schema/motif-videos-get.schema.json";
import { segmentVAMEProject } from "../../../context/Projects/api/segmentVAMEProject";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import { createMotifVideosVAMEProject } from "../../../context/Projects/api/createMotifVideosVAMEProject";
import { getSegmentVideosVAMEProject } from "../../../context/Projects/api/getSegmentVideosVAMEProject";

type PoseSegmentationAccordionProps = {
    project: ProjectType;
    blockSubmit: boolean;
    setBlockSubmit: (value: boolean) => void;
    onFormSubmit: () => Promise<void>;
};

// Create a separate component for each video
const VideoPlayer = memo(({ content, filename }: { content: string; filename: string }) => {
    // Create blob URL from base64 content
    const blobUrl = useMemo(() => {
        const binaryString = atob(content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'video/mp4' });
        return URL.createObjectURL(blob);
    }, [content]);

    // Use ref for video element
    const videoRef = useRef<HTMLVideoElement>(null);

    // Clean up blob URL when component unmounts
    useEffect(() => {
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [blobUrl]);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <video
                ref={videoRef}
                controls
                src={blobUrl}
                style={{ width: "100%", borderRadius: 4 }}
            />
            <label style={{ marginTop: 4 }}>{filename}</label>
        </div>
    );
});

const PoseSegmentationAccordion = ({
    project,
    blockSubmit,
    setBlockSubmit,
    onFormSubmit,
}: PoseSegmentationAccordionProps) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);
    const [motifLoading, setMotifLoading] = useState(false);
    const [motifError, setMotifError] = useState<string | null>(null);
    const [isPollingMotif, setIsPollingMotif] = useState(false);
    const [motifState, setMotifState] = useState<string | null>(null);
    const [getLoading, setGetLoading] = useState(false);
    const [getError, setGetError] = useState<string | null>(null);
    const [segmentVideos, setSegmentVideos] = useState<{ filename: string; content: string }[]>([]);

    // States from project
    const motif_session = project.states?.motif_videos || {};
    const motifCompleted = motif_session.execution_state === "success";
    const [segmentationLoading, setSegmentationLoading] = useState(false);
    const [segmentationError, setSegmentationError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [segmentationState, setSegmentationState] = useState<string | null>(null);

    // States from project
    const segment_session = project.states?.segment_session || {};
    const segmented = segment_session.execution_state === "success";

    // Polling for segmentation state
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPolling) {
            interval = setInterval(async () => {
                try {
                    const projectState = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectState.states?.segment_session?.execution_state || null;
                    setSegmentationState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPolling(false);
                        try {
                            await onFormSubmit();
                        } catch (e) {
                            console.error("Error calling onFormSubmit:", e);
                        }
                        setBlockSubmit(false);
                        setOpenSteps([false, false, false]);
                    }
                } catch (err) {
                    console.error("Error during polling:", err);
                    setBlockSubmit(false);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolling, project.config.project_path, setBlockSubmit]);

    // Polling for motif videos state
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPollingMotif) {
            interval = setInterval(async () => {
                try {
                    const projectState = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectState.states?.motif_videos?.execution_state || null;
                    setMotifState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPollingMotif(false);
                        try {
                            await onFormSubmit();
                        } catch (e) {
                            console.error("Error calling onFormSubmit:", e);
                        }
                        setBlockSubmit(false);
                        setOpenSteps([false, false, false]);
                    }
                } catch (err) {
                    console.error("Error during polling videos:", err);
                    setBlockSubmit(false);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPollingMotif, project.config.project_path, setBlockSubmit]);

    // Handle form submission for segmentation
    const handleRunSegmentation = async (formData: any) => {
        setSegmentationLoading(true);
        setSegmentationError(null);
        setBlockSubmit(true);
        try {
            await segmentVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            setIsPolling(true);
        } catch (err: any) {
            setSegmentationError(err.message || "Failed to start segmentation.");
            setBlockSubmit(false);
        } finally {
            setSegmentationLoading(false);
        }
    };

    const handleCreateMotifVideos = async (formData: any) => {
        setMotifLoading(true);
        setMotifError(null);
        setBlockSubmit(true);
        try {
            await createMotifVideosVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            setIsPollingMotif(true);
        } catch (err: any) {
            setMotifError(err.message || "Failed to start video creation.");
            setBlockSubmit(false);
        } finally {
            setMotifLoading(false);
        }
    };

    // Update schema with dynamic session options
    const getVideosSchema = React.useMemo(() => {
        // Extract session names from project config
        const sessionNames = project.config?.session_names ||
            (project.config as any)?.session_names ||
            [];

        return {
            ...motifVideosGetSchema,
            properties: {
                ...motifVideosGetSchema.properties,
                session: {
                    ...motifVideosGetSchema.properties.session,
                    enum: sessionNames,
                    enumNames: sessionNames
                }
            }
        };
    }, [project.config]);

    const handleGetSegmentVideos = async (formData: any) => {
        setGetLoading(true);
        setGetError(null);
        setBlockSubmit(true);
        try {
            const data = await getSegmentVideosVAMEProject({
                project: project.config.project_path,
                segmentation_algorithm: formData.segmentation_algorithm,
                session: formData.session
            });
            setSegmentVideos(data.videos);
        } catch (err: any) {
            setGetError(err.message || "Failed to fetch videos.");
        } finally {
            setGetLoading(false);
            setBlockSubmit(false);
        }
    };

    // Toggle handler for accordions
    const handleToggle = (idx: number, enabled: boolean) => {
        if (!enabled) return;
        setOpenSteps((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    return (
        <PaddedTab>
            {/* Accordion 1: Run Segmentation */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    1. Run Segmentation
                    {segmented && (
                        <span style={{ color: "green", marginLeft: 8, fontWeight: 700, fontSize: 18 }} title="Success">
                            ✓
                        </span>
                    )}
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={poseSegmentationSchema as Schema}
                            blockSubmission={blockSubmit}
                            submitText={segmentationLoading ? "Running..." : "Run Segmentation"}
                            onFormSubmit={handleRunSegmentation}
                            showLogsButton={true}
                            logName={["pose_segmentation"]}
                            projectPath={project.config.project_path}
                        />
                        {segmentationError && (
                            <div style={{ color: "red", marginTop: 8 }}>{segmentationError}</div>
                        )}
                        {(isPolling || segmentationState) && (
                            <div style={{ marginTop: 8 }}>
                                {isPolling && (
                                    <span style={{ color: "#888" }}>
                                        Polling segmentation state...
                                    </span>
                                )}
                                {segmentationState === "running" && (
                                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                                        State: <b>Running</b>
                                    </span>
                                )}
                                {segmentationState === "success" && (
                                    <span style={{ color: "green", marginLeft: 8 }}>
                                        State: <b>Success</b> — Segmentation completed successfully.
                                    </span>
                                )}
                                {segmentationState === "failed" && (
                                    <span style={{ color: "red", marginLeft: 8 }}>
                                        State: <b>Failed</b> — Segmentation failed.
                                    </span>
                                )}
                                {segmentationState === "aborted" && (
                                    <span style={{ color: "orange", marginLeft: 8 }}>
                                        State: <b>Aborted</b> — Segmentation was aborted.
                                    </span>
                                )}
                                {segmentationState === "not_found" && (
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                        State: <b>Not Found</b> — No segmentation state found.
                                    </span>
                                )}
                            </div>
                        )}
                        {segmented && (
                            <div style={{ color: "green", marginTop: 8 }}>Segmentation completed successfully.</div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 1: Run Segmentation */}
            <Accordion>
                <AccordionHeader
                    $disabled={!segmented}
                    onClick={() => handleToggle(1, segmented)}
                >
                    2. Create Segmented Videos
                    {motifCompleted && (
                        <span style={{ color: "green", marginLeft: 8, fontWeight: 700, fontSize: 18 }} title="Success">
                            ✓
                        </span>
                    )}
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div>
                        <DynamicForm
                            schema={motifVideosGenerateSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={motifLoading ? "Creating..." : "Create Segmented Videos"}
                            onFormSubmit={handleCreateMotifVideos}
                            showLogsButton={true}
                            logName={["motif_videos"]}
                            projectPath={project.config.project_path}
                        />
                        {motifError && (
                            <div style={{ color: "red", marginTop: 8 }}>{motifError}</div>
                        )}
                        {(isPollingMotif || motifState) && (
                            <div style={{ marginTop: 8 }}>
                                {isPollingMotif && (
                                    <span style={{ color: "#888" }}>
                                        Polling video creation state...
                                    </span>
                                )}
                                {motifState === "running" && (
                                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                                        State: <b>Running</b>
                                    </span>
                                )}
                                {motifState === "success" && (
                                    <span style={{ color: "green", marginLeft: 8 }}>
                                        State: <b>Success</b> — Videos created successfully.
                                    </span>
                                )}
                                {motifState === "failed" && (
                                    <span style={{ color: "red", marginLeft: 8 }}>
                                        State: <b>Failed</b> — Video creation failed.
                                    </span>
                                )}
                                {motifState === "aborted" && (
                                    <span style={{ color: "orange", marginLeft: 8 }}>
                                        State: <b>Aborted</b> — Video creation was aborted.
                                    </span>
                                )}
                                {motifState === "not_found" && (
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                        State: <b>Not Found</b> — No video creation state found.
                                    </span>
                                )}
                            </div>
                        )}
                        {motifCompleted && (
                            <div style={{ color: "green", marginTop: 8 }}>
                                Videos created successfully.
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Visualize Results */}
            <Accordion>
                <AccordionHeader
                    $disabled={!motifCompleted}
                    onClick={() => handleToggle(2, motifCompleted)}
                >
                    3. Visualize Results
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div>
                        <DynamicForm
                            schema={getVideosSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={getLoading ? "Fetching..." : "Get Videos"}
                            onFormSubmit={handleGetSegmentVideos}
                        />
                        {getError && (
                            <div style={{ color: "red", marginTop: 8 }}>{getError}</div>
                        )}
                        {segmentVideos.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 240px)", gap: 12, marginTop: 12 }}>
                                {segmentVideos.map(({ filename, content }) => (
                                    <VideoPlayer key={filename} filename={filename} content={content} />
                                ))}
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default PoseSegmentationAccordion;
