/**
 * Australia Skilled Migration Points Test Calculator
 * Applies to Subclass 189 (Skilled Independent) and 190/491 nominations.
 * Based on DIBP/Home Affairs points schedule.
 * Minimum passing score: 65 points.
 */

export type EnglishLevel = 'none' | 'competent' | 'proficient' | 'superior'
export type AgeGroup = 'under18' | '18-24' | '25-32' | '33-39' | '40-44' | '45+'
export type OverseasExpYears = 0 | 3 | 5 | 8 | 10
export type AustralianExpYears = 0 | 1 | 3 | 5 | 8 | 10
export type EduLevel = 'none' | 'diploma' | 'bachelors' | 'doctorate'

export interface AuPointsInput {
  age: number
  english: EnglishLevel
  overseasWorkExp: OverseasExpYears   // years in nominated occupation
  australianWorkExp: AustralianExpYears
  education: EduLevel
  // Australian study (2+ years in regional area or low NESB)
  australianStudy: boolean
  specialistEducation: boolean        // degree in specialist field (STEM postgrad etc.)
  // Partner skills (partner also meets the criteria for a skilled visa)
  partnerSkills: boolean
  partnerEnglishCompetent: boolean    // partner CLB 6+
  // Nomination / sponsorship
  stateNomination: boolean            // adds 5 pts (190)
  regionalSponsorship: boolean        // adds 15 pts (491)
  communityLanguage: boolean          // accredited interpreter +5
  studyInRegional: boolean            // studied in regional Aus +5
  professionalYear: boolean           // professional year in Aus +5
}

function agePoints(age: number): number {
  if (age < 18) return 0
  if (age <= 24) return 25
  if (age <= 32) return 30
  if (age <= 39) return 25
  if (age <= 44) return 15
  return 0
}

const ENGLISH_PTS: Record<EnglishLevel, number> = {
  none: 0,
  competent: 0,    // IELTS 6.0 each — minimum, no points
  proficient: 10,  // IELTS 7.0 each
  superior: 20,    // IELTS 8.0 each
}

const OVERSEAS_EXP_PTS: Record<number, number> = { 0: 0, 3: 5, 5: 5, 8: 10, 10: 15 }
const AU_EXP_PTS: Record<number, number> = { 0: 0, 1: 5, 3: 10, 5: 15, 8: 20, 10: 20 }
const EDU_PTS: Record<EduLevel, number> = { none: 0, diploma: 10, bachelors: 15, doctorate: 20 }

export interface AuPointsBreakdown {
  total: number
  age: number
  english: number
  overseasWork: number
  australianWork: number
  education: number
  other: number
  passesThreshold: boolean
}

export function calculateAuPoints(input: AuPointsInput): AuPointsBreakdown {
  const age = agePoints(input.age)
  const english = ENGLISH_PTS[input.english]
  const overseasWork = OVERSEAS_EXP_PTS[input.overseasWorkExp] ?? 0
  const australianWork = AU_EXP_PTS[input.australianWorkExp] ?? 0
  const education = EDU_PTS[input.education]

  let other = 0
  if (input.australianStudy) other += 5
  if (input.specialistEducation) other += 10
  if (input.partnerSkills) other += 10
  else if (input.partnerEnglishCompetent) other += 5
  if (input.stateNomination) other += 5
  if (input.regionalSponsorship) other += 15
  if (input.communityLanguage) other += 5
  if (input.studyInRegional) other += 5
  if (input.professionalYear) other += 5

  const total = age + english + overseasWork + australianWork + education + other

  return {
    total, age, english, overseasWork, australianWork, education, other,
    passesThreshold: total >= 65,
  }
}

// Recent invitation rounds (approximate, for reference)
export const RECENT_AU_CUTOFFS = [
  { date: '2024-07', score: 85, visa: '189' },
  { date: '2024-08', score: 90, visa: '189' },
  { date: '2024-09', score: 85, visa: '189' },
  { date: '2024-10', score: 90, visa: '189' },
  { date: '2024-11', score: 85, visa: '189' },
  { date: '2024-12', score: 90, visa: '189' },
  { date: '2025-01', score: 85, visa: '189' },
]
