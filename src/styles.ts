/**
 * Shared Styles for Med Expert Card
 *
 * CSS Custom Properties for theming and responsive design.
 * These can be overridden in the HA theme or card-mod.
 */

import { css } from 'lit';

/**
 * CSS Custom Properties available for theming:
 *
 * Colors:
 * --med-expert-primary-color: Primary accent color (default: var(--primary-color))
 * --med-expert-background-color: Card background (default: var(--card-background-color))
 * --med-expert-text-color: Main text color (default: var(--primary-text-color))
 * --med-expert-secondary-text-color: Secondary text (default: var(--secondary-text-color))
 *
 * Status Colors:
 * --med-expert-status-ok: OK/taken status (default: #4caf50)
 * --med-expert-status-due: Due status (default: #ff9800)
 * --med-expert-status-missed: Missed status (default: #f44336)
 * --med-expert-status-snoozed: Snoozed status (default: #2196f3)
 * --med-expert-status-prn: PRN/as needed (default: #9c27b0)
 *
 * Spacing:
 * --med-expert-spacing-xs: Extra small spacing (default: 4px)
 * --med-expert-spacing-sm: Small spacing (default: 8px)
 * --med-expert-spacing-md: Medium spacing (default: 16px)
 * --med-expert-spacing-lg: Large spacing (default: 24px)
 *
 * Border Radius:
 * --med-expert-border-radius: Standard radius (default: 8px)
 * --med-expert-border-radius-sm: Small radius (default: 4px)
 *
 * Shadows:
 * --med-expert-shadow: Card shadow (default: var(--ha-card-box-shadow, none))
 *
 * Typography:
 * --med-expert-font-size-xs: Extra small text (default: 10px)
 * --med-expert-font-size-sm: Small text (default: 12px)
 * --med-expert-font-size-md: Medium text (default: 14px)
 * --med-expert-font-size-lg: Large text (default: 16px)
 * --med-expert-font-size-xl: Extra large text (default: 20px)
 */

export const baseStyles = css`
  :host {
    /* Color Palette - Inherits from HA theme */
    --med-expert-primary-color: var(--primary-color, #03a9f4);
    --med-expert-background-color: var(--card-background-color, #fff);
    --med-expert-text-color: var(--primary-text-color, #212121);
    --med-expert-secondary-text-color: var(--secondary-text-color, #727272);
    --med-expert-divider-color: var(--divider-color, rgba(0, 0, 0, 0.12));

    /* Status Colors */
    --med-expert-status-ok: var(--success-color, #4caf50);
    --med-expert-status-due: var(--warning-color, #ff9800);
    --med-expert-status-missed: var(--error-color, #f44336);
    --med-expert-status-snoozed: var(--info-color, #2196f3);
    --med-expert-status-prn: #9c27b0;

    /* Spacing Scale */
    --med-expert-spacing-xs: 4px;
    --med-expert-spacing-sm: 8px;
    --med-expert-spacing-md: 16px;
    --med-expert-spacing-lg: 24px;
    --med-expert-spacing-xl: 32px;

    /* Border Radius */
    --med-expert-border-radius: var(--ha-card-border-radius, 8px);
    --med-expert-border-radius-sm: 4px;
    --med-expert-border-radius-pill: 9999px;

    /* Shadows */
    --med-expert-shadow: var(--ha-card-box-shadow, none);
    --med-expert-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --med-expert-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

    /* Typography Scale */
    --med-expert-font-size-xs: 10px;
    --med-expert-font-size-sm: 12px;
    --med-expert-font-size-md: 14px;
    --med-expert-font-size-lg: 16px;
    --med-expert-font-size-xl: 20px;

    /* Font Weights */
    --med-expert-font-weight-normal: 400;
    --med-expert-font-weight-medium: 500;
    --med-expert-font-weight-bold: 700;

    /* Transitions */
    --med-expert-transition-fast: 150ms ease-in-out;
    --med-expert-transition-normal: 250ms ease-in-out;

    /* Icon Sizes */
    --med-expert-icon-size-sm: 16px;
    --med-expert-icon-size-md: 24px;
    --med-expert-icon-size-lg: 32px;

    display: block;
    font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
  }
`;

