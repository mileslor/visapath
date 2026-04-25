export type ResidencyResult = 'uk_resident' | 'non_resident' | 'insufficient_data'

export interface SrtInput {
  ukDaysThisYear: number
  ukDaysPrior3Years: number   // total across prior 3 tax years
  residentPrior3Years: number // how many of prior 3 tax years were UK resident (0-3)
  // Ties
  tieFamily: boolean          // UK resident close family (spouse/partner or minor child)
  tieAccommodation: boolean   // accessible UK accommodation for ≥91 days, and used ≥1 night
  tieWork: boolean            // worked in UK ≥40 days (≥3hrs) during the year
  tieUkDays: boolean          // more UK days this year than any other country
  tieActivePriorYear: boolean // 90+ UK days in either of prior 2 tax years (only counts if residentPrior3Years > 0)
  // Special
  diedInYear: boolean
  splitYear: boolean          // claimed split year treatment
}

export interface SrtResult {
  result: ResidencyResult
  reason: string             // i18n key for the reason
  reasonDetail?: string      // additional detail key
  tiesCount: number
  automaticOverseas: boolean
  automaticUk: boolean
  sufficientTiesApplied: boolean
}
