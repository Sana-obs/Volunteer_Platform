// No edit action — nameEn is locked after creation, so only activate/deactivate remains.

import { Power } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../common/Badge'
import { ADMIN_CARD_BASE, ADMIN_GHOST_BUTTON } from '../../utils/adminStyles'

export default function CityRow({ city, onToggleStatus, isTogglingStatus }) {
  const isActive = city.isActive !== false

  return (
    <div className={`${ADMIN_CARD_BASE} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <h3 className="font-semibold text-adminTextHi truncate">{city.nameEn}</h3>
        <Badge label={isActive ? 'Active' : 'Inactive'} tone={isActive ? 'success' : 'neutral'} dark />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="small"
          disabled={isTogglingStatus}
          onClick={() => onToggleStatus(city)}
          className={`min-h-11 min-w-11 ${ADMIN_GHOST_BUTTON} ${isActive ? 'text-danger! hover:bg-danger/10!' : 'text-success! hover:bg-success/10!'}`}
          aria-label={isActive ? `Deactivate ${city.nameEn}` : `Activate ${city.nameEn}`}
        >
          <Power size={16} />
        </Button>
      </div>
    </div>
  )
}
