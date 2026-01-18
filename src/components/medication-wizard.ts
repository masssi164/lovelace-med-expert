/**
 * Medication Wizard Component
 *
 * Multi-step dialog for adding/editing medications.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, css, CSSResultGroup, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  WizardState,
  WizardStep,
  DosageForm,
  ScheduleKind,
  DoseQuantity,
  DOSAGE_FORM_INFO,
} from '../types';
import { addMedication } from '../api';

const STEPS: WizardStep[] = ['basics', 'schedule', 'dosage', 'options', 'review'];
const STEP_TITLES: Record<WizardStep, string> = {
  basics: 'Basic Info',
  schedule: 'Schedule',
  dosage: 'Dosage',
  options: 'Options',
  review: 'Review',
};

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@customElement('med-expert-wizard')
export class MedicationWizard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String, attribute: 'entry-id' }) entryId = '';
  @property({ type: Boolean }) open = false;

  @state() private _state: WizardState = this._getInitialState();

  private _getInitialState(): WizardState {
    return {
      step: 'basics',
      mode: 'add',
      displayName: '',
      form: DosageForm.TABLET,
      scheduleKind: ScheduleKind.TIMES_PER_DAY,
      times: ['08:00'],
      weekdays: [0, 1, 2, 3, 4], // Mon-Fri
      intervalMinutes: 480, // 8 hours
      defaultDose: null,
      slotDoses: {},
      unit: 'tablet',
      inventoryEnabled: false,
      currentQuantity: null,
      refillThreshold: null,
      notes: '',
      errors: {},
      isSubmitting: false,
    };
  }

  public reset(): void {
    this._state = this._getInitialState();
  }

  private get _currentStepIndex(): number {
    return STEPS.indexOf(this._state.step);
  }

  private _goToStep(step: WizardStep): void {
    this._state = { ...this._state, step, errors: {} };
  }

  private _handleNext(): void {
    if (!this._validateCurrentStep()) {
      return;
    }

    const nextIndex = this._currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      this._goToStep(STEPS[nextIndex]);
    }
  }

  private _handleBack(): void {
    const prevIndex = this._currentStepIndex - 1;
    if (prevIndex >= 0) {
      this._goToStep(STEPS[prevIndex]);
    }
  }

  private _handleCancel(): void {
    this.dispatchEvent(new CustomEvent('wizard-cancel', { bubbles: true, composed: true }));
    this.reset();
  }

  private async _handleSubmit(): Promise<void> {
    if (!this._validateCurrentStep()) {
      return;
    }

    this._state = { ...this._state, isSubmitting: true };

    try {
      const serviceData = this._buildServiceData();
      await addMedication(this.hass, serviceData);

      this.dispatchEvent(
        new CustomEvent('wizard-complete', {
          detail: { medicationName: this._state.displayName },
          bubbles: true,
          composed: true,
        })
      );
      this.reset();
    } catch (error) {
      console.error('Failed to add medication:', error);
      this._state = {
        ...this._state,
        isSubmitting: false,
        errors: { submit: 'Failed to add medication. Please try again.' },
      };
    }
  }

  private _buildServiceData(): any {
    const s = this._state;
    const data: any = {
      entry_id: this.entryId,
      display_name: s.displayName,
      form: s.form,
      schedule_kind: s.scheduleKind,
    };

    // Schedule-specific fields
    switch (s.scheduleKind) {
      case ScheduleKind.TIMES_PER_DAY:
        data.times = s.times;
        break;
      case ScheduleKind.WEEKLY:
        data.times = s.times;
        data.weekdays = s.weekdays;
        break;
      case ScheduleKind.INTERVAL:
        data.interval_minutes = s.intervalMinutes;
        break;
    }

    // Dosage
    if (s.defaultDose) {
      data.default_dose = {
        numerator: s.defaultDose.numerator,
        denominator: s.defaultDose.denominator,
        unit: s.defaultDose.unit,
      };
    }

    // Inventory
    if (s.inventoryEnabled && s.currentQuantity !== null) {
      data.inventory = {
        current_quantity: s.currentQuantity,
        ...(s.refillThreshold !== null && { refill_threshold: s.refillThreshold }),
      };
    }

    // Notes
    if (s.notes) {
      data.notes = s.notes;
    }

    return data;
  }

  private _validateCurrentStep(): boolean {
    const errors: Record<string, string> = {};

    switch (this._state.step) {
      case 'basics':
        if (!this._state.displayName.trim()) {
          errors.displayName = 'Name is required';
        }
        break;

      case 'schedule':
        if (this._state.scheduleKind === ScheduleKind.TIMES_PER_DAY && this._state.times.length === 0) {
          errors.times = 'At least one time is required';
        }
        if (this._state.scheduleKind === ScheduleKind.WEEKLY) {
          if (this._state.weekdays.length === 0) {
            errors.weekdays = 'At least one weekday is required';
          }
          if (this._state.times.length === 0) {
            errors.times = 'At least one time is required';
          }
        }
        break;

      case 'dosage':
        // Optional, no validation needed
        break;

      case 'options':
        if (this._state.inventoryEnabled && this._state.currentQuantity !== null && this._state.currentQuantity < 0) {
          errors.currentQuantity = 'Quantity must be positive';
        }
        break;
    }

    this._state = { ...this._state, errors };
    return Object.keys(errors).length === 0;
  }

  protected render(): TemplateResult {
    if (!this.open) {
      return html``;
    }

    return html`
      <div class="wizard-overlay" @click=${this._handleOverlayClick}>
        <div class="wizard-dialog" @click=${(e: Event) => e.stopPropagation()}>
          ${this._renderHeader()}
          ${this._renderStepper()}
          <div class="wizard-content">${this._renderCurrentStep()}</div>
          ${this._renderFooter()}
        </div>
      </div>
    `;
  }

  private _handleOverlayClick(): void {
    // Optional: Close on overlay click
  }

  private _renderHeader(): TemplateResult {
    return html`
      <div class="wizard-header">
        <h2>${this._state.mode === 'add' ? 'Add Medication' : 'Edit Medication'}</h2>
        <button class="close-btn" @click=${this._handleCancel}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderStepper(): TemplateResult {
    return html`
      <div class="stepper">
        ${STEPS.map((step, index) => {
          const isActive = step === this._state.step;
          const isCompleted = index < this._currentStepIndex;
          return html`
            <div class="step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
              <div class="step-indicator">
                ${isCompleted ? html`<ha-icon icon="mdi:check"></ha-icon>` : html`<span>${index + 1}</span>`}
              </div>
              <span class="step-label">${STEP_TITLES[step]}</span>
            </div>
            ${index < STEPS.length - 1 ? html`<div class="step-connector"></div>` : nothing}
          `;
        })}
      </div>
    `;
  }

  private _renderCurrentStep(): TemplateResult {
    switch (this._state.step) {
      case 'basics':
        return this._renderBasicsStep();
      case 'schedule':
        return this._renderScheduleStep();
      case 'dosage':
        return this._renderDosageStep();
      case 'options':
        return this._renderOptionsStep();
      case 'review':
        return this._renderReviewStep();
      default:
        return html``;
    }
  }

  private _renderBasicsStep(): TemplateResult {
    return html`
      <div class="step-content">
        <div class="field">
          <label>Medication Name *</label>
          <input
            type="text"
            .value=${this._state.displayName}
            @input=${(e: Event) => this._updateState('displayName', (e.target as HTMLInputElement).value)}
            placeholder="e.g., Aspirin, Metformin"
          />
          ${this._state.errors.displayName ? html`<span class="error">${this._state.errors.displayName}</span>` : nothing}
        </div>

        <div class="field">
          <label>Dosage Form</label>
          <div class="form-grid">
            ${Object.values(DosageForm).map(
              (form) => html`
                <button
                  class="form-option ${this._state.form === form ? 'selected' : ''}"
                  @click=${() => this._selectDosageForm(form)}
                >
                  <ha-icon icon="${DOSAGE_FORM_INFO[form].icon}"></ha-icon>
                  <span>${DOSAGE_FORM_INFO[form].displayName}</span>
                </button>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }

  private _selectDosageForm(form: DosageForm): void {
    const info = DOSAGE_FORM_INFO[form];
    this._state = {
      ...this._state,
      form,
      unit: info.compatibleUnits[0] || 'unit',
    };
  }

  private _renderScheduleStep(): TemplateResult {
    return html`
      <div class="step-content">
        <div class="field">
          <label>Schedule Type</label>
          <div class="schedule-options">
            ${[
              { kind: ScheduleKind.TIMES_PER_DAY, label: 'Times per Day', icon: 'mdi:clock-outline' },
              { kind: ScheduleKind.INTERVAL, label: 'Every X Hours', icon: 'mdi:timer-outline' },
              { kind: ScheduleKind.WEEKLY, label: 'Weekly Schedule', icon: 'mdi:calendar-week' },
              { kind: ScheduleKind.AS_NEEDED, label: 'As Needed (PRN)', icon: 'mdi:pill' },
            ].map(
              (opt) => html`
                <button
                  class="schedule-option ${this._state.scheduleKind === opt.kind ? 'selected' : ''}"
                  @click=${() => this._updateState('scheduleKind', opt.kind)}
                >
                  <ha-icon icon="${opt.icon}"></ha-icon>
                  <span>${opt.label}</span>
                </button>
              `
            )}
          </div>
        </div>

        ${this._state.scheduleKind === ScheduleKind.TIMES_PER_DAY ? this._renderTimesInput() : nothing}
        ${this._state.scheduleKind === ScheduleKind.WEEKLY ? this._renderWeeklyInput() : nothing}
        ${this._state.scheduleKind === ScheduleKind.INTERVAL ? this._renderIntervalInput() : nothing}
        ${this._state.scheduleKind === ScheduleKind.AS_NEEDED
          ? html`<p class="hint">This medication will be available to take whenever needed.</p>`
          : nothing}
      </div>
    `;
  }

  private _renderTimesInput(): TemplateResult {
    return html`
      <div class="field">
        <label>Times</label>
        <div class="times-list">
          ${this._state.times.map(
            (time, index) => html`
              <div class="time-input">
                <input
                  type="time"
                  .value=${time}
                  @change=${(e: Event) => this._updateTime(index, (e.target as HTMLInputElement).value)}
                />
                ${this._state.times.length > 1
                  ? html`
                      <button class="remove-time" @click=${() => this._removeTime(index)}>
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    `
                  : nothing}
              </div>
            `
          )}
          <button class="add-time" @click=${this._addTime}>
            <ha-icon icon="mdi:plus"></ha-icon> Add Time
          </button>
        </div>
        ${this._state.errors.times ? html`<span class="error">${this._state.errors.times}</span>` : nothing}
      </div>
    `;
  }

  private _renderWeeklyInput(): TemplateResult {
    return html`
      ${this._renderTimesInput()}
      <div class="field">
        <label>Weekdays</label>
        <div class="weekday-grid">
          ${WEEKDAY_NAMES.map((day, index) => {
            const isSelected = this._state.weekdays.includes(index);
            return html`
              <button
                class="weekday-btn ${isSelected ? 'selected' : ''}"
                @click=${() => this._toggleWeekday(index)}
              >
                ${day}
              </button>
            `;
          })}
        </div>
        ${this._state.errors.weekdays ? html`<span class="error">${this._state.errors.weekdays}</span>` : nothing}
      </div>
    `;
  }

  private _renderIntervalInput(): TemplateResult {
    const hours = Math.floor(this._state.intervalMinutes / 60);
    return html`
      <div class="field">
        <label>Interval (hours)</label>
        <input
          type="number"
          min="1"
          max="72"
          .value=${String(hours)}
          @input=${(e: Event) => {
            const h = parseInt((e.target as HTMLInputElement).value, 10) || 1;
            this._updateState('intervalMinutes', h * 60);
          }}
        />
        <span class="hint">Take every ${hours} hour${hours !== 1 ? 's' : ''}</span>
      </div>
    `;
  }

  private _renderDosageStep(): TemplateResult {
    const formInfo = DOSAGE_FORM_INFO[this._state.form];

    return html`
      <div class="step-content">
        <div class="field">
          <label>Default Dose (Optional)</label>
          <div class="dose-input">
            <input
              type="number"
              min="0"
              step="0.25"
              .value=${this._state.defaultDose?.numerator || ''}
              @input=${(e: Event) => this._updateDose((e.target as HTMLInputElement).value)}
              placeholder="Amount"
            />
            <select @change=${(e: Event) => this._updateState('unit', (e.target as HTMLSelectElement).value)}>
              ${formInfo.compatibleUnits.map(
                (unit) => html`<option value=${unit} ?selected=${this._state.unit === unit}>${unit}</option>`
              )}
            </select>
          </div>
        </div>

        <p class="hint">
          You can specify different doses for each time slot after creating the medication.
        </p>
      </div>
    `;
  }

  private _renderOptionsStep(): TemplateResult {
    return html`
      <div class="step-content">
        <div class="field checkbox-field">
          <label>
            <input
              type="checkbox"
              .checked=${this._state.inventoryEnabled}
              @change=${(e: Event) => this._updateState('inventoryEnabled', (e.target as HTMLInputElement).checked)}
            />
            Track Inventory
          </label>
        </div>

        ${this._state.inventoryEnabled
          ? html`
              <div class="field">
                <label>Current Quantity</label>
                <input
                  type="number"
                  min="0"
                  .value=${this._state.currentQuantity !== null ? String(this._state.currentQuantity) : ''}
                  @input=${(e: Event) => {
                    const val = (e.target as HTMLInputElement).value;
                    this._updateState('currentQuantity', val ? parseInt(val, 10) : null);
                  }}
                />
              </div>

              <div class="field">
                <label>Refill Threshold (Optional)</label>
                <input
                  type="number"
                  min="0"
                  .value=${this._state.refillThreshold !== null ? String(this._state.refillThreshold) : ''}
                  @input=${(e: Event) => {
                    const val = (e.target as HTMLInputElement).value;
                    this._updateState('refillThreshold', val ? parseInt(val, 10) : null);
                  }}
                  placeholder="Warn when below"
                />
              </div>
            `
          : nothing}

        <div class="field">
          <label>Notes (Optional)</label>
          <textarea
            .value=${this._state.notes}
            @input=${(e: Event) => this._updateState('notes', (e.target as HTMLTextAreaElement).value)}
            placeholder="Any additional notes..."
            rows="3"
          ></textarea>
        </div>
      </div>
    `;
  }

  private _renderReviewStep(): TemplateResult {
    const formInfo = DOSAGE_FORM_INFO[this._state.form];

    return html`
      <div class="step-content review">
        <div class="review-section">
          <h4>Medication</h4>
          <p><strong>${this._state.displayName}</strong> (${formInfo.displayName})</p>
        </div>

        <div class="review-section">
          <h4>Schedule</h4>
          <p>${this._getScheduleSummary()}</p>
        </div>

        ${this._state.defaultDose
          ? html`
              <div class="review-section">
                <h4>Dose</h4>
                <p>${this._formatDose(this._state.defaultDose)}</p>
              </div>
            `
          : nothing}

        ${this._state.inventoryEnabled
          ? html`
              <div class="review-section">
                <h4>Inventory</h4>
                <p>
                  Current: ${this._state.currentQuantity ?? 'Not set'}
                  ${this._state.refillThreshold !== null ? ` | Refill at: ${this._state.refillThreshold}` : ''}
                </p>
              </div>
            `
          : nothing}

        ${this._state.notes
          ? html`
              <div class="review-section">
                <h4>Notes</h4>
                <p>${this._state.notes}</p>
              </div>
            `
          : nothing}

        ${this._state.errors.submit ? html`<div class="error submit-error">${this._state.errors.submit}</div>` : nothing}
      </div>
    `;
  }

  private _getScheduleSummary(): string {
    switch (this._state.scheduleKind) {
      case ScheduleKind.TIMES_PER_DAY:
        return `Daily at ${this._state.times.join(', ')}`;
      case ScheduleKind.WEEKLY:
        const days = this._state.weekdays.map((d) => WEEKDAY_NAMES[d]).join(', ');
        return `${days} at ${this._state.times.join(', ')}`;
      case ScheduleKind.INTERVAL:
        return `Every ${this._state.intervalMinutes / 60} hours`;
      case ScheduleKind.AS_NEEDED:
        return 'As needed (PRN)';
      default:
        return 'Not set';
    }
  }

  private _formatDose(dose: DoseQuantity): string {
    if (dose.denominator === 1) {
      return `${dose.numerator} ${dose.unit}`;
    }
    return `${dose.numerator}/${dose.denominator} ${dose.unit}`;
  }

  private _renderFooter(): TemplateResult {
    const isFirstStep = this._currentStepIndex === 0;
    const isLastStep = this._state.step === 'review';

    return html`
      <div class="wizard-footer">
        <button class="btn cancel" @click=${this._handleCancel} ?disabled=${this._state.isSubmitting}>Cancel</button>

        <div class="footer-actions">
          ${!isFirstStep
            ? html`
                <button class="btn back" @click=${this._handleBack} ?disabled=${this._state.isSubmitting}>
                  <ha-icon icon="mdi:arrow-left"></ha-icon> Back
                </button>
              `
            : nothing}

          ${isLastStep
            ? html`
                <button class="btn primary" @click=${this._handleSubmit} ?disabled=${this._state.isSubmitting}>
                  ${this._state.isSubmitting
                    ? html`<ha-circular-progress size="small" active></ha-circular-progress>`
                    : html`<ha-icon icon="mdi:check"></ha-icon>`}
                  ${this._state.mode === 'add' ? 'Add Medication' : 'Save Changes'}
                </button>
              `
            : html`
                <button class="btn primary" @click=${this._handleNext}>
                  Next <ha-icon icon="mdi:arrow-right"></ha-icon>
                </button>
              `}
        </div>
      </div>
    `;
  }

  // State update helpers
  private _updateState(key: keyof WizardState, value: any): void {
    this._state = { ...this._state, [key]: value };
  }

  private _updateTime(index: number, value: string): void {
    const times = [...this._state.times];
    times[index] = value;
    this._updateState('times', times);
  }

  private _addTime(): void {
    this._updateState('times', [...this._state.times, '12:00']);
  }

  private _removeTime(index: number): void {
    const times = this._state.times.filter((_, i) => i !== index);
    this._updateState('times', times);
  }

  private _toggleWeekday(day: number): void {
    const weekdays = this._state.weekdays.includes(day)
      ? this._state.weekdays.filter((d) => d !== day)
      : [...this._state.weekdays, day].sort();
    this._updateState('weekdays', weekdays);
  }

  private _updateDose(value: string): void {
    if (!value) {
      this._updateState('defaultDose', null);
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return;

    // Simple conversion - could be improved to handle fractions
    const numerator = Math.round(num * 4);
    const denominator = 4;

    this._updateState('defaultDose', {
      numerator: numerator,
      denominator: denominator,
      unit: this._state.unit,
    } as DoseQuantity);
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }

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
        z-index: 100;
        padding: 16px;
      }

      .wizard-dialog {
        background: var(--card-background-color, white);
        border-radius: 16px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      /* Header */
      .wizard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      .wizard-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        color: var(--secondary-text-color);
        border-radius: 50%;
      }

      .close-btn:hover {
        background: var(--secondary-background-color);
      }

      /* Stepper */
      .stepper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        gap: 8px;
        background: var(--secondary-background-color, #f5f5f5);
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .step-indicator {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--divider-color, #e0e0e0);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .step.active .step-indicator {
        background: var(--primary-color);
        color: white;
      }

      .step.completed .step-indicator {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .step-label {
        font-size: 10px;
        color: var(--secondary-text-color);
        display: none;
      }

      .step.active .step-label {
        display: block;
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .step-connector {
        width: 24px;
        height: 2px;
        background: var(--divider-color, #e0e0e0);
      }

      /* Content */
      .wizard-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .step-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field label {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .field input,
      .field select,
      .field textarea {
        padding: 10px 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color);
      }

      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .error {
        color: var(--error-color, #f44336);
        font-size: 12px;
      }

      .hint {
        color: var(--secondary-text-color);
        font-size: 12px;
        margin: 0;
      }

      /* Form Grid */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
      }

      .form-option,
      .schedule-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: none;
        cursor: pointer;
        font-size: 11px;
        color: var(--primary-text-color);
        transition: all 0.2s;
      }

      .form-option:hover,
      .schedule-option:hover {
        background: var(--secondary-background-color);
      }

      .form-option.selected,
      .schedule-option.selected {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }

      .schedule-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      /* Times */
      .times-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .time-input {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .time-input input {
        flex: 1;
      }

      .remove-time,
      .add-time {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        background: none;
        cursor: pointer;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .add-time:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .remove-time {
        padding: 4px;
        border: none;
        color: var(--error-color);
      }

      /* Weekdays */
      .weekday-grid {
        display: flex;
        gap: 4px;
      }

      .weekday-btn {
        flex: 1;
        padding: 8px 4px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: none;
        cursor: pointer;
        font-size: 11px;
        color: var(--primary-text-color);
      }

      .weekday-btn.selected {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }

      /* Dose Input */
      .dose-input {
        display: flex;
        gap: 8px;
      }

      .dose-input input {
        flex: 1;
      }

      .dose-input select {
        min-width: 100px;
      }

      /* Checkbox */
      .checkbox-field label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .checkbox-field input {
        width: 18px;
        height: 18px;
      }

      /* Review */
      .review .review-section {
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .review .review-section:last-of-type {
        border-bottom: none;
      }

      .review h4 {
        margin: 0 0 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .review p {
        margin: 0;
        font-size: 14px;
      }

      .submit-error {
        padding: 12px;
        background: color-mix(in srgb, var(--error-color) 10%, transparent);
        border-radius: 8px;
      }

      /* Footer */
      .wizard-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-top: 1px solid var(--divider-color);
      }

      .footer-actions {
        display: flex;
        gap: 8px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn.cancel {
        background: none;
        color: var(--secondary-text-color);
      }

      .btn.back {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .btn.primary {
        background: var(--primary-color);
        color: white;
      }

      .btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      @media (max-width: 500px) {
        .schedule-options {
          grid-template-columns: 1fr;
        }

        .form-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-wizard': MedicationWizard;
  }
}
