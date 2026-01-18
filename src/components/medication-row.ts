/**
 * Medication Row Component
 *
 * Displays a single medication with status, icon, name, next due time, and actions.
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { MedicationEntity, MedicationStatus } from '../types';
import { formatNextDue, takeMedication, prnTakeMedication, snoozeMedication, skipMedication } from '../api';
import type { ActionButtonEvent } from './action-buttons';

// Import sub-components
import './status-badge';
import './dosage-form-icon';
import './action-buttons';
import './inventory-badge';

@customElement('med-expert-medication-row')
export class MedicationRow extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) medication!: MedicationEntity;
  @property({ type: String, attribute: 'entry-id' }) entryId = '';
  @property({ type: Boolean }) compact = false;
  @property({ type: Boolean, attribute: 'show-inventory' }) showInventory = true;

  @state() private _loading = false;

  private async _handleAction(e: CustomEvent<ActionButtonEvent>): Promise<void> {
    const { action, medicationId } = e.detail;
    this._loading = true;

    try {
      switch (action) {
        case 'take':
          await takeMedication(this.hass, {
            entry_id: this.entryId,
            medication_id: medicationId,
          });
          break;
        case 'prn-take':
          await prnTakeMedication(this.hass, this.entryId, medicationId);
          break;
        case 'snooze':
          await snoozeMedication(this.hass, {
            entry_id: this.entryId,
            medication_id: medicationId,
          });
          break;
        case 'skip':
          await skipMedication(this.hass, {
            entry_id: this.entryId,
            medication_id: medicationId,
          });
          break;
      }
    } catch (error) {
      console.error('med-expert: Action failed:', error);
      // Could dispatch an error event here for parent to handle
    } finally {
      this._loading = false;
    }
  }

  private _handleRowClick(): void {
    // Dispatch event for parent to handle (e.g., open detail view)
    this.dispatchEvent(
      new CustomEvent('medication-click', {
        detail: { medicationId: this.medication.medicationId },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    const med = this.medication;
    const isPRN = med.status === MedicationStatus.PRN;
    const showActions = med.status !== MedicationStatus.OK;

    return html`
      <div
        class="medication-row ${this.compact ? 'compact' : ''} status-${med.status}"
        @click=${this._handleRowClick}
      >
        <div class="left-section">
          <med-expert-dosage-form-icon
            .form=${med.form}
            size="${this.compact ? 'small' : 'medium'}"
          ></med-expert-dosage-form-icon>

          <div class="info">
            <div class="name">${med.displayName}</div>
            <div class="details">
              ${!isPRN && med.nextDue
                ? html`<span class="next-due">${formatNextDue(med.nextDue)}</span>`
                : ''}
              ${med.nextDoseAmount
                ? html`<span class="dose">${med.nextDoseAmount}</span>`
                : ''}
            </div>
          </div>
        </div>

        <div class="right-section">
          ${this.showInventory
            ? html`
                <med-expert-inventory-badge
                  .inventory=${med.inventory}
                  .inhaler=${med.inhaler}
                  ?compact=${this.compact}
                ></med-expert-inventory-badge>
              `
            : ''}

          <med-expert-status-badge
            .status=${med.status}
            ?compact=${this.compact}
          ></med-expert-status-badge>

          ${showActions || isPRN
            ? html`
                <med-expert-action-buttons
                  medication-id="${med.medicationId}"
                  .status=${med.status}
                  ?compact=${this.compact}
                  ?loading=${this._loading}
                  @action=${this._handleAction}
                ></med-expert-action-buttons>
              `
            : ''}
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }

      .medication-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        min-height: var(--med-expert-row-height, 56px);
        background-color: var(--card-background-color, white);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        cursor: pointer;
        transition: background-color 0.2s ease;
        box-sizing: border-box;
      }

      .medication-row:hover {
        background-color: var(--secondary-background-color, #f5f5f5);
      }

      .medication-row.compact {
        padding: 8px 12px;
        min-height: var(--med-expert-compact-row-height, 40px);
      }

      .medication-row:last-child {
        border-bottom: none;
      }

      /* Status-based left border accent */
      .medication-row.status-due,
      .medication-row.status-missed {
        border-left: 3px solid var(--med-expert-status-due, var(--warning-color, #ff9800));
      }

      .medication-row.status-missed {
        border-left-color: var(--med-expert-status-missed, var(--error-color, #f44336));
      }

      .medication-row.status-snoozed {
        border-left: 3px solid var(--med-expert-status-snoozed, var(--info-color, #2196f3));
      }

      .left-section {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .compact .left-section {
        gap: 8px;
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .name {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .compact .name {
        font-size: 13px;
      }

      .details {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .compact .details {
        font-size: 11px;
      }

      .next-due {
        color: var(--secondary-text-color);
      }

      .dose {
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .right-section {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }

      .compact .right-section {
        gap: 8px;
      }

      /* Responsive adjustments */
      @media (max-width: 600px) {
        .medication-row {
          flex-wrap: wrap;
          gap: 8px;
        }

        .right-section {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-medication-row': MedicationRow;
  }
}
