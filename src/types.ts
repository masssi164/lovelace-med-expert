import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'med-expert-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

// ============================================================================
// Enums (matching Python backend)
// ============================================================================

export enum MedicationStatus {
  OK = 'ok',
  DUE = 'due',
  SNOOZED = 'snoozed',
  MISSED = 'missed',
  PRN = 'prn',
}

export enum ScheduleKind {
  TIMES_PER_DAY = 'times_per_day',
  INTERVAL = 'interval',
  WEEKLY = 'weekly',
  AS_NEEDED = 'as_needed',
  DEPOT = 'depot',
}

export enum DosageForm {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  INJECTION = 'injection',
  NASAL_SPRAY = 'nasal_spray',
  INHALER = 'inhaler',
  DROPS = 'drops',
  CREAM = 'cream',
  PATCH = 'patch',
  SUPPOSITORY = 'suppository',
  LIQUID = 'liquid',
  POWDER = 'powder',
  OTHER = 'other',
}

export enum LogAction {
  TAKEN = 'taken',
  PRN_TAKEN = 'prn_taken',
  SNOOZED = 'snoozed',
  SKIPPED = 'skipped',
  MISSED = 'missed',
  REFILLED = 'refilled',
}

export enum InjectionSite {
  LEFT_ARM = 'left_arm',
  RIGHT_ARM = 'right_arm',
  LEFT_THIGH = 'left_thigh',
  RIGHT_THIGH = 'right_thigh',
  ABDOMEN_LEFT = 'abdomen_left',
  ABDOMEN_RIGHT = 'abdomen_right',
  LEFT_BUTTOCK = 'left_buttock',
  RIGHT_BUTTOCK = 'right_buttock',
}

// ============================================================================
// Dosage Form Metadata
// ============================================================================

export interface DosageFormInfo {
  form: DosageForm;
  displayName: string;
  icon: string;
  compatibleUnits: string[];
  supportsSiteTracking: boolean;
  supportsPuffCounter: boolean;
}