export const cardStyles = css`
  ${baseStyles}

  ha-card {
    background: var(--med-expert-background-color);
    border-radius: var(--med-expert-border-radius);
    box-shadow: var(--med-expert-shadow);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--med-expert-spacing-md);
    border-bottom: 1px solid var(--med-expert-divider-color);
  }

  .card-header h1 {
    margin: 0;
    font-size: var(--med-expert-font-size-xl);
    font-weight: var(--med-expert-font-weight-medium);
    color: var(--med-expert-text-color);
  }

  .card-content {
    padding: var(--med-expert-spacing-md);
  }

  .medication-list {
    display: flex;
    flex-direction: column;
    gap: var(--med-expert-spacing-sm);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--med-expert-spacing-xl);
    text-align: center;
    color: var(--med-expert-secondary-text-color);
  }

  .empty-state ha-icon {
    --mdc-icon-size: 48px;
    margin-bottom: var(--med-expert-spacing-md);
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0 0 var(--med-expert-spacing-md);
    font-size: var(--med-expert-font-size-md);
  }

  /* Responsive: Compact mode for narrow cards */
  @media (max-width: 600px) {
    .card-header {
      padding: var(--med-expert-spacing-sm) var(--med-expert-spacing-md);
    }

    .card-content {
      padding: var(--med-expert-spacing-sm);
    }

    .card-header h1 {
      font-size: var(--med-expert-font-size-lg);
    }
  }
`;

export const buttonStyles = css`
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--med-expert-spacing-xs);
    padding: var(--med-expert-spacing-sm) var(--med-expert-spacing-md);
    border: none;
    border-radius: var(--med-expert-border-radius-sm);
    font-size: var(--med-expert-font-size-sm);
    font-weight: var(--med-expert-font-weight-medium);
    cursor: pointer;
    transition: background-color var(--med-expert-transition-fast),
      opacity var(--med-expert-transition-fast);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--med-expert-primary-color);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .btn-success {
    background: var(--med-expert-status-ok);
    color: white;
  }

  .btn-warning {
    background: var(--med-expert-status-due);
    color: white;
  }

  .btn-danger {
    background: var(--med-expert-status-missed);
    color: white;
  }

  .btn-info {
    background: var(--med-expert-status-snoozed);
    color: white;
  }

  .btn-icon {
    padding: var(--med-expert-spacing-sm);
    background: transparent;
    border-radius: 50%;
  }

  .btn-icon:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.08);
  }

  .btn-ghost {
    background: transparent;
    color: var(--med-expert-primary-color);
  }

  .btn-ghost:hover:not(:disabled) {
    background: rgba(var(--rgb-primary-color), 0.08);
  }
`;

export const badgeStyles = css`
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--med-expert-spacing-xs) var(--med-expert-spacing-sm);
    border-radius: var(--med-expert-border-radius-pill);
    font-size: var(--med-expert-font-size-xs);
    font-weight: var(--med-expert-font-weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-ok {
    background: rgba(76, 175, 80, 0.15);
    color: var(--med-expert-status-ok);
  }

  .badge-due {
    background: rgba(255, 152, 0, 0.15);
    color: var(--med-expert-status-due);
  }

  .badge-missed {
    background: rgba(244, 67, 54, 0.15);
    color: var(--med-expert-status-missed);
  }

  .badge-snoozed {
    background: rgba(33, 150, 243, 0.15);
    color: var(--med-expert-status-snoozed);
  }

  .badge-prn {
    background: rgba(156, 39, 176, 0.15);
    color: var(--med-expert-status-prn);
  }
`;

export const rowStyles = css`
  .medication-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--med-expert-spacing-md);
    align-items: center;
    padding: var(--med-expert-spacing-md);
    background: var(--med-expert-background-color);
    border-radius: var(--med-expert-border-radius-sm);
    border: 1px solid var(--med-expert-divider-color);
    transition: box-shadow var(--med-expert-transition-fast);
  }

  .medication-row:hover {
    box-shadow: var(--med-expert-shadow-sm);
  }

  .medication-row.compact {
    padding: var(--med-expert-spacing-sm);
    gap: var(--med-expert-spacing-sm);
  }

  .medication-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--med-expert-icon-size-lg);
    height: var(--med-expert-icon-size-lg);
    border-radius: var(--med-expert-border-radius-sm);
    background: rgba(var(--rgb-primary-color), 0.1);
  }

  .medication-info {
    display: flex;
    flex-direction: column;
    gap: var(--med-expert-spacing-xs);
    min-width: 0; /* Allow text truncation */
  }

  .medication-name {
    font-size: var(--med-expert-font-size-md);
    font-weight: var(--med-expert-font-weight-medium);
    color: var(--med-expert-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .medication-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--med-expert-spacing-sm);
    font-size: var(--med-expert-font-size-sm);
    color: var(--med-expert-secondary-text-color);
  }

  .medication-actions {
    display: flex;
    gap: var(--med-expert-spacing-xs);
  }

  /* Responsive: Stack layout on narrow screens */
  @media (max-width: 600px) {
    .medication-row {
      grid-template-columns: auto 1fr;
    }

    .medication-row.compact .medication-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }
`;

