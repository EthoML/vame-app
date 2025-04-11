import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import TerminalModal from "../../../components/TerminalModal"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
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
  try {
    // If keypoints_names is not available, create a default array with common keypoints
    let keypoints_names: string[] = []
    if (Array.isArray(project?.workflow?.keypoints_names) && project.workflow.keypoints_names.length > 0) {
      keypoints_names = project.workflow.keypoints_names
    } else {
      // Create default keypoint names if none are available
      keypoints_names = ["Nose", "Left Ear", "Right Ear", "Left Shoulder", "Right Shoulder", "Tail"]
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
      // Make sure we have a valid schema structure
      if (!schema.properties) {
        schema.properties = {}
      }

      // Create the properties if they don't exist
      if (!schema.properties.centered_reference_keypoint) {
        schema.properties.centered_reference_keypoint = {
          type: "string",
          title: "Centered Reference Keypoint",
          description: "Select the keypoint for centering."
        }
      }

      if (!schema.properties.orientation_reference_keypoint) {
        schema.properties.orientation_reference_keypoint = {
          type: "string",
          title: "Orientation Reference Keypoint",
          description: "Select the keypoint for orientation."
        }
      }

      // Set the enum values
      schema.properties.centered_reference_keypoint.enum = keypoints_names
      schema.properties.orientation_reference_keypoint.enum = keypoints_names
    } catch (err) {
      console.error("Error setting enum values:", err)
    }

    // Safely get organized state
    const isOrganized = !!project?.workflow?.organized

    // Set up operations with safety checks
    const operations = ["Create Training Set"]
    if (project?.config && !project.config.egocentric_data) {
      operations.unshift("Align Data")
    }

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

    // Safely extract alignment data with fallbacks
    const alignment = project?.states?.["egocentric_alignment"] || {}
    const pose_ref_index = Array.isArray(alignment.pose_ref_index) ? alignment.pose_ref_index : undefined

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

    // If we have old pose_ref_index data and keypoints, try to map them
    try {
      if (pose_ref_index && pose_ref_index.length >= 2 && keypoints_names.length > 0) {
        // Map numeric indices to keypoint names if possible
        const index1 = pose_ref_index[0]
        const index2 = pose_ref_index[1]

        if (typeof index1 === 'number' && index1 >= 0 && index1 < keypoints_names.length) {
          states.centered_reference_keypoint = keypoints_names[index1]
        }

        if (typeof index2 === 'number' && index2 >= 0 && index2 < keypoints_names.length) {
          states.orientation_reference_keypoint = keypoints_names[index2]
        }
      }
    } catch (err) {
      console.error("Error mapping pose_ref_index to keypoint names:", err)
    }

    const [terminal, setTerminal] = useState(false)

    // Safe form submit handler
    const handleFormSubmit = (formData: any) => {
      try {
        // Convert the dropdown selections back to pose_ref_index array format
        const centered = formData?.centered_reference_keypoint || ""
        const orientation = formData?.orientation_reference_keypoint || ""

        // Find indices of the selected keypoints with safety checks
        const centeredIndex = keypoints_names.indexOf(centered)
        const orientationIndex = keypoints_names.indexOf(orientation)

        // Create a compatible format for the backend
        const compatibleData = {
          pose_ref_index: [
            centeredIndex >= 0 ? centeredIndex : 0,
            orientationIndex >= 0 ? orientationIndex : (keypoints_names.length > 1 ? 1 : 0)
          ],
          // Include the new boolean fields
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
          pose_ref_index: [0, 0],
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
        <div style={{ marginBottom: '20px' }}>
          Open logs:{" "}
          <ControlButton onClick={() => setTerminal(true)}>
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
              submitText={operations.join(" + ")}
              onFormSubmit={handleFormSubmit}
            />
          </>
        </Tippy>
      </PaddedTab>
    )
  } catch (error) {
    console.error("Error in Preprocessing component:", error)
    return <ErrorFallback error={error as Error} />
  }
}

export default Preprocessing
