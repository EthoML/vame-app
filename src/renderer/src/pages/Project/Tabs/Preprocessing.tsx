import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import TerminalModal from "../../../components/TerminalModal"
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
} from "@renderer/components/DynamicForm/styles"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { TabProps } from "./types"

import preprocessingSchema from '../../../../../schema/preprocessing.schema.json'
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import Tippy from "@tippyjs/react"

// Error boundary component to catch rendering errors
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ padding: 20, background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 4 }}>
    <h3>Something went wrong in the Preprocessing component</h3>
    <p>Error: {error.message}</p>
    <p>Please check the console for more details.</p>
  </div>
)

const Preprocessing = ({
  project,
  onFormSubmit,
  blockSubmission = false,
  blockTooltip,
}: TabProps) => {
  // Accordion open/close state
  const [isPreprocessingOpen, setPreprocessingOpen] = useState(true)
  const [isVisualizeOpen, setVisualizeOpen] = useState(false)
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

    // Safely get organized state
    const isOrganized = !!project?.workflow?.organized

    // // Set up operations with safety checks
    // const operations = ["Create Training Set"]
    // if (project?.config && !project.config.egocentric_data) {
    //   operations.unshift("Align Data")
    // }

    // Safely handle egocentric_data property
    try {
      if (project?.config?.egocentric_data && schema?.properties?.advanced_options) {
        delete schema.properties.advanced_options
      }
    } catch (err) {
      console.error("Error handling egocentric_data:", err)
    }

    // Safely set readOnly property
    try {
      if (isOrganized && schema?.properties) {
        Object.values(schema.properties).forEach((v: any) => {
          if (v) v.readOnly = true
        })
      }
    } catch (err) {
      console.error("Error setting readOnly:", err)
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
          <AccordionHeader onClick={() => setPreprocessingOpen((v) => !v)}>
            Run Preprocessing
            <span style={{ marginLeft: "auto" }}>
              <FontAwesomeIcon icon={isPreprocessingOpen ? faChevronUp : faChevronDown} />
            </span>
          </AccordionHeader>
          <AccordionContent $isOpen={isPreprocessingOpen}>
            <div
              style={{
                marginBottom: "20px",
                background: "transparent",
                padding: "12px 16px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              Open logs:{" "}
              <ControlButton onClick={() => setTerminal(true)} style={{ marginLeft: 8 }}>
                <FontAwesomeIcon icon={faTerminal} />
              </ControlButton>
            </div>

            <TerminalModal
              projectPath={project.config.project_path}
              logName={["egocentric_alignment", "create_trainset"]}
              isOpen={terminal}
              onClose={() => setTerminal(false)}
            />

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
                />
              </>
            </Tippy>
          </AccordionContent>
        </Accordion>
        <Accordion>
          <AccordionHeader onClick={() => setVisualizeOpen((v) => !v)}>
            Visualize Preprocessing Results
            <span style={{ marginLeft: "auto" }}>
              <FontAwesomeIcon icon={isVisualizeOpen ? faChevronUp : faChevronDown} />
            </span>
          </AccordionHeader>
          <AccordionContent $isOpen={isVisualizeOpen}>
            {/* Placeholder for visualization content */}
            Visualization content goes here.
          </AccordionContent>
        </Accordion>
      </PaddedTab>
    )
  } catch (error) {
    console.error("Error in Preprocessing component:", error)
    return <ErrorFallback error={error as Error} />
  }
}

export default Preprocessing
