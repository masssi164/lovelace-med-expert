/**
 * Med Expert Card - Main Component
 *
 * A Lovelace card for displaying and managing medications from the med-expert integration.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, getLovelace } from 'custom-card-helpers';

import type { MedExpertCardConfig, MedicationEntity, ProfileEntity, MedicationStatus } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';
import { getProfileEntity, getMedExpertEntries } from './api';

// Import components
import './components/medication-row';
import './components/medication-wizard';

/* eslint no-console: 0 */
console.info(
  `%c  MED-EXPERT-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Register card in the UI picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'med-expert-card',
  name: 'Med Expert Card',
  description: 'A custom card for managing medications with the med-expert integration',
  preview: true,
  documentationURL: 'https://github.com/flotterotter/lovelace-med-expert',
});

@customElement('med-expert-card')
export class MedExpertCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('med-expert-card-editor');
  }

  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    // Try to find a med-expert entry
    const entries = getMedExpertEntries(hass);
    if (entries.length > 0) {
      return {
        entry_id: entries[0].entryId,
      };
    }
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private config!: MedExpertCardConfig;
  @state() private _profile: ProfileEntity | null = null;
  @state() private _wizardOpen = false;

  public setConfig(config: MedExpertCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      show_header: true,
      show_adherence: true,
      show_inventory_warnings: true,
      compact: false,
      show_prn: true,
      ...config,
    };
  }

  public getCardSize(): number {
    const medicationCount = this._profile?.medications.length || 0;
    const headerSize = this.config.show_header ? 1 : 0;
    return headerSize + Math.max(1, medicationCount);
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    if (changedProps.has('config')) {
      return true;
    }

    if (changedProps.has('hass') && this.config.entry_id) {
      // Check if any relevant entity states changed
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
      if (!oldHass) return true;

      // Find entities for our entry and check for changes
      for (const entityId of Object.keys(this.hass.states)) {
        const state = this.hass.states[entityId];
        if (state.attributes?.entry_id === this.config.entry_id) {
          const oldState = oldHass.states[entityId];
          if (!oldState || oldState.state !== state.state) {
            return true;
          }
        }
      }
    }

    return false;
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (this.config.entry_id && (changedProps.has('hass') || changedProps.has('config'))) {
      this._profile = getProfileEntity(this.hass, this.config.entry_id);
    }
  }

  protected render(): TemplateResult {
    // Error states
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    // No entry_id configured
    if (!this.config.entry_id) {
      return this._renderNoConfig();
    }

    // No profile found
    if (!this._profile) {
      return this._showError('Profile not found. Check your entry_id configuration.');
    }

    const { medications, adherence, profileName } = this._profile;
    const title = this.config.title || profileName;

    // Filter medications based on config
    let filteredMedications = medications;
    if (!this.config.show_prn) {
      filteredMedications = medications.filter((m) => m.status !== ('prn' as MedicationStatus));
    }

    return html`
      <ha-card>
        ${this.config.show_header !== false ? this._renderHeader(title, adherence) : nothing}
        ${filteredMedications.length > 0 ? this._renderMedicationList(filteredMedications) : this._renderEmptyState()}
      </ha-card>

      <med-expert-wizard
        .hass=${this.hass}
        entry-id="${this.config.entry_id}"
        ?open=${this._wizardOpen}
        @wizard-cancel=${this._handleWizardClose}
        @wizard-complete=${this._handleWizardComplete}
      ></med-expert-wizard>
    `;
  }

  private _renderHeader(
    title: string,
    adherence: ProfileEntity['adherence']
  ): TemplateResult {
    return html`
      <div class="header">
        <div class="title-section">
          <ha-icon icon="mdi:pill"></ha-icon>
          <h2 class="title">${title}</h2>
        </div>

        <div class="header-actions">
          ${this.config.show_adherence && adherence
            ? html`
                <div
                  class="adherence-badge"
                  title="Adherence rate over ${adherence.periodDays} days"
                >
                  <ha-icon icon="mdi:chart-arc"></ha-icon>
                  <span>${Math.round(adherence.adherenceRate * 100)}%</span>
                </div>
              `
            : nothing}

          <button class="add-btn" @click=${this._handleAddMedication} title="Add medication">
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _renderMedicationList(medications: MedicationEntity[]): TemplateResult {
    return html`
      <div class="medication-list">
        ${medications.map(
          (med) => html`
            <med-expert-medication-row
              .hass=${this.hass}
              .medication=${med}
              entry-id="${this.config.entry_id}"
              ?compact=${this.config.compact}
              ?show-inventory=${this.config.show_inventory_warnings}
              @medication-click=${this._handleMedicationClick}
            ></med-expert-medication-row>
          `
        )}
      </div>
    `;
  }

  private _renderEmptyState(): TemplateResult {
    return html`
      <div class="empty-state">
        <ha-icon icon="mdi:pill-off"></ha-icon>
        <p>No medications configured</p>
        <button class="add-first-btn" @click=${this._handleAddMedication}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Add your first medication
        </button>
      </div>
    `;
  }

  private _renderNoConfig(): TemplateResult {
    return html`
      <ha-card>
        <div class="no-config">
          <ha-icon icon="mdi:cog-off"></ha-icon>
          <p>Please configure the card</p>
          <p class="hint">Select a med-expert profile in the card editor</p>
        </div>
      </ha-card>
    `;
  }

  private _handleAddMedication(): void {
    this._wizardOpen = true;
  }

  private _handleWizardClose(): void {
    this._wizardOpen = false;
  }

  private _handleWizardComplete(e: CustomEvent): void {
    this._wizardOpen = false;
    const { medication } = e.detail;
    console.log('Medication added:', medication);
    // Force refresh of medication list
    this.requestUpdate();
  }

  private _handleMedicationClick(e: CustomEvent): void {
    const { medicationId } = e.detail;
    console.log('Medication clicked:', medicationId);
    // TODO: Open detail/edit view
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <ha-card>
        <hui-warning>${warning}</hui-warning>
      </ha-card>
    `;
  }

  private _showError(error: string): TemplateResult {
    return html`
      <ha-card>
        <div class="error-state">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${error}</p>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }

      ha-card {
        overflow: hidden;
      }

      /* Header */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        background-color: var(--card-background-color, white);
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .title-section ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 24px;
      }

      .title {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .adherence-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 16px;
        background-color: color-mix(in srgb, var(--success-color, #4caf50) 15%, transparent);
        color: var(--success-color, #4caf50);
        font-size: 13px;
        font-weight: 500;
      }

      .adherence-badge ha-icon {
        --mdc-icon-size: 16px;
      }

      .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background-color: var(--primary-color);
        color: white;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .add-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .add-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Medication List */
      .medication-list {
        max-height: 400px;
        overflow-y: auto;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        color: var(--secondary-text-color);
        opacity: 0.5;
        margin-bottom: 16px;
      }

      .empty-state p {
        margin: 0 0 16px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .add-first-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 2px dashed var(--primary-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .add-first-btn:hover {
        background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .add-first-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* No Config State */
      .no-config {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        text-align: center;
      }

      .no-config ha-icon {
        --mdc-icon-size: 48px;
        color: var(--warning-color, #ff9800);
        margin-bottom: 16px;
      }

      .no-config p {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .no-config .hint {
        margin-top: 8px;
        color: var(--secondary-text-color);
        font-size: 12px;
      }

      /* Error State */
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        text-align: center;
      }

      .error-state ha-icon {
        --mdc-icon-size: 48px;
        color: var(--error-color, #f44336);
        margin-bottom: 16px;
      }

      .error-state p {
        margin: 0;
        color: var(--error-color, #f44336);
        font-size: 14px;
      }

      /* Responsive */
      @media (max-width: 600px) {
        .header {
          padding: 12px;
        }

        .title {
          font-size: 16px;
        }

        .medication-list {
          max-height: 300px;
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-card': MedExpertCard;
  }
}
