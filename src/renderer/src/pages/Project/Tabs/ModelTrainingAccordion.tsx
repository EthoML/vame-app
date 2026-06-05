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
import { trainVAMEProject } from "../../../context/Projects/api/trainVAMEProject";
import { getProjectStateVAMEProject } from "../../../context/Projects/api/getProjectStateVAMEProject";
import { evaluateVAMEProject } from "../../../context/Projects/api/evaluateVAMEProject";
import createTrainsetSchema from '../../../../../schema/create-trainset.schema.json';
import trainModelSchema from '../../../../../schema/train-model.schema.json';
import evaluateModelSchema from '../../../../../schema/evaluate-model.schema.json';
import ModelVisualizationSection from "./ModelVisualizationSection";

type ModelTrainingAccordionProps = {
    project: ProjectType;
    onFormSubmit: () => Promise<void>;
    setBlockSubmit: (value: boolean) => void;
    blockSubmit: boolean;
};

const ModelTrainingAccordion = ({
    project,
    onFormSubmit,
    setBlockSubmit,
    blockSubmit,
}: ModelTrainingAccordionProps) => {
    // Independent open/close state for each accordion
    const [openSteps, setOpenSteps] = useState([false, false, false, false]);

    // Create Trainset form state
    const [createTrainsetLoading, setCreateTrainsetLoading] = useState(false);
    const [createTrainsetError, setCreateTrainsetError] = useState<string | null>(null);

    // Train Model form state
    const [trainLoading, setTrainLoading] = useState(false);
    const [trainError, setTrainError] = useState<string | null>(null);

    // Polling state for train_model
    const [trainModelState, setTrainModelState] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Evaluate Model form state
    const [evaluateError, setEvaluateError] = useState<string | null>(null);

    // States
    const create_trainset = project.states.create_trainset || {};
    const train_model = project.states.train_model || {};
    const evaluate_model = project.states.evaluate_model || {};

    const trainsetCreated = create_trainset.execution_state === "success";
    const modelCreated = train_model.execution_state === "success";
    const modelEvaluated = evaluate_model.execution_state === "success";

    // Poll train_model state after training starts
    React.useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPolling) {
            interval = setInterval(async () => {
                try {
                    const projectStates = await getProjectStateVAMEProject({
                        project: project.config.project_path,
                    });
                    const state = projectStates.states?.train_model?.execution_state || null;
                    setTrainModelState(state);
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
                        setOpenSteps([false, false, false, false]);
                    }
                } catch (err) {
                    console.error("Error during polling:", err);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPolling, project.config.project_path, setBlockSubmit]);

    // Handler for Create Training Set form submission
    const handleCreateTrainset = async (formData: any) => {
        setCreateTrainsetLoading(true);
        setCreateTrainsetError(null);
        setBlockSubmit(true);
        try {
            await createTrainsetVAMEProject({
                project: project.config.project_path,
                test_fraction: formData.test_fraction,
                split_mode: formData.split_mode,
            });
        } catch (err: any) {
            setCreateTrainsetError(err.message || "Failed to create training set.");
        } finally {
            setCreateTrainsetLoading(false);
            try {
                await onFormSubmit();
            } catch (e) {
                console.error("Error calling onFormSubmit:", e);
            }
            setBlockSubmit(false);
        }
    };

    // Handler for Train Model form submission
    const handleTrainModel = async (formData: any) => {
        setBlockSubmit(true);
        setTrainLoading(true);
        setTrainError(null);
        try {
            await trainVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
            setIsPolling(true);
        } catch (err: any) {
            setTrainError(err.message || "Failed to start model training.");
            setBlockSubmit(false);
        } finally {
            setTrainLoading(false);
        }
    };

    // Handler for Evaluate Model form submission
    const handleEvaluateModel = async (formData: any) => {
        setBlockSubmit(true);
        try {
            await evaluateVAMEProject({
                project: project.config.project_path,
                ...formData,
            });
        } catch (err: any) {
            setEvaluateError(err.message || "Failed to start model evaluation.");
        } finally {
            try {
                await onFormSubmit();
            } catch (e) {
                console.error("Error calling onFormSubmit:", e);
            }
            setBlockSubmit(false);
        }
    };

    // (Removed unused handleGetImages and related state)

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
                    3.1 Create Training Set
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
                            blockSubmission={blockSubmit}
                            submitText={createTrainsetLoading ? "Creating..." : "Create Training Set"}
                            onFormSubmit={handleCreateTrainset}
                            showLogsButton={true}
                            logName={["create_trainset"]}
                            projectPath={project.config.project_path}
                        />
                        {createTrainsetError && (
                            <div style={{ color: "red", marginTop: 8 }}>{createTrainsetError}</div>
                        )}
                        {trainsetCreated && (
                            <div style={{ color: "green", marginTop: 8 }}>Training set created successfully.</div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 2: Train Model */}
            <Accordion>
                <AccordionHeader
                    $disabled={!trainsetCreated}
                    onClick={() => handleToggle(1, true)}
                >
                    3.2 Train Model
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
                            blockSubmission={blockSubmit}
                            submitText={trainLoading ? "Training..." : "Train Model"}
                            onFormSubmit={handleTrainModel}
                            showLogsButton={true}
                            logName={["train_model"]}
                            projectPath={project.config.project_path}
                        />
                        {trainError && (
                            <div style={{ color: "red", marginTop: 8 }}>{trainError}</div>
                        )}
                        {(isPolling || trainModelState) && (
                            <div style={{ marginTop: 8 }}>
                                {isPolling && (
                                    <span style={{ color: "#888" }}>
                                        Polling training state...
                                    </span>
                                )}
                                {trainModelState === "running" && (
                                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                                        State: <b>Running</b>
                                    </span>
                                )}
                                {trainModelState === "success" && (
                                    <span style={{ color: "green", marginLeft: 8 }}>
                                        State: <b>Success</b> — Training completed successfully.
                                    </span>
                                )}
                                {trainModelState === "failed" && (
                                    <span style={{ color: "red", marginLeft: 8 }}>
                                        State: <b>Failed</b> — Training failed.
                                    </span>
                                )}
                                {trainModelState === "aborted" && (
                                    <span style={{ color: "orange", marginLeft: 8 }}>
                                        State: <b>Aborted</b> — Training was aborted.
                                    </span>
                                )}
                                {trainModelState === "not_found" && (
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                        State: <b>Not Found</b> — No training state found.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 3: Evaluate Model */}
            <Accordion>
                <AccordionHeader
                    $disabled={!modelCreated}
                    onClick={() => handleToggle(2, modelCreated)}
                >
                    3.3 Evaluate Model
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
                        <DynamicForm
                            schema={evaluateModelSchema as Schema}
                            blockSubmission={blockSubmit}
                            submitText={"Evaluate Model"}
                            onFormSubmit={handleEvaluateModel}
                            showLogsButton={true}
                            logName={["evaluate_model"]}
                            projectPath={project.config.project_path}
                        />
                        {evaluateError && (
                            <div style={{ color: "red", marginTop: 8 }}>{evaluateError}</div>
                        )}
                        {modelEvaluated && (
                            <div style={{ color: "green", marginTop: 8 }}>Model evaluated successfully.</div>
                        )}
                    </div>
                </AccordionContent>
            </Accordion>
            {/* Accordion 4: Visualize Model Results */}
            <Accordion>
                <AccordionHeader
                    $disabled={!modelEvaluated}
                    onClick={() => handleToggle(3, modelEvaluated)}
                >
                    3.4 Visualize Model Results
                    {modelEvaluated && (
                        <span style={{ color: "green", marginLeft: 8, fontWeight: 700, fontSize: 18 }} title="Success">
                            ✓
                        </span>
                    )}
                    <span style={{ marginLeft: "auto" }}>
                        <FontAwesomeIcon icon={openSteps[3] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[3]}>
                    <ModelVisualizationSection project={project} />
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default ModelTrainingAccordion;
