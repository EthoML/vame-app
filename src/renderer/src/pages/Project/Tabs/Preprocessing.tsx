import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
} from "@renderer/components/DynamicForm/styles"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { TabProps } from "./types"

import preprocessingSchema from '../../../../../schema/preprocessing.schema.json'
import { PaddedTab } from "@renderer/components/Tabs/styles"
import Tippy from "@tippyjs/react"
import { StepBadge, ErrorNote } from "@renderer/components/StepStatus"
import Button from "@renderer/components/Button"

// Error boundary component to catch rendering errors
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ padding: 20, background: "var(--color-error-soft)", border: "1px solid var(--color-error)", borderRadius: 4 }}>
    <h3>Something went wrong in the Preprocessing component</h3>
    <p>Error: {error.message}</p>
    <p>Please check the console for more details.</p>
  </div>
)

const Preprocessing = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip,
}: TabProps) => {
  // Accordion open/close state
  const [isPreprocessingOpen, setPreprocessingOpen] = useState(false)
  const [isVisualizeOpen, setVisualizeOpen] = useState(false)

  // Check if project is preprocessed
  const preprocessingState = project.states?.preprocessing || {};
  const preprocessingVisualizationState = project.states?.preprocessing_visualization || {};
  const projectPreprocessed = preprocessingState.execution_state === "success" && preprocessingVisualizationState.execution_state === "success";

  try {
    // If keypoints is not available, create a default array with common keypoints
    let keypoints_names: string[] = []
    if (Array.isArray(project?.config?.keypoints) && project.config.keypoints.length > 0) {
      keypoints_names = project.config.keypoints
    } else {
      keypoints_names = [""]
    }

    // Clone schema with safety check
    let schema: any
    try {
      schema = structuredClone(preprocessingSchema) as unknown as Schema
    } catch (err) {
      console.error("Error cloning preprocessing schema:", err)
      schema = { properties: {} } // Fallback empty schema
    }

    // Safely set the enum values for the dropdown fields
    try {
      schema.properties.centered_reference_keypoint.enum = keypoints_names
      schema.properties.orientation_reference_keypoint.enum = keypoints_names
    } catch (err) {
      console.error("Error setting enum values:", err)
    }

    // Safely handle egocentric_data property
    try {
      if (project?.config?.egocentric_data && schema?.properties?.advanced_options) {
        delete schema.properties.advanced_options
      }
    } catch (err) {
      console.error("Error handling egocentric_data:", err)
    }

    // Initialize states with safe defaults
    let states: any = {
      // Default to first keypoint for centered and second for orientation if available
      centered_reference_keypoint: keypoints_names[0] || "",
      orientation_reference_keypoint: keypoints_names[1] || keypoints_names[0] || "",
      // Add the new boolean fields with their default values
      run_lowconf_cleaning: true,
      run_egocentric_alignment: true,
      run_outlier_cleaning: true,
      run_savgol_filtering: true,
      run_rescaling: false
    }

    const [terminal, setTerminal] = useState(false)

    // Safe form submit handler
    const handleFormSubmit = (formData: any) => {
      try {
        // Create a compatible format for the backend
        const compatibleData = {
          centered_reference_keypoint: formData?.centered_reference_keypoint || "",
          orientation_reference_keypoint: formData?.orientation_reference_keypoint || "",
          run_lowconf_cleaning: formData?.run_lowconf_cleaning !== undefined ? formData.run_lowconf_cleaning : true,
          run_egocentric_alignment: formData?.run_egocentric_alignment !== undefined ? formData.run_egocentric_alignment : true,
          run_outlier_cleaning: formData?.run_outlier_cleaning !== undefined ? formData.run_outlier_cleaning : true,
          run_savgol_filtering: formData?.run_savgol_filtering !== undefined ? formData.run_savgol_filtering : true,
          run_rescaling: formData?.run_rescaling !== undefined ? formData.run_rescaling : false
        }
        // Call the original onFormSubmit with the converted data
        onFormSubmit(compatibleData)
      } catch (err) {
        console.error("Error in form submission:", err)
        // Fallback to a minimal valid submission
        onFormSubmit({
          centered_reference_keypoint: keypoints_names[0] || "",
          orientation_reference_keypoint: keypoints_names[1] || keypoints_names[0] || "",
          run_lowconf_cleaning: true,
          run_egocentric_alignment: true,
          run_outlier_cleaning: true,
          run_savgol_filtering: true,
          run_rescaling: false
        })
      }
    }

    return (
      <PaddedTab>
        <Accordion>
          <AccordionHeader
            onClick={() => setPreprocessingOpen((v) => !v)}
          >
            2.1 Run Preprocessing
            <StepBadge state={preprocessingState.execution_state} />
            <span style={{ marginLeft: "auto" }}>
              <FontAwesomeIcon icon={isPreprocessingOpen ? faChevronUp : faChevronDown} />
            </span>
          </AccordionHeader>
          <AccordionContent $isOpen={isPreprocessingOpen}>
            <Tippy
              content={blockTooltip}
              placement="bottom"
              hideOnClick={false}
              disabled={!blockSubmission || !blockTooltip}
            >
              <>
                <DynamicForm
                  initialValues={states}
                  schema={schema}
                  blockSubmission={blockSubmission}
                  submitText="Run Preprocessing"
                  onFormSubmit={handleFormSubmit}
                  showLogsButton={true}
                  logName={["preprocessing"]}
                  projectPath={project.config.project_path}
                />
              </>
            </Tippy>
          </AccordionContent>
        </Accordion>
        <Accordion>
          <AccordionHeader
            $disabled={!projectPreprocessed}
            onClick={() => {
              if (projectPreprocessed) setVisualizeOpen((v) => !v);
            }}
          >
            2.2 Visualize Preprocessing Results
            <StepBadge state={preprocessingVisualizationState.execution_state} />
            <span style={{ marginLeft: "auto" }}>
              <FontAwesomeIcon icon={isVisualizeOpen ? faChevronUp : faChevronDown} />
            </span>
          </AccordionHeader>
          <AccordionContent $isOpen={isVisualizeOpen}>
            {/* Visualization UI */}
            <VisualizationSection project={project} />
          </AccordionContent>
        </Accordion>
      </PaddedTab>
    )
  } catch (error) {
    console.error("Error in Preprocessing component:", error)
    return <ErrorFallback error={error as Error} />
  }
}