export const DOSAGE_FORM_INFO: Record<DosageForm, DosageFormInfo> = {
  [DosageForm.TABLET]: {
    form: DosageForm.TABLET,
    displayName: 'Tablet',
    icon: 'mdi:pill',
    compatibleUnits: ['tablet', 'mg', 'g', 'mcg'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.CAPSULE]: {
    form: DosageForm.CAPSULE,
    displayName: 'Capsule',
    icon: 'mdi:pill',
    compatibleUnits: ['capsule', 'mg', 'g'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.INJECTION]: {
    form: DosageForm.INJECTION,
    displayName: 'Injection',
    icon: 'mdi:needle',
    compatibleUnits: ['ml', 'IU', 'mg', 'mcg', 'unit'],
    supportsSiteTracking: true,
    supportsPuffCounter: false,
  },
  [DosageForm.NASAL_SPRAY]: {
    form: DosageForm.NASAL_SPRAY,
    displayName: 'Nasal Spray',
    icon: 'mdi:spray',
    compatibleUnits: ['spray', 'puff', 'mcg'],
    supportsSiteTracking: false,
    supportsPuffCounter: true,
  },
  [DosageForm.INHALER]: {
    form: DosageForm.INHALER,
    displayName: 'Inhaler',
    icon: 'mdi:lungs',
    compatibleUnits: ['puff', 'mcg', 'mg'],
    supportsSiteTracking: false,
    supportsPuffCounter: true,
  },
  [DosageForm.DROPS]: {
    form: DosageForm.DROPS,
    displayName: 'Drops',
    icon: 'mdi:water',
    compatibleUnits: ['drop', 'ml', 'mg'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.CREAM]: {
    form: DosageForm.CREAM,
    displayName: 'Cream/Ointment',
    icon: 'mdi:lotion',
    compatibleUnits: ['application', 'g', 'mg'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.PATCH]: {
    form: DosageForm.PATCH,
    displayName: 'Transdermal Patch',
    icon: 'mdi:bandage',
    compatibleUnits: ['patch', 'mcg/h', 'mg'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.SUPPOSITORY]: {
    form: DosageForm.SUPPOSITORY,
    displayName: 'Suppository',
    icon: 'mdi:pill',
    compatibleUnits: ['suppository', 'mg'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.LIQUID]: {
    form: DosageForm.LIQUID,
    displayName: 'Liquid/Syrup',
    icon: 'mdi:bottle-tonic',
    compatibleUnits: ['ml', 'teaspoon', 'tablespoon', 'mg'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.POWDER]: {
    form: DosageForm.POWDER,
    displayName: 'Powder',
    icon: 'mdi:powder',
    compatibleUnits: ['sachet', 'g', 'mg', 'scoop'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
  [DosageForm.OTHER]: {
    form: DosageForm.OTHER,
    displayName: 'Other',
    icon: 'mdi:medical-bag',
    compatibleUnits: ['unit', 'dose', 'application', 'mg', 'ml', 'g'],
    supportsSiteTracking: false,
    supportsPuffCounter: false,
  },
};

// ============================================================================
// Core Domain Types
// ============================================================================

export interface DoseQuantity {
  numerator: number;
  denominator: number;
  unit: string;
}

export interface InventoryInfo {
  currentQuantity: number | null;
  refillThreshold: number | null;
  packageSize: number | null;
  expiryDate: string | null; // ISO date string
  autoDecrement: boolean;
  pharmacyName: string | null;
  pharmacyPhone: string | null;
}

export interface InhalerInfo {
  totalPuffs: number;
  remainingPuffs: number;
  replacementDate: string | null; // ISO date string
}

export interface ScheduleSpec {
  kind: ScheduleKind;
  times: string[] | null; // ["HH:MM", ...]
  weekdays: number[] | null; // [0-6] for Monday-Sunday
  intervalMinutes: number | null;
  anchor: string | null; // ISO datetime string
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
  slotDoses: Record<string, DoseQuantity> | null;
  defaultDose: DoseQuantity | null;
}

export interface AdherenceStats {
  periodDays: number;
  scheduledDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  adherenceRate: number; // 0.0 to 1.0
}

// ============================================================================
// Medication Entity (parsed from HA state)
// ============================================================================

export interface MedicationEntity {
  medicationId: string;
  displayName: string;
  form: DosageForm;
  status: MedicationStatus;
  nextDue: string | null; // ISO datetime or null
  nextDoseAmount: string | null; // formatted dose string
  schedule: ScheduleSpec;
  inventory: InventoryInfo | null;
  inhaler: InhalerInfo | null;
  notes: string | null;

  // Entity IDs for different sensors
  entityIds: {
    status: string;
    nextDue: string | null;
    nextDoseAmount: string | null;
    inventory: string | null;
    inhalerPuffs: string | null;
  };
}

export interface ProfileEntity {
  entryId: string;
  profileName: string;
  medications: MedicationEntity[];
  adherence: AdherenceStats | null;

  // Entity IDs
  adherenceEntityId: string | null;
}

// ============================================================================
// Card Configuration
// ============================================================================

export interface MedExpertCardConfig extends LovelaceCardConfig {
  type: string;
  entry_id?: string; // Config Entry ID of the med-expert profile
  title?: string; // Custom header title
  show_header?: boolean; // Show header with title + adherence (default: true)
  show_adherence?: boolean; // Show adherence rate in header (default: true)
  show_inventory_warnings?: boolean; // Show low inventory warnings (default: true)
  compact?: boolean; // Compact display mode (default: false)
  show_prn?: boolean; // Show PRN/as-needed medications (default: true)

  // Legacy boilerplate config - kept for compatibility
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// ============================================================================
// Wizard State
// ============================================================================

export type WizardStep = 'basics' | 'schedule' | 'dosage' | 'options' | 'review';

export interface WizardState {
  step: WizardStep;
  mode: 'add' | 'edit';
  medicationId?: string; // For edit mode

  // Step 1: Basics
  displayName: string;
  form: DosageForm;

  // Step 2: Schedule
  scheduleKind: ScheduleKind;
  times: string[];
  weekdays: number[];
  intervalMinutes: number;

  // Step 3: Dosage
  defaultDose: DoseQuantity | null;
  slotDoses: Record<string, DoseQuantity>;
  unit: string;

  // Step 4: Options
  inventoryEnabled: boolean;
  currentQuantity: number | null;
  refillThreshold: number | null;
  notes: string;

  // Validation
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// ============================================================================
// Service Call Types
// ============================================================================

export interface TakeServiceData {
  entry_id: string;
  medication_id: string;
  taken_at?: string;
  dose_numerator?: number;
  dose_denominator?: number;
  dose_unit?: string;
  note?: string;
  injection_site?: InjectionSite;
}

export interface SnoozeServiceData {
  entry_id: string;
  medication_id: string;
  minutes?: number;
}

export interface SkipServiceData {
  entry_id: string;
  medication_id: string;
  reason?: string;
}

export interface AddMedicationServiceData {
  entry_id: string;
  display_name: string;
  form?: DosageForm;
  default_unit?: string;
  schedule_kind: ScheduleKind;
  times?: string[];
  weekdays?: number[];
  interval_minutes?: number;
  slot_doses?: Record<string, { numerator: number; denominator: number; unit: string }>;
  default_dose?: { numerator: number; denominator: number; unit: string };
  inventory?: {
    current_quantity?: number;
    refill_threshold?: number;
    package_size?: number;
    auto_decrement?: boolean;
    pharmacy_name?: string;
    pharmacy_phone?: string;
  };
  notes?: string;
}

export interface RefillServiceData {
  entry_id: string;
  medication_id: string;
  quantity: number;
  expiry_date?: string;
  package_size?: number;
}

// ============================================================================
// Events
// ============================================================================

export interface MedicationActionEvent {
  medicationId: string;
  action: 'take' | 'snooze' | 'skip' | 'edit' | 'delete' | 'refill';
}

export interface WizardNavigationEvent {
  direction: 'next' | 'back' | 'cancel' | 'submit';
}
