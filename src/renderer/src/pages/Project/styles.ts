import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const ProjectHeader = styled.header`
  width: 100%;
  padding: 20px 30px;
`;

export const ProjectInformation = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;
`;

export const ProjectContent = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ProjectInformationCapsule = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 5px 10px;
  border-radius: 8px;

  /* Labels stay sans (bold); the literal values (path, date, version)
     render mono so they read precisely and align. */
  b {
    font-weight: var(--weight-semibold);
  }

  small small {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
`;
