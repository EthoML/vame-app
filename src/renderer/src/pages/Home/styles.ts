import styled from "styled-components";

export const PaddedContainer = styled.div`
  padding: 25px 50px;
  overflow-y: auto !important;

  h2 {
    margin: 20px 0px;
  }
`;

export const ControlButton = styled.button`
  font-size: var(--text-h3);
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 2px 5px;
  color: var(--color-on-accent);
  background: var(--color-accent);
  transition: background 0.15s;

  &:hover {
    background: var(--color-accent-hover);
  }

  &[disabled] {
    opacity: 0.5;
  }
`;