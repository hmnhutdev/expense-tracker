import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isToday,
  isYesterday,
  subMonths,
  addMonths,
  isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale';

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatTransactionDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;

    if (isToday(date)) {
      return 'Hôm nay';
    }
    if (isYesterday(date)) {
      return 'Hôm qua';
    }
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'dd/MM');
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: vi });
}

export function formatMonthYearISO(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function getMonthRange(year: number, monthIndex: number): { start: string; end: string } {
  const targetDate = new Date(year, monthIndex, 1);
  const start = startOfMonth(targetDate);
  const end = endOfMonth(targetDate);

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export function getLastNMonths(count: number = 6): Date[] {
  const months: Date[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    months.push(subMonths(now, i));
  }
  return months;
}

export { subMonths, addMonths, startOfMonth, endOfMonth, parseISO, isValid };
