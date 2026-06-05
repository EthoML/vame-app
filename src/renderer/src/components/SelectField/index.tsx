import React from "react";
import styled from "styled-components";

// Compact, token-styled labelled <select> for result-viewer controls
// (segmentation algorithm, session, …). Values are data, so they render mono.

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    id?: string;
};

const SelectField: React.FC<Props> = ({ label, value, onChange, options, id }) => (
    <Label htmlFor={id}>
        {label}
        <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </Select>
    </Label>
);

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
`;

const Select = styled.select`
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    padding: 6px 10px;
`;

export default SelectField;
