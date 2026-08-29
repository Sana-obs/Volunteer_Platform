
import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'

const MOCK_MODE = isMockMode()

const MOCK_STATS = {
  volunteersCount: 1240,
  organizationsCount: 86,
  opportunitiesCount: 312,
}

export async function fetchPlatformStats() {
  if (MOCK_MODE) {
    await wait()
    return { success: true, data: MOCK_STATS }
  }

  try {
    const response = await apiClient.get('/stats/summary')
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Unable to load platform stats') }
  }
}