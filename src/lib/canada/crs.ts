/**
 * Canada Express Entry — Comprehensive Ranking System (CRS) Calculator
 * Based on IRCC's official CRS formula (current as of 2024).
 * https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html
 */

export type EducationLevel =
  | 'none'
  | 'highSchool'
  | 'oneYear'
  | 'twoYear'
  | 'bachelors'
  | 'twoOrMoreDegrees'
  | 'masters'
  | 'phd'

export type CLBLevel = 0 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type WorkExpYears = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface CrsInput {
  // Core / Human Capital
  age: number
  education: EducationLevel
  hasSpouse: boolean

  // First official language (English/French CLB)
  speaking: CLBLevel
  listening: CLBLevel
  reading: CLBLevel
  writing: CLBLevel

  // Second official language
  speaking2: CLBLevel
  listening2: CLBLevel
  reading2: CLBLevel
  writing2: CLBLevel

  // Work experience in Canada (years)
  canadaWorkExp: WorkExpYears
  // Work experience abroad (years)
  foreignWorkExp: WorkExpYears

  // Spouse factors (if applicable)
  spouseEducation: EducationLevel
  spouseLanguageCLB: CLBLevel   // single CLB score for all 4 abilities
  spouseCanadaWorkExp: WorkExpYears

  // Skill transferability
  // (computed automatically from the fields above)

  // Additional points
  hasProvincialNomination: boolean
  hasJobOffer: boolean        // NOC 00 (senior manager) or NOC 0/A/B
  jobOfferNoc00: boolean      // NOC 00 specifically (extra 200 pts)
  hasCanadianSibling: boolean // sibling is Canadian citizen or PR
  hasFrenchProficiency: boolean // CLB 7+ in French + English CLB 4+
  studiedInCanada: boolean    // 2+ year post-secondary in Canada
}

// ===== Age (without spouse) =====
const AGE_POINTS_SINGLE: Record<number, number> = {
  17: 0, 18: 99, 19: 105, 20: 110, 21: 110, 22: 110, 23: 110, 24: 110,
  25: 110, 26: 110, 27: 110, 28: 110, 29: 105, 30: 99, 31: 94, 32: 88,
  33: 83, 34: 77, 35: 72, 36: 66, 37: 61, 38: 55, 39: 50, 40: 45,
  41: 39, 42: 33, 43: 28, 44: 22, 45: 17, 46: 11, 47: 6, 48: 0,
}

const AGE_POINTS_WITH_SPOUSE: Record<number, number> = {
  17: 0, 18: 90, 19: 95, 20: 100, 21: 100, 22: 100, 23: 100, 24: 100,
  25: 100, 26: 100, 27: 100, 28: 100, 29: 95, 30: 90, 31: 85, 32: 80,
  33: 75, 34: 70, 35: 64, 36: 59, 37: 54, 38: 49, 39: 44, 40: 39,
  41: 34, 42: 29, 43: 23, 44: 18, 45: 14, 46: 9, 47: 4, 48: 0,
}

function agePoints(age: number, hasSpouse: boolean): number {
  const table = hasSpouse ? AGE_POINTS_WITH_SPOUSE : AGE_POINTS_SINGLE
  const clamped = Math.max(17, Math.min(48, age))
  return table[clamped] ?? 0
}

// ===== Education =====
const EDU_SINGLE: Record<EducationLevel, number> = {
  none: 0, highSchool: 30, oneYear: 90, twoYear: 98, bachelors: 120,
  twoOrMoreDegrees: 128, masters: 135, phd: 150,
}
const EDU_WITH_SPOUSE: Record<EducationLevel, number> = {
  none: 0, highSchool: 28, oneYear: 84, twoYear: 91, bachelors: 112,
  twoOrMoreDegrees: 119, masters: 126, phd: 140,
}
const EDU_SPOUSE: Record<EducationLevel, number> = {
  none: 0, highSchool: 2, oneYear: 6, twoYear: 7, bachelors: 8,
  twoOrMoreDegrees: 9, masters: 10, phd: 10,
}

