import { AppSettings, DelayInfo, DelaySeverity } from '../types';

/**
 * Calculates day difference between two YYYY-MM-DD date strings
 */
export function getDaysDifference(dateFrom: string, dateTo: string): number {
  const d1 = new Date(dateFrom);
  const d2 = new Date(dateTo);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates delay info for a loan based on current simulated date and configured settings
 */
export function calculateDelay(
  dueDate: string,
  currentDate: string,
  settings: AppSettings,
  returnDate?: string | null
): DelayInfo {
  // If returned, calculate based on return date vs due date
  const effectiveDate = returnDate || currentDate;
  const overdueDays = getDaysDifference(dueDate, effectiveDate);

  if (overdueDays <= 0) {
    return {
      days: 0,
      severity: 'none',
      label: 'Dans les délais',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      dotColor: 'bg-emerald-500',
    };
  }

  if (overdueDays <= settings.thresholdLow) {
    return {
      days: overdueDays,
      severity: 'low',
      label: `Retard faible (${overdueDays}j)`,
      badgeBg: 'bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800',
      badgeText: 'text-yellow-800 dark:text-yellow-300',
      dotColor: 'bg-yellow-500',
    };
  }

  if (overdueDays <= settings.thresholdMedium) {
    return {
      days: overdueDays,
      severity: 'medium',
      label: `Retard moyen (${overdueDays}j)`,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
      badgeText: 'text-amber-800 dark:text-amber-300',
      dotColor: 'bg-amber-500',
    };
  }

  if (overdueDays <= settings.thresholdHigh) {
    return {
      days: overdueDays,
      severity: 'high',
      label: `Retard élevé (${overdueDays}j)`,
      badgeBg: 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800',
      badgeText: 'text-orange-800 dark:text-orange-300',
      dotColor: 'bg-orange-500',
    };
  }

  return {
    days: overdueDays,
    severity: 'critical',
    label: `Retard critique (${overdueDays}j)`,
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800',
    badgeText: 'text-rose-800 dark:text-rose-300',
    dotColor: 'bg-rose-600',
  };
}

/**
 * Returns remaining days if on time, or null if overdue
 */
export function getRemainingDays(dueDate: string, currentDate: string): number {
  return getDaysDifference(currentDate, dueDate);
}

/**
 * Formats a date string to French display format: "08 nov. 2026"
 */
export function formatFrenchDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates new due date by adding days to a start date
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
