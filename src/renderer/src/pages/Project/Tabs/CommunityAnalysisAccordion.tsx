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
import communitySchema from "../../../../../schema/community.schema.json";
import communityVideosGenerateSchema from "../../../../../schema/community-videos-generate.schema.json";
import communityVideosGetSchema from "../../../../../schema/community-videos-get.schema.json";
import communityImagesGetSchema from "../../../../../schema/community-images-get.schema.json";
import { communityAnalysisVAMEProject } from "../../../context/Projects/api/communityAnalysisVAMEProject";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import { createCommunityVideosVAMEProject } from "../../../context/Projects/api/createCommunityVideosVAMEProject";
import { getCommunityVideosVAMEProject } from "../../../context/Projects/api/getCommunityVideosVAMEProject";
import { getCommunityImagesVAMEProject } from "../../../context/Projects/api/getCommunityImagesVAMEProject";

type CommunityAnalysisAccordionProps = {
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

const CommunityAnalysisAccordion = ({
    project,
    blockSubmit,
    setBlockSubmit,
    onFormSubmit,
}: CommunityAnalysisAccordionProps) => {
    const [openSteps, setOpenSteps] = useState([false, false, false, false]);
    const [communityVideosLoading, setCommunityVideosLoading] = useState(false);
    const [communityVideosError, setCommunityVideosError] = useState<string | null>(null);
    const [isPollingCommunityVideos, setIsPollingCommunityVideos] = useState(false);
    const [communityVideosState, setCommunityVideosState] = useState<string | null>(null);
    const [getLoading, setGetLoading] = useState(false);
    const [getError, setGetError] = useState<string | null>(null);
    const [communityVideos, setCommunityVideos] = useState<{ filename: string; content: string }[]>([]);
    const [communityImageLoading, setCommunityImageLoading] = useState(false);
    const [communityImageError, setCommunityImageError] = useState<string | null>(null);
    const [communityImage, setCommunityImage] = useState<{ filename: string; content: string } | null>(null);

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
                        setOpenSteps([false, false, false, false]);
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
                        setOpenSteps([false, false, false, false]);
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

    // Update schema with dynamic session options
    const getImagesSchema = {
        title: "Get Community Image",
        type: "object",
        properties: {
            segmentation_algorithm: communityImagesGetSchema.properties.segmentation_algorithm
        },
        required: ["segmentation_algorithm"]
    };

    const getVideosSchema = React.useMemo(() => {
        // Extract session names from project config
        const sessionNames = (project.config as any)?.session_names || [];

        return {
            ...communityVideosGetSchema,
            properties: {
                ...communityVideosGetSchema.properties,
                session: {
                    ...communityVideosGetSchema.properties.session,
                    enum: sessionNames,
                    enumNames: sessionNames
                }
            }
        };
    }, [project.config]);

    const handleGetCommunityImages = async (formData: any) => {
        setCommunityImageLoading(true);
        setCommunityImageError(null);
        setBlockSubmit(true);
        try {
            const data = await getCommunityImagesVAMEProject({
                project: project.config.project_path,
                segmentation_algorithm: formData.segmentation_algorithm
            });
            setCommunityImage(data.tree_image);
        } catch (err: any) {
            setCommunityImageError(err.message || "Failed to fetch image.");
        } finally {
            setCommunityImageLoading(false);
            setBlockSubmit(false);
        }
    };

    const handleGetCommunityVideos = async (formData: any) => {
        setGetLoading(true);
        setGetError(null);
        setBlockSubmit(true);
        try {
            const data = await getCommunityVideosVAMEProject({
                project: project.config.project_path,
                segmentation_algorithm: formData.segmentation_algorithm,
                session: formData.session
            });
            setCommunityVideos(data.videos);
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
            {/* Accordion 1: Run Community Analysis */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    5.1 Run Community Analysis
                    {communityAnalysisCompleted && (
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
                            schema={communitySchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={communityLoading ? "Running..." : "Run Community Analysis"}
                            onFormSubmit={handleRunCommunityAnalysis}
                            showLogsButton={true}
                            logName={["community"]}
                            projectPath={project.config.project_path}
                        />
                        {communityError && (
                            <div style={{ color: "red", marginTop: 8 }}>{communityError}</div>
                        )}
                        {(isPollingCommunity || communityState) && (
                            <div style={{ marginTop: 8 }}>
                                {isPollingCommunity && (
                                    <span style={{ color: "#888" }}>
                                        Polling community analysis state...
                                    </span>
                                )}
                                {communityState === "running" && (
                                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                                        State: <b>Running</b>
                                    </span>
                                )}
                                {communityState === "success" && (
                                    <span style={{ color: "green", marginLeft: 8 }}>
                                        State: <b>Success</b> — Community analysis completed successfully.
                                    </span>
                                )}
                                {communityState === "failed" && (
                                    <span style={{ color: "red", marginLeft: 8 }}>
                                        State: <b>Failed</b> — Community analysis failed.
                                    </span>
                                )}
                                {communityState === "aborted" && (
                                    <span style={{ color: "orange", marginLeft: 8 }}>
                                        State: <b>Aborted</b> — Community analysis was aborted.
                                    </span>
                                )}
                                {communityState === "not_found" && (
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                        State: <b>Not Found</b> — No community analysis state found.
                                    </span>
                                )}
                            </div>
                        )}
                        {communityAnalysisCompleted && (
                            <div style={{ color: "green", marginTop: 8 }}>Community analysis completed successfully.</div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Create Community Videos */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityAnalysisCompleted}
                    onClick={() => handleToggle(1, communityAnalysisCompleted)}
                >
                    5.2 Create Community Videos
                    {communityVideosCompleted && (
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
                            schema={communityVideosGenerateSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={communityVideosLoading ? "Creating..." : "Create Community Videos"}
                            onFormSubmit={handleCreateCommunityVideos}
                            showLogsButton={true}
                            logName={["community_videos"]}
                            projectPath={project.config.project_path}
                        />
                        {communityVideosError && (
                            <div style={{ color: "red", marginTop: 8 }}>{communityVideosError}</div>
                        )}
                        {(isPollingCommunityVideos || communityVideosState) && (
                            <div style={{ marginTop: 8 }}>
                                {isPollingCommunityVideos && (
                                    <span style={{ color: "#888" }}>
                                        Polling video creation state...
                                    </span>
                                )}
                                {communityVideosState === "running" && (
                                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                                        State: <b>Running</b>
                                    </span>
                                )}
                                {communityVideosState === "success" && (
                                    <span style={{ color: "green", marginLeft: 8 }}>
                                        State: <b>Success</b> — Videos created successfully.
                                    </span>
                                )}
                                {communityVideosState === "failed" && (
                                    <span style={{ color: "red", marginLeft: 8 }}>
                                        State: <b>Failed</b> — Video creation failed.
                                    </span>
                                )}
                                {communityVideosState === "aborted" && (
                                    <span style={{ color: "orange", marginLeft: 8 }}>
                                        State: <b>Aborted</b> — Video creation was aborted.
                                    </span>
                                )}
                                {communityVideosState === "not_found" && (
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                        State: <b>Not Found</b> — No video creation state found.
                                    </span>
                                )}
                            </div>
                        )}
                        {communityVideosCompleted && (
                            <div style={{ color: "green", marginTop: 8 }}>
                                Videos created successfully.
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Visualize Results - Videos */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityVideosCompleted}
                    onClick={() => handleToggle(2, communityVideosCompleted)}
                >
                    5.3 Visualize Results - Videos
                    {communityVideosCompleted && (
                        <span style={{ color: "green", marginLeft: 8, fontWeight: 700, fontSize: 18 }} title="Success">
                            ✓
                        </span>
                    )}
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
                            onFormSubmit={handleGetCommunityVideos}
                        />
                        {getError && (
                            <div style={{ color: "red", marginTop: 8 }}>{getError}</div>
                        )}
                        {communityVideos.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 240px)", gap: 12, marginTop: 12 }}>
                                {communityVideos.map(({ filename, content }) => (
                                    <VideoPlayer key={filename} filename={filename} content={content} />
                                ))}
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 4: Visualize Results - Images */}
            <Accordion>
                <AccordionHeader
                    $disabled={!communityAnalysisCompleted}
                    onClick={() => handleToggle(3, communityAnalysisCompleted)}
                >
                    5.4 Visualize Results - Images
                    {communityAnalysisCompleted && (
                        <span style={{ color: "green", marginLeft: 8, fontWeight: 700, fontSize: 18 }} title="Success">
                            ✓
                        </span>
                    )}
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[3] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[3]}>
                    <div>
                        <DynamicForm
                            schema={getImagesSchema as unknown as Schema}
                            blockSubmission={blockSubmit}
                            submitText={communityImageLoading ? "Fetching..." : "Get Image"}
                            onFormSubmit={handleGetCommunityImages}
                        />
                        {communityImageError && (
                            <div style={{ color: "red", marginTop: 8 }}>{communityImageError}</div>
                        )}
                        {communityImage && (
                            <div style={{ marginTop: 12 }}>
                                <img
                                    src={`data:image/png;base64,${communityImage.content}`}
                                    alt={communityImage.filename}
                                    style={{ maxWidth: "100%", borderRadius: 4 }}
                                />
                                <label style={{ display: "block", marginTop: 4 }}>
                                    {communityImage.filename}
                                </label>
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default CommunityAnalysisAccordion;
