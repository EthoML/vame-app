import React, { useState } from 'react';
import { Accordion, AccordionHeader, AccordionContent } from '@renderer/components/DynamicForm/styles';
import { PaddedTab } from '@renderer/components/Tabs/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { TabProps } from './types';

const Report: React.FC<TabProps> = ({
    project,
    onFormSubmit,
    blockSubmission,
    blockTooltip,
}) => {
    const [openSteps, setOpenSteps] = useState([false, false, false]);

    const handleToggle = (idx: number) => {
        setOpenSteps((prev) => {
            const next = [...prev];
            next[idx] = !next[idx];
            return next;
        });
    };

    // prevent unused variable warnings for placeholder component
    void project;
    void onFormSubmit;
    void blockSubmission;
    void blockTooltip;

    return (
        <PaddedTab>
            {/* Accordion 1: Generate Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(0)}>
                    1. Generate Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[0] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[0]}>
                    <div style={{ padding: 20 }}>
                        Report generation placeholder content.
                    </div>
                </AccordionContent>
            </Accordion>

            {/* Accordion 2: Visualize UMAP Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(1)}>
                    2. Visualize UMAP Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[1] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[1]}>
                    <div style={{ padding: 20 }}>
                        UMAP report visualization placeholder content.
                    </div>
                </AccordionContent>
            </Accordion>

            {/* Accordion 3: Visualize Motif/Community Report */}
            <Accordion>
                <AccordionHeader $disabled={false} onClick={() => handleToggle(2)}>
                    3. Visualize Motif/Community Report
                    <span style={{ marginLeft: 'auto' }}>
                        <FontAwesomeIcon icon={openSteps[2] ? faChevronUp : faChevronDown} />
                    </span>
                </AccordionHeader>
                <AccordionContent $isOpen={openSteps[2]}>
                    <div style={{ padding: 20 }}>
                        Motif/Community report visualization placeholder content.
                    </div>
                </AccordionContent>
            </Accordion>
        </PaddedTab>
    );
};

export default Report;
