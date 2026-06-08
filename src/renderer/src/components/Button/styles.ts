import styled, { css } from "styled-components";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon";

// Variant system — one button, clear hierarchy.
//   primary   → the main action in a context (accent fill)
//   secondary → supporting actions (outlined, neutral)
//   danger    → destructive actions (outlined red, fills on hover)
//   ghost     → tertiary / low-emphasis text actions
//   icon      → icon-only controls (square, quiet until hover)
const variants: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: var(--color-accent);
    color: var(--color-on-accent);
    border-color: var(--color-accent);
    &:hover:not([disabled]) {
      background: var(--color-accent-hover);
      border-color: var(--color-accent-hover);
    }
  `,
  secondary: css`
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border-strong);
    &:hover:not([disabled]) {
      background: var(--color-surface-sunken);
    }
  `,
  danger: css`
    background: transparent;
    color: var(--color-error);
    border-color: var(--color-error);
    &:hover:not([disabled]) {
      background: var(--color-error);
      color: var(--color-on-accent);
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--color-text-secondary);
    border-color: transparent;
    &:hover:not([disabled]) {
      background: var(--color-surface-sunken);
      color: var(--color-text);
    }
  `,
  icon: css`
    background: transparent;
    color: var(--color-text-secondary);
    border-color: transparent;
    padding: 6px;
    font-size: var(--text-h3);
    line-height: 1;
    &:hover:not([disabled]) {
      background: var(--color-surface-sunken);
      color: var(--color-accent);
    }
  `,
};

export const Container = styled.button<{ $variant: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  line-height: 1;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px 16px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &[disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  ${({ $variant }) => variants[$variant]}
`;
