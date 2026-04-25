export interface UkVisaConfig {
  /** localStorage key for profiles */
  storageKey: string
  /** i18n key prefix for page title/subtitle */
  titleKey: string
  subtitleKey: string
  icon: string
  /** Tailwind accent colors */
  ringColor: string
  /** Show approval date + LOTR toggle (BNO only) */
  showBnoFields: boolean
  /** Force isLOTR=true in calculator (SW, Family — qualifying start = arrival date) */
  forceIsLOTR: boolean
  /** Label key for the qualifying start date input */
  startDateLabelKey: string
  /** Checklist storage key */
  checklistKey: string
  /** Visa type for checklist item selection */
  checklistType: 'bno' | 'skilled_worker' | 'family'
  /** Gov.uk source links for rules section */
  ruleLinks: { labelKey: string; url: string }[]
}

export const BNO_CONFIG: UkVisaConfig = {
  storageKey: 'visapath-profiles',
  titleKey: 'bno.title',
  subtitleKey: 'bno.subtitle',
  icon: '🇬🇧',
  ringColor: 'focus:ring-blue-400',
  showBnoFields: true,
  forceIsLOTR: false,
  startDateLabelKey: 'bno.arrivalDate',
  checklistKey: 'visapath_checklist',
  checklistType: 'bno',
  ruleLinks: [
    {
      labelKey: 'bno.rules.continuousResidenceLink',
      url: 'https://www.gov.uk/government/publications/continuous-residence/continuous-residence-guidance-accessible-version',
    },
    {
      labelKey: 'bno.rules.ilrGuidanceLink',
      url: 'https://www.gov.uk/guidance/indefinite-leave-to-remain-in-the-uk',
    },
  ],
}

export const SKILLED_WORKER_CONFIG: UkVisaConfig = {
  storageKey: 'visapath-sw-profiles',
  titleKey: 'sw.title',
  subtitleKey: 'sw.subtitle',
  icon: '🏢',
  ringColor: 'focus:ring-violet-400',
  showBnoFields: false,
  forceIsLOTR: true,
  startDateLabelKey: 'sw.startDate',
  checklistKey: 'visapath_checklist_sw',
  checklistType: 'skilled_worker',
  ruleLinks: [
    {
      labelKey: 'sw.rules.continuousResidenceLink',
      url: 'https://www.gov.uk/government/publications/continuous-residence/continuous-residence-guidance-accessible-version',
    },
    {
      labelKey: 'sw.rules.ilrGuidanceLink',
      url: 'https://www.gov.uk/indefinite-leave-to-remain',
    },
  ],
}

export const FAMILY_VISA_CONFIG: UkVisaConfig = {
  storageKey: 'visapath-family-profiles',
  titleKey: 'familyVisa.title',
  subtitleKey: 'familyVisa.subtitle',
  icon: '👨‍👩‍👧',
  ringColor: 'focus:ring-rose-400',
  showBnoFields: false,
  forceIsLOTR: true,
  startDateLabelKey: 'familyVisa.startDate',
  checklistKey: 'visapath_checklist_family',
  checklistType: 'family',
  ruleLinks: [
    {
      labelKey: 'familyVisa.rules.continuousResidenceLink',
      url: 'https://www.gov.uk/government/publications/continuous-residence/continuous-residence-guidance-accessible-version',
    },
    {
      labelKey: 'familyVisa.rules.ilrGuidanceLink',
      url: 'https://www.gov.uk/indefinite-leave-to-remain/family-life-as-a-partner-or-parent',
    },
  ],
}
