import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarHeader = styled(Link)`
    font-size: var(--text-h3);
    color: var(--color-text);
    font-weight: var(--weight-semibold);
    letter-spacing: -0.01em;
    text-decoration: none;
`;

export const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: var(--text-h3);
  padding: 20px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
`;

export const NavbarSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

export const NavbarButton = styled.button`
  font-size: var(--text-h3);
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
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
