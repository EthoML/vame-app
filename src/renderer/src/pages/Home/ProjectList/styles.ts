import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
`;

export const Thead = styled.thead`
  th {
    text-align: left;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-caption);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    background: var(--color-surface-sunken);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  th:last-child {
    text-align: right;
  }
`;

export const Row = styled.tr`
  transition: background-color 0.15s;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-surface-sunken);
  }

  td {
    padding: var(--space-3) var(--space-4);
    vertical-align: middle;
    color: var(--color-text);
    font-size: var(--text-sm);
  }

  td:last-child {
    text-align: right;
    white-space: nowrap;
  }
`;

export const NameCell = styled.td`
  /* Primary column: project name over its path. */
  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    font-size: var(--text-body);
    font-weight: var(--weight-semibold);
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  small {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
    overflow-wrap: anywhere;
  }
`;

export const MetaCell = styled.td`
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

export const VersionCell = styled.td`
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

export const ButtonContainer = styled.div`
  display: inline-flex;
  gap: var(--space-2);
`;

export const Muted = styled.span`
  color: var(--color-text-muted);
`;
