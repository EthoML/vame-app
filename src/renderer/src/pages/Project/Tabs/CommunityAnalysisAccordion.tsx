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
import communitySchema from "../../../../../schema/community.schema.json";
import communityVideosGenerateSchema from "../../../../../schema/community-videos-generate.schema.json";
import communityImagesGetSchema from "../../../../../schema/community-images-get.schema.json";
import { communityAnalysisVAMEProject } from "../../../context/Projects/api/communityAnalysisVAMEProject";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import { createCommunityVideosVAMEProject } from "../../../context/Projects/api/createCommunityVideosVAMEProject";
import { getCommunityVideosVAMEProject } from "../../../context/Projects/api/getCommunityVideosVAMEProject";
import { getCommunityImagesVAMEProject } from "../../../context/Projects/api/getCommunityImagesVAMEProject";
import { StepBadge, StepStateLine, ErrorNote, SuccessNote, OptionalTag } from "@renderer/components/StepStatus";
import ResultImageViewer from "@renderer/components/ResultImageViewer";
import ResultVideoViewer from "@renderer/components/ResultVideoViewer";

const ALGO_OPTIONS = communityImagesGetSchema.properties.segmentation_algorithm.enum as string[];

type CommunityAnalysisAccordionProps = {
    project: ProjectType;
    blockSubmit: boolean;
    setBlockSubmit: (value: boolean) => void;
    onFormSubmit: () => Promise<void>;
};

const CommunityAnalysisAccordion = ({
    project,
    blockSubmit,
    setBlockSubmit,
    onFormSubmit,
}: CommunityAnalysisAccordionProps) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);
    const [communityVideosLoading, setCommunityVideosLoading] = useState(false);
    const [communityVideosError, setCommunityVideosError] = useState<string | null>(null);
    const [isPollingCommunityVideos, setIsPollingCommunityVideos] = useState(false);
    const [communityVideosState, setCommunityVideosState] = useState<string | null>(null);

    const sessionNames: string[] = (project.config as any)?.session_names || [];

    // States from project
    const community_videos_session = project.states?.community_videos || {};
    const communityVideosCompleted = community_videos_session.execution_state === "success";
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communityError, setCommunityError] = useState<string | null>(null);
    const [isPollingCommunity, setIsPollingCommunity] = useState(false);
    const [communityState, setCommunityState] = useState<string | null>(null);

    // States from project
    const community_session = project.states?.community || {};
    const communityAnalysisCompleted = community_session.execution_state === "success";

    // Polling for community analysis state
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPollingCommunity) {
            interval = setInterval(async () => {
                try {
                    const projectState = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectState.states?.community?.execution_state || null;
                    setCommunityState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPollingCommunity(false);
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
    }, [isPollingCommunity, project.config.project_path, setBlockSubmit]);

    // Polling for community videos state
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPollingCommunityVideos) {
            interval = setInterval(async () => {
                try {
                    const projectState = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectState.states?.community_videos?.execution_state || null;
                    setCommunityVideosState(state);
                    if (
                        state === "success" ||
                        state === "failed" ||
                        state === "aborted" ||
                        state === "not_found"
                    ) {
                        setIsPollingCommunityVideos(false);
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
    }, [isPollingCommunityVideos, project.config.project_path, setBlockSubmit]);

    // Handle form submission for community analysis
    const handleRunCommunityAnalysis = async (formData: any) => {
        setCommunityLoading(true);
        setCommunityError(null);
        setBlockSubmit(true);
        try {
            await communityAnalysisVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            setIsPollingCommunity(true);
        } catch (err: any) {
            setCommunityError(err.message || "Failed to start community analysis.");
            setBlockSubmit(false);
        } finally {
            setCommunityLoading(false);
        }
    };

    const handleCreateCommunityVideos = async (formData: any) => {
        setCommunityVideosLoading(true);
        setCommunityVideosError(null);
        setBlockSubmit(true);
        try {
            await createCommunityVideosVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            setIsPollingCommunityVideos(true);
        } catch (err: any) {
            setCommunityVideosError(err.message || "Failed to start community video creation.");
            setBlockSubmit(false);
        } finally {
            setCommunityVideosLoading(false);
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
            {/* Accordion 1: Run Community Analysis */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    5.1 Run Community Analysis
                    <StepBadge state={community_session.execution_state} />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div>
                        <DynamicForm
                            schema={communitySchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={communityLoading ? "Running..." : "Run Community Analysis"}
                            onFormSubmit={handleRunCommunityAnalysis}
                            showLogsButton={true}
                            logName={["community"]}
                            projectPath={project.config.project_path}
                        />
                        {communityError && <ErrorNote>{communityError}</ErrorNote>}
                        <StepStateLine state={communityState} polling={isPollingCommunity} noun="Community analysis" />
                        {communityAnalysisCompleted && <SuccessNote>Community analysis completed successfully.</SuccessNote>}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Visualize Results - Images (independent of videos) */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityAnalysisCompleted}
                    onClick={() => handleToggle(1, communityAnalysisCompleted)}
                >
                    5.2 Visualize Results - Images
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <ResultImageViewer
                        open={openSteps[1]}
                        algoOptions={ALGO_OPTIONS}
                        altPrefix="Community tree"
                        emptyText="No community image available for this selection."
                        load={async ({ segmentation_algorithm }) => {
                            const data = await getCommunityImagesVAMEProject({
                                project: project.config.project_path,
                                segmentation_algorithm: segmentation_algorithm!,
                            });
                            return data?.tree_image ? `data:image/png;base64,${data.tree_image.content}` : null;
                        }}
                    />
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Create & View Community Videos (optional) */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityAnalysisCompleted}
                    onClick={() => handleToggle(2, communityAnalysisCompleted)}
                >
                    5.3 Create &amp; View Community Videos
                    <StepBadge state={community_videos_session.execution_state} />
                    <OptionalTag />
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div>
                        <DynamicForm
                            schema={communityVideosGenerateSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={communityVideosLoading ? "Creating..." : "Create Community Videos"}
                            onFormSubmit={handleCreateCommunityVideos}
                            showLogsButton={true}
                            logName={["community_videos"]}
                            projectPath={project.config.project_path}
                        />
                        {communityVideosError && <ErrorNote>{communityVideosError}</ErrorNote>}
                        <StepStateLine state={communityVideosState} polling={isPollingCommunityVideos} noun="Video creation" />
                        {communityVideosCompleted && <SuccessNote>Videos created successfully.</SuccessNote>}

                        {communityVideosCompleted && (
                            <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
                                <h3 style={{ fontSize: "var(--text-lg)", margin: 0 }}>Community videos</h3>
                                <ResultVideoViewer
                                    open={openSteps[2] && communityVideosCompleted}
                                    algoOptions={ALGO_OPTIONS}
                                    sessionOptions={sessionNames}
                                    emptyText="No community videos available for this selection."
                                    load={async ({ segmentation_algorithm, session }) => {
                                        const data = await getCommunityVideosVAMEProject({
                                            project: project.config.project_path,
                                            segmentation_algorithm: segmentation_algorithm!,
                                            session: session!,
                                        });
                                        return data.videos;
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default CommunityAnalysisAccordion;
