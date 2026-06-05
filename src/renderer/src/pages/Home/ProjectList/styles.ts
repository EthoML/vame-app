import styled from "styled-components";

export const List = styled.ul`
  list-style: none;
  padding: 0;
`;

export const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 10px;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--color-border-strong);
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    letter-spacing: -0.01em;
    margin: 0;
    color: var(--color-text);
  }

  small {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;
