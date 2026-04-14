import {
  parseISO,
  differenceInDays,
  addYears,
  addMonths,
  addDays,
  subDays,
  subYears,
  format,
  isAfter,
  max as dateMax,
  min as dateMin,
} from 'date-fns'
import type { Trip, BnoCalculation, PeriodViolation, RollingDataPoint, IlrResult, CitizenshipResult } from './types'

export interface ChartOptions {
  horizonMonths: number  // extra months beyond today/last trip to show on chart, default 0
}

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
 * Uses daily sampling for accuracy — worst window often falls between month boundaries.
 * Scans up to today (or latest trip return) so recent violations are caught even if they
 * fall after the original 5-year qualifying date.
 * Returns lastViolationDay: the last day where the rolling-12m window exceeded 180 days.
 * This is used to determine when the violation ages out of the 5-year ILR lookback window.
 */
function checkRollingViolations(
  trips: Trip[],
  qualifyingStart: Date,
): { violations: PeriodViolation[]; maxAbsence: number; worstPeriodStart: Date; worstPeriodEnd: Date; lastViolationDay: Date | null } {
  let maxAbsence = 0
  let worstPeriodStart = qualifyingStart
  let worstPeriodEnd = qualifyingStart
  let lastViolationDay: Date | null = null

  // Scan up to today or latest trip return — do NOT cap at qualifyingEnd so violations
  // after the 5-year mark are still captured for the aging-out calculation.
  const today = new Date()
  const latestReturn = trips.length > 0
    ? new Date(Math.max(...trips.map(t => parseISO(t.returnDate).getTime())))
    : today
  const checkEnd = dateMax([today, latestReturn])

  // Daily sampling for accuracy
  let cursor = addYears(qualifyingStart, 1)
  while (!isAfter(cursor, checkEnd)) {
    const windowStart = subYears(cursor, 1)
    const wStart = dateMax([windowStart, qualifyingStart])
    const absence = absenceInRange(trips, wStart, cursor)
    if (absence > 180) {
      lastViolationDay = new Date(cursor)
    }
    if (absence > maxAbsence) {
      maxAbsence = absence
      worstPeriodStart = wStart
      worstPeriodEnd = cursor
    }
    cursor = addDays(cursor, 1)
  }

  const violations: PeriodViolation[] = maxAbsence > 180
    ? [{
        periodStart: format(worstPeriodStart, 'yyyy-MM-dd'),
        periodEnd: format(worstPeriodEnd, 'yyyy-MM-dd'),
        absenceDays: maxAbsence,
        overBy: maxAbsence - 180,
      }]
    : []

  return { violations, maxAbsence, worstPeriodStart, worstPeriodEnd, lastViolationDay }
}

/**
 * Build rolling N-month data points for the chart.
 * windowMonths: rolling window size (12 or 18)
 * horizonMonths: how many extra months beyond today/last-trip to show
 */
function buildRollingData(
  trips: Trip[],
  qualifyingStart: Date,
  chartEnd: Date,
  opts: ChartOptions,
): RollingDataPoint[] {
  const { horizonMonths } = opts
  const data: RollingDataPoint[] = []
  const today = new Date()
  const latestReturn = trips.length > 0
    ? new Date(Math.max(...trips.map(t => parseISO(t.returnDate).getTime())))
    : today
  const horizon = addMonths(today, horizonMonths)
  // Chart can extend to: the furthest of (last trip return, today+horizon), but no further than chartEnd
  const checkEnd = dateMin([chartEnd, dateMax([horizon, latestReturn])])

  // Calculation always uses 12-month rolling window (legal standard).
  // Start from qualifyingStart so the first year is also visible in the chart.
  // For the first 12 months the window is clamped to [qualifyingStart, cursor]
  // so it shows cumulative absence (not yet a full rolling window).
  let cursor = qualifyingStart

  while (!isAfter(cursor, checkEnd)) {
    const wStart = dateMax([subYears(cursor, 1), qualifyingStart])
    const absence = absenceInRange(trips, wStart, cursor)
    data.push({
      month: format(cursor, 'yyyy-MM-dd'),
      absenceDays: absence,
    })
    cursor = addDays(cursor, 7)
  }

  return data
}

