import styled from 'styled-components';

export const TerminalDiv = styled.ul`

  width: 100%;

  margin: 0;
  scroll-behavior: smooth;

  list-style: none;
  
  padding: 10px;
  overflow: hidden;
  background-color: var(--color-ink);
  overflow-y: auto !important;
  color: var(--color-surface);

  font-family: var(--font-mono);
  font-size: var(--text-sm);

  li {
    padding: 5px;
  }
  
`;
