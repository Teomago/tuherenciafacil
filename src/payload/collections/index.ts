import { Articles } from './content/Articles'
import { Media } from './content/Media'
import { Pages } from './content/Pages'
import { Members } from './settings/Members'
import { Users } from './settings/Users'
import { InvitationCodes } from './settings/InvitationCodes'
import { Tags } from './system/Tags'
import { Cases } from './succession/Cases'
import { Appointments } from './succession/Appointments'
import { CaseIntake } from './succession/CaseIntake'
import { Heirs } from './succession/Heirs'
import { Assets } from './succession/Assets'
import { Documents } from './succession/Documents'
import { DocumentChecklist } from './succession/DocumentChecklist'
import { NotaryProcess } from './succession/NotaryProcess'
import { Payments } from './succession/Payments'
import { AvailabilitySlots } from './succession/AvailabilitySlots'

export const collections = [
  // Content
  Articles,
  Media,
  Pages,
  // Settings
  Members,
  Users,
  InvitationCodes,
  // System
  Tags,
  // Sucesiones
  Cases,
  Appointments,
  AvailabilitySlots,
  CaseIntake,
  Heirs,
  Assets,
  Documents,
  DocumentChecklist,
  NotaryProcess,
  Payments,
]
