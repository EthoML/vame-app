import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

export const TabsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

export const TabList = styled.div`
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none; /* Hide scrollbar for webkit browsers */
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
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: var(--text-body);
  outline: none;
  transition: background-color 0.15s, border-color 0.15s;
  border-bottom: ${(props) => (props.$active ? '2px solid var(--color-accent)' : '2px solid transparent')};
  font-weight: ${(props) => (props.$active ? '600' : 'normal')};
  flex-shrink: 0;
  flex-grow: 1;
  color: ${(props) => (props.$active ? 'var(--color-accent)' : 'var(--color-text)')};

  &:hover {
    background-color: var(--color-surface-sunken);
  }

  &:disabled {
    pointer-events: none;
    color: var(--color-text-muted);
    opacity: 0.6;
    background-color: var(--color-surface-sunken);
  }

  ${(props) =>
    props.$failed
      ? `&:after {
    margin-left: 8px;
    content: '✕';
    color: var(--color-error);
  }`
      : props.$complete
      ? `&:after {
    margin-left: 8px;
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