export function calculate(
  arrivalDate: string,
  trips: Trip[],
  chartOpts: ChartOptions = { horizonMonths: 0 },
  approvalDate?: string,
): BnoCalculation {
  const arrival = parseISO(arrivalDate)
  const today = new Date()

  // === Determine qualifying start (Appendix Continuous Residence CR 2.1) ===
  // If approval date exists and gap to arrival ≤ 180 days:
  //   - 5-year clock starts from approval date
  //   - Days from approval to arrival count as absence
  // Otherwise: clock starts from arrival date
  let qualifyingStart = arrival
  let qualifyingStartIsApproval = false
  let preArrivalDays = 0

  if (approvalDate && approvalDate.length >= 10) {
    const approval = parseISO(approvalDate)
    const gapDays = differenceInDays(arrival, approval)
    if (gapDays > 0 && gapDays <= 180) {
      qualifyingStart = approval
      qualifyingStartIsApproval = true
      preArrivalDays = gapDays  // all days from approval to arrival-1 are absence
    }
  }

  // Build sorted trips, prepending a synthetic pre-arrival "trip" if needed.
  // Synthetic trip: departure = approvalDate-1, return = arrivalDate
  //   → absence = diff(arrival, approval-1) - 1 = diff(arrival, approval) = preArrivalDays ✓
  const sortedTrips: Trip[] = []
  if (preArrivalDays > 0 && approvalDate) {
    sortedTrips.push({
      id: '__pre_arrival__',
      departureDate: format(subDays(qualifyingStart, 1), 'yyyy-MM-dd'),
      returnDate: arrivalDate,
    })
  }
  sortedTrips.push(
    ...[...trips].sort((a, b) => a.departureDate.localeCompare(b.departureDate))
  )

  // === ILR ===
  const ilrEligibleDate = addYears(qualifyingStart, 5)
  const { violations, maxAbsence, lastViolationDay } = checkRollingViolations(sortedTrips, qualifyingStart)
  const totalAbsence = absenceInRange(sortedTrips, qualifyingStart, today)

  // If there were violations, the ILR date is pushed forward until the last violation day
  // ages out of the 5-year lookback window.
  // Reasoning: ILR check covers [applicationDate - 5years, applicationDate].
  // The last violation day (lVD) must be BEFORE applicationDate - 5years,
  // i.e., applicationDate > lVD + 5years, so actualILRDate = lVD + 5years + 1 day.
  const actualILRDate = lastViolationDay
    ? dateMax([ilrEligibleDate, addDays(addYears(lastViolationDay, 5), 1)])
    : ilrEligibleDate
  const earliestApplicationDate = subDays(actualILRDate, 28)

  const ilr: IlrResult = {
    eligibleDate: ilrEligibleDate,
    actualEligibleDate: actualILRDate,
    earliestApplicationDate,
    qualifyingStart,
    qualifyingStartIsApproval,
    preArrivalDays,
    isEligible: !isAfter(earliestApplicationDate, today),
    daysUntilEligible: Math.max(0, differenceInDays(earliestApplicationDate, today)),
    maxAbsenceInAnyPeriod: maxAbsence,
    violations,
    totalAbsenceDays: totalAbsence,
  }

  // === Citizenship ===
  // Base eligible date: ILR + 1 year minimum (use actualILRDate so it compounds correctly)
  const citizenshipEligibleDate = addYears(actualILRDate, 1)

  // Find actual eligible date: earliest date ≥ base where absence requirements are met.
  // Scan day by day up to 5 years forward — catches cases where current/planned trips
  // push the application window out.
  function findActualCitizenshipDate(baseDate: Date): Date {
    const maxDate = addYears(baseDate, 5)
    let cursor = baseDate
    while (!isAfter(cursor, maxDate)) {
      const a12 = absenceInRange(sortedTrips, subYears(cursor, 1), cursor)
      const a5 = absenceInRange(sortedTrips, subYears(cursor, 5), cursor)
      if (a12 <= 90 && a5 <= 450) return cursor
      cursor = addDays(cursor, 1)
    }
    return maxDate
  }

  // First compute the historical first-eligible date (from base) for isDelayed check.
  // Then compute from max(base, today) — this handles the case where the base date has
  // already passed but the user is currently over the limit (e.g. 100 days in last 12m).
  // The "actual" date we care about for countdown is: when can I NEXT apply from today?
  const firstEligibleDate = findActualCitizenshipDate(citizenshipEligibleDate)
  const actualCitizenshipDate = findActualCitizenshipDate(dateMax([citizenshipEligibleDate, today]))
  const isDelayed = isAfter(firstEligibleDate, citizenshipEligibleDate)

  // Projected absence AT the actual eligible date (what the officer will see)
  const projectedAbsenceLast12 = absenceInRange(sortedTrips, subYears(actualCitizenshipDate, 1), actualCitizenshipDate)
  const projectedAbsenceLast5 = absenceInRange(sortedTrips, subYears(actualCitizenshipDate, 5), actualCitizenshipDate)

  // Current absence (today) — real-time tracker
  const absenceLast12 = absenceInRange(sortedTrips, subYears(today, 1), today)
  const absenceLast5 = absenceInRange(sortedTrips, subYears(today, 5), today)

  const citizenship: CitizenshipResult = {
    eligibleDate: citizenshipEligibleDate,
    actualEligibleDate: actualCitizenshipDate,
    isDelayed,
    isEligible: !isAfter(actualCitizenshipDate, today),
    daysUntilEligible: Math.max(0, differenceInDays(actualCitizenshipDate, today)),
    projectedAbsenceLast12,
    projectedAbsenceLast5,
    absenceLast12Months: absenceLast12,
    absenceLast5Years: absenceLast5,
  }

  // === Chart data — extend to citizenship eligibility date ===
  const rollingData = buildRollingData(sortedTrips, qualifyingStart, citizenshipEligibleDate, chartOpts)

  return { ilr, citizenship, rollingData }
}

/** Format today as YYYY-MM-DD for date inputs */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Add N days to a YYYY-MM-DD string, return YYYY-MM-DD */
export function addDaysToISO(dateStr: string, days: number): string {
  try {
    return format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd')
  } catch {
    return ''
  }
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
