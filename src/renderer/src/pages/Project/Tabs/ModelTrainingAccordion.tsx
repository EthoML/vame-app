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
    const [openStep, setOpenStep] = useState<null | number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    const steps = [
        {
            label: "1. Create Training Set",
            content: (
                <>
                    <div>
                        <b>Create Training Set</b>
                        <p>Configure and create the training set for your model.</p>
                        <DynamicForm
                            schema={createTrainsetSchema}
                            initialValues={{
                                test_fraction: 0.2,
                                split_mode: "mode_1",
                            }}
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
                </>
            ),
        },
        {
            label: "2. Train Model",
            content: (
                <>
                    <div>
                        <b>Train Model</b>
                        <p>This section will allow you to train your model. (Functionality coming soon.)</p>
                        <PlaceholderLog step="Train Model" />
                    </div>
                </>
            ),
        },
        {
            label: "3. Evaluate Model",
            content: (
                <>
                    <div>
                        <b>Evaluate Model</b>
                        <p>This section will allow you to evaluate your model. (Functionality coming soon.)</p>
                        <PlaceholderLog step="Evaluate Model" />
                    </div>
                </>
            ),
        },
        {
            label: "4. Visualize Model Results",
            content: (
                <>
                    <div>
                        <b>Visualize Model Results</b>
                        <p>Visualization functionality will be added here.</p>
                    </div>
                </>
            ),
        },
    ];

    return (
        <PaddedTab>
            {steps.map((step, idx) => (
                <Accordion key={step.label}>
                    <AccordionHeader onClick={() => setOpenStep(openStep === idx ? null : idx)}>
                        {step.label}
                        <span style={{ marginLeft: "auto" }}>
                            <FontAwesomeIcon icon={openStep === idx ? faChevronUp : faChevronDown} />
                        </span>
                    </AccordionHeader>
                    <AccordionContent $isOpen={openStep === idx}>
                        {step.content}
                    </AccordionContent>
                </Accordion>
            ))}
        </PaddedTab>
    );
};

export default ModelTrainingAccordion;
