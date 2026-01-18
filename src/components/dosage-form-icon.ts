/**
 * Dosage Form Icon Component
 *
 * Displays an icon representing the medication dosage form.
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DosageForm, DOSAGE_FORM_INFO } from '../types';

@customElement('med-expert-dosage-form-icon')
export class DosageFormIcon extends LitElement {
  @property({ type: String }) form: DosageForm = DosageForm.OTHER;
  @property({ type: Boolean }) showLabel = false;
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';

  private get formInfo() {
    return DOSAGE_FORM_INFO[this.form] || DOSAGE_FORM_INFO[DosageForm.OTHER];
  }

  protected render(): TemplateResult {
    const info = this.formInfo;

    return html`
      <div class="form-icon ${this.size}" title="${info.displayName}">
        <ha-icon .icon=${info.icon}></ha-icon>
        ${this.showLabel ? html`<span class="label">${info.displayName}</span>` : ''}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: inline-flex;
      }

      .form-icon {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--secondary-text-color);
      }

      .form-icon.small ha-icon {
        --mdc-icon-size: 16px;
      }

      .form-icon.medium ha-icon {
        --mdc-icon-size: 24px;
      }

      .form-icon.large ha-icon {
        --mdc-icon-size: 32px;
      }

      .label {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-dosage-form-icon': DosageFormIcon;
  }
}
