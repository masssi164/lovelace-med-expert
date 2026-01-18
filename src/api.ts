/**
 * API module for med-expert card.
 *
 * Provides wrappers for calling med_expert services and helpers
 * for extracting medication entities from Home Assistant state.
 */

import { HomeAssistant } from 'custom-card-helpers';
import {
  MedicationEntity,
  MedicationStatus,
  DosageForm,
  ScheduleKind,
  ProfileEntity,
  TakeServiceData,
  SnoozeServiceData,
  SkipServiceData,
  AddMedicationServiceData,
  RefillServiceData,
  AdherenceStats,
  InventoryInfo,
  InhalerInfo,
  ScheduleSpec,
  InjectionSite,
} from './types';

const DOMAIN = 'med_expert';

// ============================================================================
// Service Calls
// ============================================================================

/**
 * Call a med_expert service with error handling.
 */
export async function callMedExpertService(
  hass: HomeAssistant,
  service: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<void> {
  try {
    await hass.callService(DOMAIN, service, data);
  } catch (error) {
    console.error(`med-expert: Error calling ${service}:`, error);
    throw error;
  }
}

/**
 * Mark a medication as taken.
 */
export async function takeMedication(
  hass: HomeAssistant,
  data: TakeServiceData
): Promise<void> {
  return callMedExpertService(hass, 'take', data);
}

/**
 * Take a PRN (as-needed) medication.
 */
export async function prnTakeMedication(
  hass: HomeAssistant,
  entryId: string,
  medicationId: string,
  options?: {
    doseNumerator?: number;
    doseDenominator?: number;
    doseUnit?: string;
    note?: string;
    injectionSite?: InjectionSite;
  }
): Promise<void> {
  return callMedExpertService(hass, 'prn_take', {
    entry_id: entryId,
    medication_id: medicationId,
    ...(options?.doseNumerator !== undefined && { dose_numerator: options.doseNumerator }),
    ...(options?.doseDenominator !== undefined && { dose_denominator: options.doseDenominator }),
    ...(options?.doseUnit && { dose_unit: options.doseUnit }),
    ...(options?.note && { note: options.note }),
    ...(options?.injectionSite && { injection_site: options.injectionSite }),
  });
}

/**
 * Snooze a medication reminder.
 */
export async function snoozeMedication(
  hass: HomeAssistant,
  data: SnoozeServiceData
): Promise<void> {
  return callMedExpertService(hass, 'snooze', data);
}

/**
 * Skip a medication dose.
 */
export async function skipMedication(
  hass: HomeAssistant,
  data: SkipServiceData
): Promise<void> {
  return callMedExpertService(hass, 'skip', data);
}

/**
 * Add a new medication.
 */
export async function addMedication(
  hass: HomeAssistant,
  data: AddMedicationServiceData
): Promise<void> {
  return callMedExpertService(hass, 'add_medication', data);
}

/**
 * Update an existing medication.
 */
export async function updateMedication(
  hass: HomeAssistant,
  entryId: string,
  medicationId: string,
  updates: Record<string, unknown>
): Promise<void> {
  return callMedExpertService(hass, 'update_medication', {
    entry_id: entryId,
    medication_id: medicationId,
    updates,
  });
}

/**
 * Remove a medication.
 */
export async function removeMedication(
  hass: HomeAssistant,
  entryId: string,
  medicationId: string
): Promise<void> {
  return callMedExpertService(hass, 'remove_medication', {
    entry_id: entryId,
    medication_id: medicationId,
  });
}

/**
 * Refill medication inventory.
 */
export async function refillMedication(
  hass: HomeAssistant,
  data: RefillServiceData
): Promise<void> {
  return callMedExpertService(hass, 'refill', data);
}

/**
 * Update inventory manually.
 */
export async function updateInventory(
  hass: HomeAssistant,
  entryId: string,
  medicationId: string,
  quantity: number
): Promise<void> {
  return callMedExpertService(hass, 'update_inventory', {
    entry_id: entryId,
    medication_id: medicationId,
    quantity,
  });
}

/**
 * Replace inhaler with a new one.
 */
export async function replaceInhaler(
  hass: HomeAssistant,
  entryId: string,
  medicationId: string,
  totalPuffs: number
): Promise<void> {
  return callMedExpertService(hass, 'replace_inhaler', {
    entry_id: entryId,
    medication_id: medicationId,
    total_puffs: totalPuffs,
  });
}

/**
 * Calculate adherence statistics.
 */
export async function calculateAdherence(
  hass: HomeAssistant,
  entryId: string,
  medicationId?: string,
  periodDays?: number
): Promise<void> {
  return callMedExpertService(hass, 'calculate_adherence', {
    entry_id: entryId,
    ...(medicationId && { medication_id: medicationId }),
    ...(periodDays && { period_days: periodDays }),
  });
}

// ============================================================================
// Entity Discovery
// ============================================================================

/**
 * Get all med_expert config entries from Home Assistant.
 */
export function getMedExpertEntries(hass: HomeAssistant): Array<{
  entryId: string;
  profileName: string;
}> {
  const entries: Array<{ entryId: string; profileName: string }> = [];

  // Look for entities that match the med_expert pattern
  // Pattern: sensor.{profile_name}_medications_adherence
  const adherencePattern = /^sensor\.(.+)_medications_adherence$/;

  for (const entityId of Object.keys(hass.states)) {
    const match = entityId.match(adherencePattern);
    if (match) {
      const state = hass.states[entityId];
      const entryId = state.attributes?.entry_id;
      const profileName = state.attributes?.profile_name || match[1].replace(/_/g, ' ');

      if (entryId) {
        entries.push({ entryId, profileName });
      }
    }
  }

  return entries;
}

/**
 * Get all medication entities for a specific profile.
 */
export function getMedicationEntities(
  hass: HomeAssistant,
  entryId: string
): MedicationEntity[] {
  const medications: MedicationEntity[] = [];
  const medicationMap = new Map<string, Partial<MedicationEntity>>();

  // Entity pattern: sensor.{profile_name}_{medication_name}_{type}
  // Types: status, next_due, next_dose_amount, inventory, inhaler_puffs
  for (const entityId of Object.keys(hass.states)) {
    const state = hass.states[entityId];

    // Check if this entity belongs to our entry
    if (state.attributes?.entry_id !== entryId) {
      continue;
    }

    const medicationId = state.attributes?.medication_id;
    if (!medicationId) {
      continue;
    }

    // Get or create medication entry
    if (!medicationMap.has(medicationId)) {
      medicationMap.set(medicationId, {
        medicationId,
        displayName: state.attributes?.display_name || medicationId,
        form: (state.attributes?.form as DosageForm) || DosageForm.OTHER,
        entityIds: {
          status: '',
          nextDue: null,
          nextDoseAmount: null,
          inventory: null,
          inhalerPuffs: null,
        },
      });
    }

    const med = medicationMap.get(medicationId);
    if (!med || !med.entityIds) {
      continue;
    }

    // Determine entity type and extract data
    if (entityId.endsWith('_status')) {
      med.entityIds.status = entityId;
      med.status = parseStatus(state.state);
      med.schedule = parseScheduleFromAttributes(state.attributes);
      med.notes = state.attributes?.notes || null;
    } else if (entityId.endsWith('_next_due')) {
      med.entityIds.nextDue = entityId;
      med.nextDue = state.state !== 'unavailable' && state.state !== 'unknown' ? state.state : null;
    } else if (entityId.endsWith('_next_dose_amount')) {
      med.entityIds.nextDoseAmount = entityId;
      med.nextDoseAmount = state.state !== 'unavailable' && state.state !== 'unknown' ? state.state : null;
    } else if (entityId.endsWith('_inventory')) {
      med.entityIds.inventory = entityId;
      med.inventory = parseInventoryFromState(state);
    } else if (entityId.endsWith('_inhaler_puffs')) {
      med.entityIds.inhalerPuffs = entityId;
      med.inhaler = parseInhalerFromState(state);
    }
  }

  // Convert map to array, filtering out incomplete entries
  for (const med of medicationMap.values()) {
    if (med.medicationId && med.status !== undefined && med.entityIds?.status) {
      medications.push(med as MedicationEntity);
    }
  }

  // Sort: DUE/MISSED first, then SNOOZED, then OK, then PRN
  return medications.sort((a, b) => {
    const order = {
      [MedicationStatus.MISSED]: 0,
      [MedicationStatus.DUE]: 1,
      [MedicationStatus.SNOOZED]: 2,
      [MedicationStatus.OK]: 3,
      [MedicationStatus.PRN]: 4,
    };
    return order[a.status] - order[b.status];
  });
}

/**
 * Get profile entity with all medications.
 */
export function getProfileEntity(
  hass: HomeAssistant,
  entryId: string
): ProfileEntity | null {
  // Find adherence entity for this profile
  let adherenceEntityId: string | null = null;
  let profileName = '';
  let adherence: AdherenceStats | null = null;

  for (const entityId of Object.keys(hass.states)) {
    if (entityId.includes('_medications_adherence')) {
      const state = hass.states[entityId];
      if (state.attributes?.entry_id === entryId) {
        adherenceEntityId = entityId;
        profileName = state.attributes?.profile_name || 'Unknown';
        adherence = parseAdherenceFromState(state);
        break;
      }
    }
  }

  if (!profileName) {
    return null;
  }

  return {
    entryId,
    profileName,
    medications: getMedicationEntities(hass, entryId),
    adherence,
    adherenceEntityId,
  };
}

// ============================================================================
// Parsing Helpers
// ============================================================================

function parseStatus(state: string): MedicationStatus {
  const statusMap: Record<string, MedicationStatus> = {
    ok: MedicationStatus.OK,
    due: MedicationStatus.DUE,
    snoozed: MedicationStatus.SNOOZED,
    missed: MedicationStatus.MISSED,
    prn: MedicationStatus.PRN,
  };
  return statusMap[state.toLowerCase()] || MedicationStatus.OK;
}

function parseScheduleFromAttributes(attrs: Record<string, unknown>): ScheduleSpec {
  return {
    kind: (attrs.schedule_kind as ScheduleKind) || ScheduleKind.TIMES_PER_DAY,
    times: (attrs.times as string[]) || null,
    weekdays: (attrs.weekdays as number[]) || null,
    intervalMinutes: (attrs.interval_minutes as number) || null,
    anchor: (attrs.anchor as string) || null,
    startDate: (attrs.start_date as string) || null,
    endDate: (attrs.end_date as string) || null,
    slotDoses: null, // Complex structure, parsed elsewhere if needed
    defaultDose: null,
  };
}

function parseInventoryFromState(state: { state: string; attributes: Record<string, unknown> }): InventoryInfo | null {
  const quantity = parseFloat(state.state);
  if (isNaN(quantity)) {
    return null;
  }

  return {
    currentQuantity: quantity,
    refillThreshold: (state.attributes.refill_threshold as number) || null,
    packageSize: (state.attributes.package_size as number) || null,
    expiryDate: (state.attributes.expiry_date as string) || null,
    autoDecrement: (state.attributes.auto_decrement as boolean) ?? true,
    pharmacyName: (state.attributes.pharmacy_name as string) || null,
    pharmacyPhone: (state.attributes.pharmacy_phone as string) || null,
  };
}

function parseInhalerFromState(state: { state: string; attributes: Record<string, unknown> }): InhalerInfo | null {
  const remaining = parseInt(state.state, 10);
  if (isNaN(remaining)) {
    return null;
  }

  return {
    totalPuffs: (state.attributes.total_puffs as number) || 200,
    remainingPuffs: remaining,
    replacementDate: (state.attributes.replacement_date as string) || null,
  };
}

function parseAdherenceFromState(state: { state: string; attributes: Record<string, unknown> }): AdherenceStats | null {
  const rate = parseFloat(state.state);
  if (isNaN(rate)) {
    return null;
  }

  return {
    periodDays: (state.attributes.period_days as number) || 30,
    scheduledDoses: (state.attributes.scheduled_doses as number) || 0,
    takenDoses: (state.attributes.taken_doses as number) || 0,
    missedDoses: (state.attributes.missed_doses as number) || 0,
    skippedDoses: (state.attributes.skipped_doses as number) || 0,
    adherenceRate: rate / 100, // Convert percentage to decimal
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format a dose quantity for display.
 */
export function formatDose(numerator: number, denominator: number, unit: string): string {
  if (denominator === 1) {
    return `${numerator} ${unit}`;
  }
  return `${numerator}/${denominator} ${unit}`;
}

/**
 * Format a datetime string for display.
 */
export function formatNextDue(isoString: string | null, locale = 'de-DE'): string {
  if (!isoString) {
    return '—';
  }

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) {
      // Past due
      const absMins = Math.abs(diffMins);
      if (absMins < 60) {
        return `${absMins} min ago`;
      }
      const hours = Math.floor(absMins / 60);
      return `${hours}h ago`;
    } else if (diffMins < 60) {
      return `in ${diffMins} min`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `in ${hours}h`;
    } else {
      return date.toLocaleDateString(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
  } catch {
    return isoString;
  }
}

/**
 * Check if inventory is low.
 */
export function isInventoryLow(inventory: InventoryInfo | null): boolean {
  if (!inventory || inventory.currentQuantity === null) {
    return false;
  }
  const threshold = inventory.refillThreshold ?? 7;
  return inventory.currentQuantity <= threshold;
}

/**
 * Check if inhaler is low.
 */
export function isInhalerLow(inhaler: InhalerInfo | null): boolean {
  if (!inhaler) {
    return false;
  }
  // Consider low if less than 20% remaining
  return inhaler.remainingPuffs < inhaler.totalPuffs * 0.2;
}
