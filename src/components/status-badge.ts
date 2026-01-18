/**
 * Status Badge Component
 *
 * Displays a colored status indicator with icon for medication status.
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MedicationStatus } from '../types';

@customElement('med-expert-status-badge')
export class StatusBadge extends LitElement {
  @property({ type: String }) status: MedicationStatus = MedicationStatus.OK;
  @property({ type: Boolean }) compact = false;

  private get statusConfig(): { icon: string; label: string; color: string } {
    const configs: Record<MedicationStatus, { icon: string; label: string; color: string }> = {
      [MedicationStatus.OK]: {
        icon: 'mdi:check-circle',
        label: 'OK',
        color: 'var(--med-expert-status-ok, var(--success-color, #4caf50))',
      },
      [MedicationStatus.DUE]: {
        icon: 'mdi:clock-alert',
        label: 'Due',
        color: 'var(--med-expert-status-due, var(--warning-color, #ff9800))',
      },
      [MedicationStatus.MISSED]: {
        icon: 'mdi:alert-circle',
        label: 'Missed',
        color: 'var(--med-expert-status-missed, var(--error-color, #f44336))',
      },
      [MedicationStatus.SNOOZED]: {
        icon: 'mdi:clock-outline',
        label: 'Snoozed',
        color: 'var(--med-expert-status-snoozed, var(--info-color, #2196f3))',
      },
      [MedicationStatus.PRN]: {
        icon: 'mdi:pill',
        label: 'PRN',
        color: 'var(--med-expert-status-prn, var(--secondary-text-color, #757575))',
      },
    };
    return configs[this.status] || configs[MedicationStatus.OK];
  }

  protected render(): TemplateResult {
    const config = this.statusConfig;

    return html`
      <div
        class="badge ${this.compact ? 'compact' : ''}"
        style="--badge-color: ${config.color}"
        title="${config.label}"
      >
        <ha-icon .icon=${config.icon}></ha-icon>
        ${!this.compact ? html`<span class="label">${config.label}</span>` : ''}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: inline-flex;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 12px;
        background-color: color-mix(in srgb, var(--badge-color) 15%, transparent);
        color: var(--badge-color);
        font-size: 12px;
        font-weight: 500;
      }

      .badge.compact {
        padding: 2px;
        border-radius: 50%;
      }

      .badge.compact .label {
        display: none;
      }

      ha-icon {
        --mdc-icon-size: 16px;
        color: var(--badge-color);
      }

      .compact ha-icon {
        --mdc-icon-size: 14px;
      }

      .label {
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-status-badge': StatusBadge;
  }
}