/**
 * VisualizationSection component for session dropdown, fetch button, and image tabs.
 */
import { useState as useReactState, useContext } from "react";
import { ProjectsContext } from "../../../context/Projects";
import type { IProjectContext } from "../../../context/Projects/types";

const VisualizationSection = ({ project }: { project: any }) => {
  const { getPreprocessingVisualization } = useContext(ProjectsContext) as IProjectContext;
  const sessionNames: string[] = Array.isArray(project?.config?.session_names)
    ? project.config.session_names
    : [];
  const [selectedSession, setSelectedSession] = useReactState<string>(
    sessionNames[0] || ""
  );
  const [loading, setLoading] = useReactState(false);
  const [images, setImages] = useReactState<{
    timeseries: string | null;
    scatter: string | null;
    cloud: string | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useReactState<"timeseries" | "scatter" | "cloud">("timeseries");
  const [error, setError] = useReactState<string | null>(null);

  const handleGetImages = async () => {
    setLoading(true);
    setError(null);
    setImages(null);
    try {
      const result = await getPreprocessingVisualization({
        project: project.config.project_path,
        session_name: selectedSession,
      });
      // Ensure all keys are present and never undefined
      setImages({
        timeseries: result.timeseries ?? null,
        scatter: result.scatter ?? null,
        cloud: result.cloud ?? null,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <label htmlFor="session-select" style={{ fontWeight: 500 }}>Session:</label>
        <select
          id="session-select"
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
          style={{ minWidth: 120, padding: "4px 8px" }}
        >
          {sessionNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <Button
          onClick={handleGetImages}
          disabled={loading || !selectedSession}
          style={{ marginLeft: 8 }}
        >
          {loading ? "Loading..." : "Get Images"}
        </Button>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {images && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            {(["timeseries", "scatter", "cloud"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px",
                  borderBottom: activeTab === tab ? "2px solid var(--color-accent)" : "2px solid transparent",
                  background: "none",
                  color: activeTab === tab ? "var(--color-accent)" : "var(--color-text)",
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: "pointer"
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div
            style={{
              minHeight: 220,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-surface-sunken)",
              borderRadius: 6,
              overflow: "auto"
            }}
          >
            {images[activeTab] ? (
              <img
                src={images[activeTab]!}
                alt={`${activeTab} visualization`}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            ) : (
              <span style={{ color: "var(--color-text-muted)" }}>No image available for {activeTab}.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Preprocessing
