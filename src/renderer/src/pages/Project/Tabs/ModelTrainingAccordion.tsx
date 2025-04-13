import React, { useState } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionContent,
} from "@renderer/components/DynamicForm/styles";
import { PaddedTab } from "@renderer/components/Tabs/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import DynamicForm from "@renderer/components/DynamicForm";
import { createTrainsetVAMEProject } from "../../../context/Projects/api/createTrainsetVAMEProject";
import createTrainsetSchema from '../../../../../schema/create-trainset.schema.json';
import trainModelSchema from '../../../../../schema/train-model.schema.json';

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

type ModelTrainingAccordionProps = {
    project: any;
};


const ModelTrainingAccordion = ({ project }: ModelTrainingAccordionProps) => {
    // Independent open/close state for each accordion
    const [openSteps, setOpenSteps] = useState([true, false, false, false]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Train Model form state
    const [trainLoading, setTrainLoading] = useState(false);
    const [trainError, setTrainError] = useState<string | null>(null);
    const [trainSuccess, setTrainSuccess] = useState<string | null>(null);

    // States
    const create_trainset = project.states?.create_trainset || {};
    const train_model = project.states?.train_model || {};
    const evaluate_model = project.states?.evaluate_model || {};

    const trainsetCreated = create_trainset.execution_state === "success";
    const modelCreated = train_model.execution_state === "success";
    const modelEvaluated = evaluate_model.execution_state === "success";

    // Handlers
    const handleCreateTrainset = async (formData: any) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await createTrainsetVAMEProject({
                project: project.config.project_path,
                test_fraction: formData.test_fraction,
                split_mode: formData.split_mode,
            });
            setSuccess("Training set created successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to create training set.");
        } finally {
            setLoading(false);
        }
    };

    // Handler for Train Model form submission
    const handleTrainModel = async (formData: any) => {
        setTrainLoading(true);
        setTrainError(null);
        setTrainSuccess(null);
        try {
            // Placeholder: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setTrainSuccess("Model training started (placeholder).");
        } catch (err: any) {
            setTrainError(err.message || "Failed to start model training.");
        } finally {
            setTrainLoading(false);
        }
    };

    // Toggle handler for independent accordions
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
            {/* Accordion 1: Create Training Set */}
            <Accordion>
                <AccordionHeader
                    $disabled={false}
                    onClick={() => handleToggle(0, true)}
                >
                    1. Create Training Set
                    {trainsetCreated && (
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
                            schema={createTrainsetSchema as Schema}
                            blockSubmission={loading}
                            submitText={loading ? "Creating..." : "Create Training Set"}
                            onFormSubmit={handleCreateTrainset}
                        />
                        {error && (
                            <div style={{ color: "red", marginTop: 8 }}>{error}</div>
                        )}
                        {success && (
                            <div style={{ color: "green", marginTop: 8 }}>{success}</div>
                        )}
                        <PlaceholderLog step="Create Training Set" />
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Train Model */}
            <Accordion>
                <AccordionHeader
                    $disabled={!trainsetCreated}
                    onClick={() => handleToggle(1, trainsetCreated)}
                >
                    2. Train Model
                    {modelCreated && (
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
                            schema={trainModelSchema as Schema}
                            blockSubmission={trainLoading}
                            submitText={trainLoading ? "Training..." : "Train Model"}
                            onFormSubmit={handleTrainModel}
                        />
                        {trainError && (
                            <div style={{ color: "red", marginTop: 8 }}>{trainError}</div>
                        )}
                        {trainSuccess && (
                            <div style={{ color: "green", marginTop: 8 }}>{trainSuccess}</div>
                        )}
                        <PlaceholderLog step="Train Model" />
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 3: Evaluate Model */}
            <Accordion>
                <AccordionHeader
                    $disabled={!modelCreated}
                    onClick={() => handleToggle(2, modelCreated)}
                >
                    3. Evaluate Model
                    {modelEvaluated && (
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
                        <b>Evaluate Model</b>
                        <p>This section will allow you to evaluate your model. (Functionality coming soon.)</p>
                        <PlaceholderLog step="Evaluate Model" />
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 4: Visualize Model Results */}
            <Accordion>
                <AccordionHeader
                    $disabled={!modelEvaluated}
                    onClick={() => handleToggle(3, modelEvaluated)}
                >
                    4. Visualize Model Results
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[3] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[3]}>
                    <div>
                        <b>Visualize Model Results</b>
                        <p>Visualization functionality will be added here.</p>
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default ModelTrainingAccordion;
