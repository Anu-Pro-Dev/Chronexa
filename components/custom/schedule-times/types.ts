export interface TimeEntry {
  inTime: string
  outTime: string
  requiredWorkHours: string
  openShift: boolean
  nightShift: boolean
}

export interface NormalFormData {
  organization: string
  scheduleTimes: string
  code: string
  color: string
  timeEntries: TimeEntry[]
  graceInMinutes: number
  graceOutMinutes: number
  flexibleMinutes: number
}

export interface PolicyFormData {
  showOnReport: 'first-in-last-out' | 'all-transactions'
  emailNotification: 'first-in-last-out' | 'all-transactions'
  calculateWorkedHours: boolean
  enableDefaultOvertime: boolean
  enableDefaultBreakHours: boolean
  overrideScheduleOnHoliday: boolean
  reduceRequiredHours: boolean
}

export type FormType = 'normal' | 'ramadan' | 'policy'

export interface ScheduleSettingsProps {
  initialData?: {
    normal?: NormalFormData
    ramadan?: NormalFormData
    policy?: PolicyFormData
  }
  onSubmit: (data: {
    normal: NormalFormData
    ramadan: NormalFormData
    policy: PolicyFormData
  }) => void
  onCancel: () => void
}

