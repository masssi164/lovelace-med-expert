/**
 * Med Expert Card Editor
 *
 * Visual editor for configuring the med-expert card.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

import { MedExpertCardConfig } from './types';
import { getMedExpertEntries } from './api';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';

interface ProfileEntry {
  entryId: string;
  profileName: string;
}

@customElement('med-expert-card-editor')
export class MedExpertCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: MedExpertCardConfig;
  @state() private _helpers?: any;
  @state() private _profiles: ProfileEntry[] = [];

  private _initialized = false;

  static elementDefinitions = {
    ...textfieldDefinition,
    ...selectDefinition,
    ...switchDefinition,
    ...formfieldDefinition,
  };

  public setConfig(config: MedExpertCardConfig): void {
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }
    return true;
  }

  private _initialize(): void {
    if (!this.hass) return;
    if (!this._config) return;
    if (!this._helpers) return;

    // Discover available med-expert profiles
    this._profiles = getMedExpertEntries(this.hass);
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  // Getters for form values
  get _entryId(): string {
    return this._config?.entry_id || '';
  }

  get _title(): string {
    return this._config?.title || '';
  }

  get _showHeader(): boolean {
    return this._config?.show_header !== false;
  }

  get _showAdherence(): boolean {
    return this._config?.show_adherence !== false;
  }

  get _showInventoryWarnings(): boolean {
    return this._config?.show_inventory_warnings !== false;
  }

  get _compact(): boolean {
    return this._config?.compact || false;
  }

  get _showPrn(): boolean {
    return this._config?.show_prn !== false;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._helpers) {
      return html`<div class="loading">Loading...</div>`;
    }

    return html`
      <div class="card-config">
        <div class="section">
          <div class="section-title">Profile</div>

          ${this._profiles.length > 0
            ? html`
                <mwc-select
                  naturalMenuWidth
                  fixedMenuPosition
                  label="Med Expert Profile (Required)"
                  .configValue=${'entry_id'}
                  .value=${this._entryId}
                  @selected=${this._valueChanged}
                  @closed=${(ev: Event) => ev.stopPropagation()}
                >
                  ${this._profiles.map(
                    (profile) => html`
                      <mwc-list-item .value=${profile.entryId}>
                        ${profile.profileName}
                      </mwc-list-item>
                    `
                  )}
                </mwc-select>
              `
            : html`
                <div class="no-profiles">
                  <ha-icon icon="mdi:alert"></ha-icon>
                  <span>No med-expert profiles found. Please set up the med-expert integration first.</span>
                </div>
              `}
        </div>

        <div class="section">
          <div class="section-title">Appearance</div>

          <mwc-textfield
            label="Custom Title (Optional)"
            .value=${this._title}
            .configValue=${'title'}
            @input=${this._valueChanged}
            helper="Leave empty to use profile name"
          ></mwc-textfield>

          <mwc-formfield .label=${`Show header ${this._showHeader ? '(on)' : '(off)'}`}>
            <mwc-switch
              .checked=${this._showHeader}
              .configValue=${'show_header'}
              @change=${this._valueChanged}
            ></mwc-switch>
          </mwc-formfield>

          <mwc-formfield .label=${`Compact mode ${this._compact ? '(on)' : '(off)'}`}>
            <mwc-switch
              .checked=${this._compact}
              .configValue=${'compact'}
              @change=${this._valueChanged}
            ></mwc-switch>
          </mwc-formfield>
        </div>

        <div class="section">
          <div class="section-title">Display Options</div>

          <mwc-formfield .label=${`Show adherence rate ${this._showAdherence ? '(on)' : '(off)'}`}>
            <mwc-switch
              .checked=${this._showAdherence}
              .configValue=${'show_adherence'}
              @change=${this._valueChanged}
            ></mwc-switch>
          </mwc-formfield>

          <mwc-formfield .label=${`Show inventory warnings ${this._showInventoryWarnings ? '(on)' : '(off)'}`}>
            <mwc-switch
              .checked=${this._showInventoryWarnings}
              .configValue=${'show_inventory_warnings'}
              @change=${this._valueChanged}
            ></mwc-switch>
          </mwc-formfield>

          <mwc-formfield .label=${`Show PRN medications ${this._showPrn ? '(on)' : '(off)'}`}>
            <mwc-switch
              .checked=${this._showPrn}
              .configValue=${'show_prn'}
              @change=${this._valueChanged}
            ></mwc-switch>
          </mwc-formfield>
        </div>
      </div>
    `;
  }

  private _valueChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target as any;
    const configValue = target.configValue;

    if (!configValue) {
      return;
    }

    let newValue: string | boolean;
    if (target.checked !== undefined) {
      // Switch
      newValue = target.checked;
    } else if (target.selected !== undefined) {
      // Select
      newValue = target.value;
    } else {
      // Text field
      newValue = target.value;
    }

    // Check if value actually changed
    if ((this._config as any)[configValue] === newValue) {
      return;
    }

    // Update config
    if (newValue === '' || newValue === undefined) {
      // Remove empty values
      const tmpConfig = { ...this._config };
      delete (tmpConfig as any)[configValue];
      this._config = tmpConfig;
    } else {
      this._config = {
        ...this._config,
        [configValue]: newValue,
      };
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
    .card-config {
      padding: 8px 0;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
      width: 100%;
    }

    mwc-formfield {
      display: block;
      padding: 8px 0;
    }

    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }

    .no-profiles {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 8px;
      background-color: color-mix(in srgb, var(--warning-color, #ff9800) 15%, transparent);
      color: var(--warning-color, #ff9800);
      font-size: 13px;
    }

    .no-profiles ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }

    .loading {
      padding: 16px;
      text-align: center;
      color: var(--secondary-text-color);
    }
  `;
}
