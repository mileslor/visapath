import type { SrtInput, SrtResult } from './types'

/**
 * HMRC Statutory Residence Test (SRT) calculator.
 * Based on RDR3 guidance (2023/24).
 * Tests are applied in order: Automatic Overseas → Automatic UK → Sufficient Ties.
 */
export function calculateSrt(input: SrtInput): SrtResult {
  const {
    ukDaysThisYear: days,
    residentPrior3Years: priorResidentYears,
    tieFamily,
    tieAccommodation,
    tieWork,
    tieUkDays,
    tieActivePriorYear,
  } = input

  // Count relevant ties
  // "Active prior year" tie only counts if person was UK resident in at least 1 of prior 3 years
  const ties = [
    tieFamily,
    tieAccommodation,
    tieWork,
    tieUkDays,
    priorResidentYears > 0 && tieActivePriorYear,
  ].filter(Boolean).length

  // === Automatic Overseas Tests ===
  // AOT 1: < 16 UK days
  if (days < 16) {
    return { result: 'non_resident', reason: 'hmrc.srt.aot1', tiesCount: ties, automaticOverseas: true, automaticUk: false, sufficientTiesApplied: false }
  }

  // AOT 2: < 46 days AND was not UK resident in any of the prior 3 tax years
  if (days < 46 && priorResidentYears === 0) {
    return { result: 'non_resident', reason: 'hmrc.srt.aot2', tiesCount: ties, automaticOverseas: true, automaticUk: false, sufficientTiesApplied: false }
  }

  // AOT 3: < 91 days AND worked full-time overseas (≥35hrs/week average, ≤30 UK work days)
  // Simplified: we don't ask for full-time overseas work details, skip for now.

  // === Automatic UK Tests ===
  // AUT 1: ≥ 183 days in UK
  if (days >= 183) {
    return { result: 'uk_resident', reason: 'hmrc.srt.aut1', tiesCount: ties, automaticOverseas: false, automaticUk: true, sufficientTiesApplied: false }
  }

  // AUT 2: Only/main home in UK (available ≥91 days, used ≥30 nights) — simplified
  // AUT 3: Full-time work in UK (≥35hrs/week, ≥274 days, ≤25 days significant break)
  // Both require detailed data we don't collect, skip.

  // === Sufficient Ties Test ===
  // Thresholds depend on prior UK residency (leavers vs arriver) and ties count.
  // Using "arriver" thresholds (previously non-resident) as default for HK immigrants.
  // Arriver: resident if days exceed threshold for ties count:
  //   0 ties → impossible to be resident via STT
  //   1 tie  → ≥ 183 days (already caught by AUT1)
  //   2 ties → ≥ 121 days
  //   3 ties → ≥ 46 days
  //   4 ties → ≥ 16 days
  //   (4/5 ties) 5 ties → ≥ 16 days

  // Leaver thresholds (was UK resident in ≥1 of prior 3 years):
  //   1 tie  → ≥ 183 days
  //   2 ties → ≥ 121 days
  //   3 ties → ≥ 91 days
  //   4 ties → ≥ 46 days
  //   5 ties → ≥ 16 days

  const isLeaver = priorResidentYears > 0

  let threshold: number | null = null
  if (isLeaver) {
    if (ties >= 5) threshold = 16
    else if (ties === 4) threshold = 46
    else if (ties === 3) threshold = 91
    else if (ties === 2) threshold = 121
    else if (ties === 1) threshold = 183
    // 0 ties → non-resident
  } else {
    // Arriver
    if (ties >= 4) threshold = 16
    else if (ties === 3) threshold = 46
    else if (ties === 2) threshold = 121
    // 0-1 ties → non-resident
  }

  if (threshold !== null && days >= threshold) {
    return {
      result: 'uk_resident',
      reason: 'hmrc.srt.stt.resident',
      reasonDetail: isLeaver ? 'hmrc.srt.stt.leaverNote' : 'hmrc.srt.stt.arriverNote',
      tiesCount: ties,
      automaticOverseas: false,
      automaticUk: false,
      sufficientTiesApplied: true,
    }
  }

  return {
    result: 'non_resident',
    reason: 'hmrc.srt.stt.nonResident',
    tiesCount: ties,
    automaticOverseas: false,
    automaticUk: false,
    sufficientTiesApplied: true,
  }
}
