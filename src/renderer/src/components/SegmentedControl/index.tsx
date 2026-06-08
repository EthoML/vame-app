import React from "react";
import styled from "styled-components";

// A small segmented control for switching between a few mutually-exclusive
// views (e.g. image types). Token-driven to match the clinical app style —
// replaces the ad-hoc inline "tab" buttons scattered across the result views.

export type SegmentOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel?: string;
};

function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: Props<T>) {
    return (
        <Group role="tablist" aria-label={ariaLabel}>
            {options.map((opt) => (
                <Segment
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={opt.value === value}
                    $active={opt.value === value}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </Segment>
            ))}
        </Group>
    );
}

const Group = styled.div`
    display: inline-flex;
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    overflow: hidden;
`;

const Segment = styled.button<{ $active: boolean }>`
    padding: 6px 14px;
    font-family: inherit;
    font-size: var(--text-sm);
    font-weight: ${({ $active }) => ($active ? "var(--weight-semibold)" : "var(--weight-medium)")};
    line-height: 1;
    border: none;
    cursor: pointer;
    background: ${({ $active }) => ($active ? "var(--color-accent)" : "var(--color-surface)")};
    color: ${({ $active }) => ($active ? "var(--color-on-accent)" : "var(--color-text-secondary)")};
    transition: background 0.12s, color 0.12s;

    & + & {
        border-left: 1px solid var(--color-border);
    }

    &:hover:not(:disabled) {
        background: ${({ $active }) => ($active ? "var(--color-accent)" : "var(--color-surface-sunken)")};
        color: ${({ $active }) => ($active ? "var(--color-on-accent)" : "var(--color-text)")};
    }
`;

export default SegmentedControl;
