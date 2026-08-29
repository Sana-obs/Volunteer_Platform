import { useMemo } from 'react'
import { useMyParticipationsQuery } from './useMyParticipationsQuery'
import { buildVolunteerHoursSummary } from '../../utils/volunteerHoursSummary'

export function useVolunteerHoursSummaryQuery() {
  const participationsQuery = useMyParticipationsQuery()

  const summary = useMemo(
    () => buildVolunteerHoursSummary(participationsQuery.data ?? []),
    [participationsQuery.data],
  )

  return { ...participationsQuery, data: summary }
}