export const wizardStyles = css`
  ${baseStyles}

  .wizard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--med-expert-spacing-md);
  }

  .wizard-dialog {
    background: var(--med-expert-background-color);
    border-radius: var(--med-expert-border-radius);
    box-shadow: var(--med-expert-shadow-md);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .wizard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--med-expert-spacing-md);
    border-bottom: 1px solid var(--med-expert-divider-color);
  }

  .wizard-header h2 {
    margin: 0;
    font-size: var(--med-expert-font-size-lg);
    font-weight: var(--med-expert-font-weight-medium);
  }

  .wizard-steps {
    display: flex;
    gap: var(--med-expert-spacing-sm);
    padding: var(--med-expert-spacing-sm) var(--med-expert-spacing-md);
    background: rgba(0, 0, 0, 0.02);
    overflow-x: auto;
  }

  .wizard-step {
    display: flex;
    align-items: center;
    gap: var(--med-expert-spacing-xs);
    padding: var(--med-expert-spacing-xs) var(--med-expert-spacing-sm);
    border-radius: var(--med-expert-border-radius-pill);
    font-size: var(--med-expert-font-size-xs);
    white-space: nowrap;
    color: var(--med-expert-secondary-text-color);
  }

  .wizard-step.active {
    background: var(--med-expert-primary-color);
    color: white;
  }

  .wizard-step.completed {
    background: rgba(76, 175, 80, 0.15);
    color: var(--med-expert-status-ok);
  }

  .wizard-step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: currentColor;
    color: white;
    font-weight: var(--med-expert-font-weight-bold);
  }

  .wizard-step.active .wizard-step-number {
    background: white;
    color: var(--med-expert-primary-color);
  }

  .wizard-step.completed .wizard-step-number {
    background: var(--med-expert-status-ok);
  }

  .wizard-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--med-expert-spacing-md);
  }

  .wizard-footer {
    display: flex;
    justify-content: space-between;
    padding: var(--med-expert-spacing-md);
    border-top: 1px solid var(--med-expert-divider-color);
  }

  .form-group {
    margin-bottom: var(--med-expert-spacing-md);
  }

  .form-group label {
    display: block;
    margin-bottom: var(--med-expert-spacing-xs);
    font-size: var(--med-expert-font-size-sm);
    font-weight: var(--med-expert-font-weight-medium);
    color: var(--med-expert-text-color);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: var(--med-expert-spacing-sm);
    border: 1px solid var(--med-expert-divider-color);
    border-radius: var(--med-expert-border-radius-sm);
    font-size: var(--med-expert-font-size-md);
    background: var(--med-expert-background-color);
    color: var(--med-expert-text-color);
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--med-expert-primary-color);
    box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
  }

  .form-group .hint {
    margin-top: var(--med-expert-spacing-xs);
    font-size: var(--med-expert-font-size-xs);
    color: var(--med-expert-secondary-text-color);
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--med-expert-spacing-md);
  }

  @media (max-width: 600px) {
    .wizard-dialog {
      max-height: 100vh;
      border-radius: 0;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;

export const adherenceStyles = css`
  .adherence-chart {
    display: flex;
    flex-direction: column;
    gap: var(--med-expert-spacing-sm);
    padding: var(--med-expert-spacing-md);
    background: rgba(0, 0, 0, 0.02);
    border-radius: var(--med-expert-border-radius-sm);
  }

  .adherence-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .adherence-title {
    font-size: var(--med-expert-font-size-sm);
    font-weight: var(--med-expert-font-weight-medium);
    color: var(--med-expert-text-color);
  }

  .adherence-percentage {
    font-size: var(--med-expert-font-size-xl);
    font-weight: var(--med-expert-font-weight-bold);
    color: var(--med-expert-status-ok);
  }

  .adherence-percentage.warning {
    color: var(--med-expert-status-due);
  }

  .adherence-percentage.danger {
    color: var(--med-expert-status-missed);
  }

  .adherence-bar {
    height: 8px;
    background: var(--med-expert-divider-color);
    border-radius: var(--med-expert-border-radius-pill);
    overflow: hidden;
  }

  .adherence-bar-fill {
    height: 100%;
    background: var(--med-expert-status-ok);
    border-radius: var(--med-expert-border-radius-pill);
    transition: width var(--med-expert-transition-normal);
  }

  .adherence-bar-fill.warning {
    background: var(--med-expert-status-due);
  }

  .adherence-bar-fill.danger {
    background: var(--med-expert-status-missed);
  }

  .adherence-stats {
    display: flex;
    justify-content: space-around;
    font-size: var(--med-expert-font-size-xs);
    color: var(--med-expert-secondary-text-color);
  }

  .adherence-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--med-expert-spacing-xs);
  }

  .adherence-stat-value {
    font-size: var(--med-expert-font-size-md);
    font-weight: var(--med-expert-font-weight-bold);
    color: var(--med-expert-text-color);
  }
`;

// Export all styles combined for convenience
export const allStyles = css`
  ${baseStyles}
  ${buttonStyles}
  ${badgeStyles}
  ${rowStyles}
  ${wizardStyles}
  ${adherenceStyles}
`;
