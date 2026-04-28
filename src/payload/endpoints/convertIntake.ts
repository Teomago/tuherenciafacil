import type { PayloadHandler } from 'payload'
import { isMemberUser, isAdminUser } from '@/lib/auth/typeGuards'

export const convertIntakeHandler: PayloadHandler = async (req) => {
  const { payload, user } = req

  if (
    !user ||
    (!isAdminUser(user) &&
      !(isMemberUser(user) && user.role === 'abogado' && user.isActive !== false))
  ) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    if (typeof req.json !== 'function') {
      return Response.json({ error: 'Invalid request format' }, { status: 400 })
    }
    
    const body = await req.json()
    const { intakeId } = body

    if (!intakeId) {
      return Response.json({ error: 'intakeId is required' }, { status: 400 })
    }

    const intake = await payload.findByID({
      collection: 'case-intakes',
      id: intakeId,
      overrideAccess: true,
    })

    if (!intake) {
      return Response.json({ error: 'Intake not found' }, { status: 404 })
    }

    if (intake.tieneTestamento) {
      return Response.json(
        {
          error:
            'Las sucesiones testadas no son atendidas por tuHerenciaFácil. Solo manejamos sucesiones intestadas.',
        },
        { status: 422 },
      )
    }

    if (intake.status === 'paid') {
      return Response.json({ error: 'Intake already converted' }, { status: 400 })
    }

    const memberId = typeof intake.member === 'object' ? intake.member?.id : intake.member

    // Create Case
    const newCase = await payload.create({
      collection: 'cases',
      req,
      draft: false,
      data: {
        status: 'active',
        tier: intake.tierElegido || 'estandar',
        responsable: memberId,
        tieneTestamento: intake.tieneTestamento,
        acuerdoHerederos: intake.acuerdoHerederos,
        causante: {
          nombre: intake.causanteNombre,
          cedula: intake.causanteCedula,
          fechaFallecimiento: intake.causanteFechaFallecimiento,
          ciudadFallecimiento: intake.causanteCiudadFallecimiento,
        },
        caseIntake: intakeId,
      },
      overrideAccess: true,
    })

    // Update Intake
    await payload.update({
      collection: 'case-intakes',
      id: intakeId,
      req,
      data: {
        status: 'paid',
        case: newCase.id,
      },
      overrideAccess: true,
    })

    return Response.json({ success: true, caseId: newCase.id }, { status: 200 })
  } catch (error) {
    req.payload.logger.error(`Error in convert-intake: ${error}`)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
