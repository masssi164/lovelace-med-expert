/**
 * Inventory Badge Component
 *
 * Shows remaining inventory with warning state for low levels.
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { InventoryInfo, InhalerInfo } from '../types';
import { isInventoryLow, isInhalerLow } from '../api';

@customElement('med-expert-inventory-badge')
export class InventoryBadge extends LitElement {
  @property({ type: Object }) inventory: InventoryInfo | null = null;
  @property({ type: Object }) inhaler: InhalerInfo | null = null;
  @property({ type: Boolean }) compact = false;

  private get displayValue(): { value: string; unit: string; isLow: boolean } | null {
    // Prefer inhaler info for inhaler-type medications
    if (this.inhaler) {
      return {
        value: String(this.inhaler.remainingPuffs),
        unit: 'puffs',
        isLow: isInhalerLow(this.inhaler),
      };
    }

    if (this.inventory && this.inventory.currentQuantity !== null) {
      return {
        value: String(this.inventory.currentQuantity),
        unit: 'left',
        isLow: isInventoryLow(this.inventory),
      };
    }

    return null;
  }

  protected render(): TemplateResult | typeof nothing {
    const display = this.displayValue;

    if (!display) {
      return nothing;
    }

    return html`
      <div
        class="inventory-badge ${this.compact ? 'compact' : ''} ${display.isLow ? 'low' : ''}"
        title="${display.isLow ? 'Low inventory - consider refilling' : 'Inventory remaining'}"
      >
        ${display.isLow ? html`<ha-icon icon="mdi:alert"></ha-icon>` : html`<ha-icon icon="mdi:package-variant"></ha-icon>`}
        <span class="value">${display.value}</span>
        ${!this.compact ? html`<span class="unit">${display.unit}</span>` : ''}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: inline-flex;
      }

      .inventory-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 12px;
        background-color: var(--secondary-background-color, #f5f5f5);
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
      }

      .inventory-badge.compact {
        padding: 2px 6px;
      }

      .inventory-badge.low {
        background-color: color-mix(in srgb, var(--error-color, #f44336) 15%, transparent);
        color: var(--error-color, #f44336);
      }

      .inventory-badge.low ha-icon {
        color: var(--error-color, #f44336);
      }

      ha-icon {
        --mdc-icon-size: 14px;
        color: var(--secondary-text-color);
      }

      .value {
        font-weight: 600;
      }

      .unit {
        opacity: 0.8;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-inventory-badge': InventoryBadge;
  }
}
