import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

export const TabsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  overflow: hidden;
`;

export const TabList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 232px;
  flex-shrink: 0;
  padding: var(--space-2) 0;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  overflow-y: auto;

  & > div {
    width: 100%;
  }

  /* Tippy wraps the disabled button in a span — keep it full-width so the
     button still fills the sidebar column. */
  & > div > span {
    display: block;
    width: 100%;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border-strong);
    border-radius: 4px;
  }
`;

export const TabContent = styled.div`
  display: flex;
  position: relative;
  overflow: hidden;
  min-height: 0;
`;

interface TabPaneProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $active: boolean;
}

export const TabPane = styled.div<TabPaneProps>`
  display: ${(props) => (props.$active ? 'block' : 'none')};
  width: 100%;
  height: 100%;
  min-height: 0;
`;

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $active: boolean;
  $complete?: boolean;
  $failed?: boolean;
}

export const TabButton = styled.button<TabButtonProps>`
  width: 100%;
  display: flex;
  align-items: center;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  border: none;
  background: ${(props) => (props.$active ? 'var(--color-accent-soft)' : 'transparent')};
  font-size: var(--text-sm);
  outline: none;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
  border-left: 3px solid ${(props) => (props.$active ? 'var(--color-accent)' : 'transparent')};
  font-weight: ${(props) => (props.$active ? '600' : 'normal')};
  color: ${(props) => (props.$active ? 'var(--color-accent)' : 'var(--color-text)')};

  &:hover {
    background-color: ${(props) => (props.$active ? 'var(--color-accent-soft)' : 'var(--color-surface-sunken)')};
  }

  &:disabled {
    pointer-events: none;
    color: var(--color-text-muted);
    opacity: 0.6;
    background-color: transparent;
  }

  /* Status glyph sits flush against the sidebar's right edge. */
  ${(props) =>
    props.$failed
      ? `&:after {
    margin-left: auto;
    padding-left: var(--space-2);
    content: '✕';
    color: var(--color-error);
  }`
      : props.$complete
      ? `&:after {
    margin-left: auto;
    padding-left: var(--space-2);
    content: '✓';
    color: var(--color-success);
  }`
      : ''}
`;

export const PaddedTab = styled.div`
  padding: 20px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;