function eduPoints(edu: EducationLevel, hasSpouse: boolean): number {
  return hasSpouse ? EDU_WITH_SPOUSE[edu] : EDU_SINGLE[edu]
}

// ===== Language (CLB → points) =====
// First language, no spouse
const LANG1_SINGLE: Record<'speaking' | 'listening' | 'reading' | 'writing', Record<number, number>> = {
  speaking:  { 0:0, 4:0, 5:0, 6:9, 7:17, 8:23, 9:31, 10:34, 11:34, 12:34 },
  listening: { 0:0, 4:0, 5:0, 6:9, 7:17, 8:23, 9:31, 10:34, 11:34, 12:34 },
  reading:   { 0:0, 4:0, 5:0, 6:9, 7:17, 8:23, 9:31, 10:34, 11:34, 12:34 },
  writing:   { 0:0, 4:0, 5:0, 6:9, 7:17, 8:23, 9:31, 10:34, 11:34, 12:34 },
}
// First language, with spouse
const LANG1_SPOUSE: Record<string, Record<number, number>> = {
  speaking:  { 0:0, 4:0, 5:0, 6:8, 7:16, 8:22, 9:29, 10:32, 11:32, 12:32 },
  listening: { 0:0, 4:0, 5:0, 6:8, 7:16, 8:22, 9:29, 10:32, 11:32, 12:32 },
  reading:   { 0:0, 4:0, 5:0, 6:8, 7:16, 8:22, 9:29, 10:32, 11:32, 12:32 },
  writing:   { 0:0, 4:0, 5:0, 6:8, 7:16, 8:22, 9:29, 10:32, 11:32, 12:32 },
}
// Second language (same for all abilities)
const LANG2_PTS: Record<number, number> = { 0:0, 4:0, 5:1, 6:1, 7:3, 8:3, 9:6, 10:6, 11:6, 12:6 }
// Spouse language (all abilities, same table)
const LANG_SPOUSE_PTS: Record<number, number> = { 0:0, 4:0, 5:1, 6:1, 7:3, 8:3, 9:5, 10:5, 11:5, 12:5 }

function langPoints(clb: CLBLevel, ability: string, hasSpouse: boolean): number {
  const table = hasSpouse ? LANG1_SPOUSE[ability] : LANG1_SINGLE[ability as keyof typeof LANG1_SINGLE]
  return table?.[clb] ?? 0
}

function lang2Points(clb: CLBLevel): number {
  return LANG2_PTS[clb] ?? 0
}

// ===== Work experience =====
const WORK_CAN_SINGLE: Record<number, number> = { 0:0, 1:40, 2:53, 3:64, 4:72, 5:80, 6:80 }
const WORK_CAN_SPOUSE:  Record<number, number> = { 0:0, 1:35, 2:46, 3:56, 4:63, 5:70, 6:70 }
const WORK_SPOUSE_PTS:  Record<number, number> = { 0:0, 1:5,  2:7,  3:8,  4:9,  5:10, 6:10 }

