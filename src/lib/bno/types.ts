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
  eligibleDate: Date            // 5-year qualifying date
  earliestApplicationDate: Date // eligibleDate - 28 days
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
  eligibleDate: Date
  isEligible: boolean
  daysUntilEligible: number
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
