import {
  parseISO,
  differenceInDays,
  addYears,
  addMonths,
  subYears,
  format,
  isAfter,
  max as dateMax,
  min as dateMin,
} from 'date-fns'
import type { Trip, BnoCalculation, PeriodViolation, RollingDataPoint, IlrResult, CitizenshipResult } from './types'

/**
 * Calculate absence days for a single trip.
 * Departure day and return day are counted as UK days (not absence).
 * So absence = differenceInDays(returnDate, departureDate) - 1
 */
export function tripAbsenceDays(trip: Trip): number {
  const dep = parseISO(trip.departureDate)
  const ret = parseISO(trip.returnDate)
  const days = differenceInDays(ret, dep) - 1
  return Math.max(0, days)
}

/**
 * Calculate absence days within a specific date range [rangeStart, rangeEnd].
 * Clips each trip to the range.
 */
function absenceInRange(trips: Trip[], rangeStart: Date, rangeEnd: Date): number {
  let total = 0
  for (const trip of trips) {
    const dep = parseISO(trip.departureDate)
    const ret = parseISO(trip.returnDate)

    // The absence period is (dep+1) to (ret-1) inclusive
    const absStart = new Date(dep)
    absStart.setDate(absStart.getDate() + 1)
    const absEnd = new Date(ret)
    absEnd.setDate(absEnd.getDate() - 1)

    if (isAfter(absEnd, absStart) || absStart.getTime() === absEnd.getTime()) {
      const clampedStart = dateMax([absStart, rangeStart])
      const clampedEnd = dateMin([absEnd, rangeEnd])
      if (!isAfter(clampedStart, clampedEnd)) {
        total += differenceInDays(clampedEnd, clampedStart) + 1
      }
    }
  }
  return total
}

/**
 * Check rolling 12-month windows for ILR violations (>180 days).
 * Samples every month for performance.
 */
function checkRollingViolations(
  trips: Trip[],
  qualifyingStart: Date,
  qualifyingEnd: Date,
): { violations: PeriodViolation[]; maxAbsence: number } {
  const violations: PeriodViolation[] = []
  let maxAbsence = 0
  const today = new Date()
  const checkEnd = dateMin([qualifyingEnd, today])

  let cursor = new Date(qualifyingStart)
  cursor = addYears(cursor, 1) // first check is at start+1year

  while (!isAfter(cursor, checkEnd)) {
    const windowStart = subYears(cursor, 1)
    const wStart = dateMax([windowStart, qualifyingStart])
    const absence = absenceInRange(trips, wStart, cursor)

    if (absence > maxAbsence) maxAbsence = absence

    if (absence > 180) {
      violations.push({
        periodStart: format(wStart, 'yyyy-MM-dd'),
        periodEnd: format(cursor, 'yyyy-MM-dd'),
        absenceDays: absence,
        overBy: absence - 180,
      })
    }
    cursor = addMonths(cursor, 1)
  }

  return { violations, maxAbsence }
}

/**
 * Build rolling 12-month data points for the chart.
 */
function buildRollingData(
  trips: Trip[],
  qualifyingStart: Date,
  qualifyingEnd: Date,
): RollingDataPoint[] {
  const data: RollingDataPoint[] = []
  const today = new Date()
  const checkEnd = dateMin([qualifyingEnd, today])

  let cursor = addYears(qualifyingStart, 1)

  while (!isAfter(cursor, checkEnd)) {
    const windowStart = subYears(cursor, 1)
    const wStart = dateMax([windowStart, qualifyingStart])
    const absence = absenceInRange(trips, wStart, cursor)
    data.push({
      month: format(cursor, 'yyyy-MM'),
      absenceDays: absence,
    })
    cursor = addMonths(cursor, 1)
  }

  return data
}

export function calculate(arrivalDate: string, trips: Trip[]): BnoCalculation {
  const arrival = parseISO(arrivalDate)
  const today = new Date()

  // Sort trips
  const sortedTrips = [...trips].sort((a, b) =>
    a.departureDate.localeCompare(b.departureDate)
  )

  // === ILR ===
  const ilrEligibleDate = addYears(arrival, 5)
  const { violations, maxAbsence } = checkRollingViolations(sortedTrips, arrival, ilrEligibleDate)
  const totalAbsence = absenceInRange(sortedTrips, arrival, today)

  const ilr: IlrResult = {
    eligibleDate: ilrEligibleDate,
    isEligible: !isAfter(ilrEligibleDate, today) && violations.length === 0,
    daysUntilEligible: Math.max(0, differenceInDays(ilrEligibleDate, today)),
    maxAbsenceInAnyPeriod: maxAbsence,
    violations,
    totalAbsenceDays: totalAbsence,
  }

  // === Citizenship ===
  // Eligible: ILR date + 1 year minimum
  const citizenshipEligibleDate = addYears(ilrEligibleDate, 1)

  // Absence in last 12 months from today
  const twelveMonthsAgo = subYears(today, 1)
  const absenceLast12 = absenceInRange(sortedTrips, twelveMonthsAgo, today)

  // Absence in last 5 years from today
  const fiveYearsAgo = subYears(today, 5)
  const absenceLast5 = absenceInRange(sortedTrips, fiveYearsAgo, today)

  const citizenship: CitizenshipResult = {
    eligibleDate: citizenshipEligibleDate,
    isEligible: !isAfter(citizenshipEligibleDate, today) && absenceLast12 <= 90 && absenceLast5 <= 450,
    daysUntilEligible: Math.max(0, differenceInDays(citizenshipEligibleDate, today)),
    absenceLast12Months: absenceLast12,
    absenceLast5Years: absenceLast5,
  }

  // === Chart data ===
  const rollingData = buildRollingData(sortedTrips, arrival, ilrEligibleDate)

  return { ilr, citizenship, rollingData }
}

export function formatDate(dateStr: string, lang: string): string {
  try {
    const d = parseISO(dateStr)
    return d.toLocaleDateString(lang === 'zh-HK' ? 'zh-HK' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
