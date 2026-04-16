export interface Trip {
  id: string
  departureDate: string  // ISO date string YYYY-MM-DD
  returnDate: string     // ISO date string YYYY-MM-DD
  destination?: string
  notes?: string
}

export interface BnoData {
  approvalDate: string   // BNO visa approval date YYYY-MM-DD
  arrivalDate: string    // UK arrival date YYYY-MM-DD
  isLOTR?: boolean       // Leave Outside The Rules — qualifying period starts from arrival date
  trips: Trip[]
}

export interface PeriodViolation {
  periodStart: string
  periodEnd: string
  absenceDays: number
  overBy: number
}

export interface RollingDataPoint {
  month: string          // YYYY-MM label
  absenceDays: number
}

export interface IlrResult {
  eligibleDate: Date            // 5-year qualifying date (original, not pushed)
  actualEligibleDate: Date      // pushed forward if violations aged out (may equal eligibleDate)
  earliestApplicationDate: Date // actualEligibleDate - 28 days
  qualifyingStart: Date         // approval date (if used) or arrival date
  qualifyingStartIsApproval: boolean
  preArrivalDays: number        // absence days before arriving in UK
  isEligible: boolean
  daysUntilEligible: number     // days until earliestApplicationDate
  maxAbsenceInAnyPeriod: number
  violations: PeriodViolation[]
  totalAbsenceDays: number
}

export interface CitizenshipResult {
  eligibleDate: Date            // base date: ILR + 1 year
  actualEligibleDate: Date      // earliest date where absence requirements are met (may be later)
  isDelayed: boolean            // actualEligibleDate > eligibleDate
  isEligible: boolean
  daysUntilEligible: number     // days until actualEligibleDate
  // Projected absence at actualEligibleDate (for planning)
  projectedAbsenceLast12: number
  projectedAbsenceLast5: number
  // Current absence (today, for real-time status)
  absenceLast12Months: number
  absenceLast5Years: number
}

export interface BnoCalculation {
  ilr: IlrResult
  citizenship: CitizenshipResult
  rollingData: RollingDataPoint[]
}

export interface Profile {
  id: string
  name: string
  data: BnoData
}

export interface ProfileStore {
  activeId: string
  profiles: Record<string, Profile>
}