// ===== Skill Transferability (max 100 pts total) =====
function skillTransferability(input: CrsInput): number {
  let pts = 0

  // A. Education + language (CLB 7 threshold, CLB 9 for max)
  const minLang1 = Math.min(input.speaking, input.listening, input.reading, input.writing)
  if (input.education !== 'none' && input.education !== 'highSchool') {
    if (minLang1 >= 9) pts += (input.education === 'bachelors' || input.education === 'twoYear' || input.education === 'oneYear') ? 25 : 50
    else if (minLang1 >= 7) pts += (input.education === 'bachelors' || input.education === 'twoYear' || input.education === 'oneYear') ? 13 : 25
  }

  // B. Education + Canadian work experience
  if (input.canadaWorkExp >= 2 && input.education !== 'none' && input.education !== 'highSchool') {
    pts += (input.education === 'bachelors' || input.education === 'twoYear' || input.education === 'oneYear') ? 25 : 50
  } else if (input.canadaWorkExp >= 1 && input.education !== 'none' && input.education !== 'highSchool') {
    pts += (input.education === 'bachelors' || input.education === 'twoYear' || input.education === 'oneYear') ? 13 : 25
  }

  // C. Foreign work experience + language
  if (input.foreignWorkExp >= 3 && minLang1 >= 9) pts += 50
  else if (input.foreignWorkExp >= 3 && minLang1 >= 7) pts += 25
  else if (input.foreignWorkExp >= 1 && minLang1 >= 9) pts += 25
  else if (input.foreignWorkExp >= 1 && minLang1 >= 7) pts += 13

  // D. Foreign work experience + Canadian work experience
  if (input.foreignWorkExp >= 3 && input.canadaWorkExp >= 2) pts += 50
  else if (input.foreignWorkExp >= 3 && input.canadaWorkExp >= 1) pts += 25
  else if (input.foreignWorkExp >= 1 && input.canadaWorkExp >= 2) pts += 25
  else if (input.foreignWorkExp >= 1 && input.canadaWorkExp >= 1) pts += 13

  // E. Certificate of qualification + language (trades)
  // Not implemented (requires additional input)

  return Math.min(100, pts)
}

export interface CrsBreakdown {
  total: number
  age: number
  education: number
  language1: number
  language2: number
  canadaWorkExp: number
  spouseFactors: number
  skillTransferability: number
  additional: number
}

export function calculateCrs(input: CrsInput): CrsBreakdown {
  const hs = input.hasSpouse

  const age = agePoints(input.age, hs)
  const education = eduPoints(input.education, hs)

  const language1 =
    langPoints(input.speaking, 'speaking', hs) +
    langPoints(input.listening, 'listening', hs) +
    langPoints(input.reading, 'reading', hs) +
    langPoints(input.writing, 'writing', hs)

  const language2 =
    lang2Points(input.speaking2) +
    lang2Points(input.listening2) +
    lang2Points(input.reading2) +
    lang2Points(input.writing2)

  const canadaWorkExp = hs ? (WORK_CAN_SPOUSE[input.canadaWorkExp] ?? 0) : (WORK_CAN_SINGLE[input.canadaWorkExp] ?? 0)

  const spouseFactors = hs
    ? (EDU_SPOUSE[input.spouseEducation] ?? 0) +
      (LANG_SPOUSE_PTS[input.spouseLanguageCLB] ?? 0) * 4 +
      (WORK_SPOUSE_PTS[input.spouseCanadaWorkExp] ?? 0)
    : 0

  const skillTransfer = skillTransferability(input)

  // Additional points
  let additional = 0
  if (input.hasProvincialNomination) additional += 600
  if (input.jobOfferNoc00) additional += 200
  else if (input.hasJobOffer) additional += 50
  if (input.hasCanadianSibling) additional += 15
  if (input.hasFrenchProficiency) additional += 50 // simplified; actual has tiers
  if (input.studiedInCanada) additional += 30 // 2-3 year credential

  const total = age + education + language1 + language2 + canadaWorkExp + spouseFactors + skillTransfer + additional

  return { total, age, education, language1, language2, canadaWorkExp, spouseFactors, skillTransferability: skillTransfer, additional }
}

// Historical CRS cutoffs for reference (approximate recent draws)
export const RECENT_CUTOFFS = [
  { date: '2024-01', score: 524, type: 'General' },
  { date: '2024-02', score: 534, type: 'General' },
  { date: '2024-03', score: 525, type: 'General' },
  { date: '2024-04', score: 529, type: 'General' },
  { date: '2024-06', score: 538, type: 'General' },
  { date: '2024-08', score: 542, type: 'General' },
  { date: '2024-10', score: 519, type: 'General' },
  { date: '2024-12', score: 524, type: 'General' },
  { date: '2025-01', score: 528, type: 'General' },
  { date: '2025-02', score: 532, type: 'General' },
]
