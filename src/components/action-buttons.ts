/**
 * Action Buttons Component
 *
 * TAKE / SNOOZE / SKIP action buttons for a medication.
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MedicationStatus } from '../types';

export interface ActionButtonEvent {
  action: 'take' | 'snooze' | 'skip' | 'prn-take';
  medicationId: string;
}

@customElement('med-expert-action-buttons')
export class ActionButtons extends LitElement {
  @property({ type: String, attribute: 'medication-id' }) medicationId = '';
  @property({ type: String }) status: MedicationStatus = MedicationStatus.OK;
  @property({ type: Boolean }) compact = false;
  @property({ type: Boolean }) loading = false;

  private _handleTake(e: Event): void {
    e.stopPropagation();
    if (this.loading) return;

    const action = this.status === MedicationStatus.PRN ? 'prn-take' : 'take';
    this.dispatchEvent(
      new CustomEvent<ActionButtonEvent>('action', {
        detail: { action, medicationId: this.medicationId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleSnooze(e: Event): void {
    e.stopPropagation();
    if (this.loading) return;

    this.dispatchEvent(
      new CustomEvent<ActionButtonEvent>('action', {
        detail: { action: 'snooze', medicationId: this.medicationId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleSkip(e: Event): void {
    e.stopPropagation();
    if (this.loading) return;

    this.dispatchEvent(
      new CustomEvent<ActionButtonEvent>('action', {
        detail: { action: 'skip', medicationId: this.medicationId },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    const isPRN = this.status === MedicationStatus.PRN;
    const showSnoozeSkip = !isPRN && (this.status === MedicationStatus.DUE || this.status === MedicationStatus.MISSED);

    return html`
      <div class="actions ${this.compact ? 'compact' : ''} ${this.loading ? 'loading' : ''}">
        <button
          class="action-btn take"
          @click=${this._handleTake}
          ?disabled=${this.loading}
          title="${isPRN ? 'Take as needed' : 'Mark as taken'}"
        >
          ${this.loading
            ? html`<ha-circular-progress size="small" active></ha-circular-progress>`
            : html`<ha-icon icon="mdi:check"></ha-icon>`}
          ${!this.compact ? html`<span>${isPRN ? 'Take' : 'Taken'}</span>` : ''}
        </button>

        ${showSnoozeSkip
          ? html`
              <button
                class="action-btn snooze"
                @click=${this._handleSnooze}
                ?disabled=${this.loading}
                title="Snooze reminder"
              >
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                ${!this.compact ? html`<span>Snooze</span>` : ''}
              </button>

              <button
                class="action-btn skip"
                @click=${this._handleSkip}
                ?disabled=${this.loading}
                title="Skip this dose"
              >
                <ha-icon icon="mdi:close"></ha-icon>
                ${!this.compact ? html`<span>Skip</span>` : ''}
              </button>
            `
          : ''}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: inline-flex;
      }

      .actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .actions.compact {
        gap: 4px;
      }

      .actions.loading {
        opacity: 0.7;
        pointer-events: none;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        background: none;
        color: inherit;
      }

      .compact .action-btn {
        padding: 4px 8px;
        border-radius: 12px;
      }

      .compact .action-btn span {
        display: none;
      }

      .action-btn:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .action-btn.take {
        background-color: var(--med-expert-status-ok, var(--success-color, #4caf50));
        color: white;
      }

      .action-btn.take:hover:not(:disabled) {
        background-color: color-mix(in srgb, var(--med-expert-status-ok, #4caf50) 85%, black);
      }

      .action-btn.snooze {
        background-color: var(--med-expert-status-snoozed, var(--info-color, #2196f3));
        color: white;
      }

      .action-btn.snooze:hover:not(:disabled) {
        background-color: color-mix(in srgb, var(--med-expert-status-snoozed, #2196f3) 85%, black);
      }

      .action-btn.skip {
        background-color: var(--secondary-background-color, #e0e0e0);
        color: var(--primary-text-color);
      }

      .action-btn.skip:hover:not(:disabled) {
        background-color: color-mix(in srgb, var(--secondary-background-color, #e0e0e0) 85%, black);
      }

      ha-icon {
        --mdc-icon-size: 18px;
      }

      .compact ha-icon {
        --mdc-icon-size: 16px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-action-buttons': ActionButtons;
  }
}
