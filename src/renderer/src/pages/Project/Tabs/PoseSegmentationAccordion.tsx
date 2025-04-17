import React, { useState, useEffect } from "react";
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
import { segmentVAMEProject } from "../../../context/Projects/api/segmentVAMEProject";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import { createMotifVideosVAMEProject } from "../../../context/Projects/api/createMotifVideosVAMEProject";
import motifVideosSchema from "../../../../../schema/motif-videos.schema.json";

type PoseSegmentationAccordionProps = {
    project: ProjectType;
    blockSubmit: boolean;
    setBlockSubmit: (value: boolean) => void;
    onFormSubmit: () => Promise<void>;
};

const PlaceholderLog = ({ step }: { step: string }) => (
    <div
        style={{
            margin: "16px 0",
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: 6,
            color: "#888",
            fontStyle: "italic",
        }}
    >
        [Log placeholder for "{step}" step]
    </div>
);

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
                        <PlaceholderLog step="Run Segmentation" />
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
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div>
                        <DynamicForm
                            schema={motifVideosSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={motifLoading ? "Creating..." : "Create Segmented Videos"}
                            onFormSubmit={handleCreateMotifVideos}
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
                        <PlaceholderLog step="Create Segmented Videos" />
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
                    <div
                        style={{
                            margin: "16px 0",
                            padding: "12px",
                            background: "#f5f5f5",
                            borderRadius: 6,
                            color: "#888",
                            fontStyle: "italic",
                        }}
                    >
                        [Visualization placeholder — coming soon.]
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default PoseSegmentationAccordion;
