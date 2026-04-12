export interface Trip {
  id: string
  departureDate: string  // ISO date string YYYY-MM-DD
  returnDate: string     // ISO date string YYYY-MM-DD
  destination?: string
  notes?: string
}

export interface BnoData {
  arrivalDate: string    // ISO date string YYYY-MM-DD
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
  eligibleDate: Date
  isEligible: boolean
  daysUntilEligible: number
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
