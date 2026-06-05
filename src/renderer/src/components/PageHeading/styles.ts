import styled from "styled-components";

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
    flex: 1;
`;

export const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
`;

export const TitleText = styled.h1`
    font-size: var(--text-h3);
    font-weight: var(--weight-semibold);
    letter-spacing: -0.01em;
    color: var(--color-text);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
`;

export const Meta = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
`;

export const MetaItem = styled.span`
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    max-width: 360px;
    padding: 2px 8px;
    background: var(--color-surface-sunken);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: var(--text-caption);
    color: var(--color-text-secondary);

    b {
        font-weight: var(--weight-semibold);
        flex-shrink: 0;
    }

    /* Literal values (path, date, version) render mono + tabular so they read
       precisely; long paths truncate with an ellipsis (full value on hover). */
    .value {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }
`;
