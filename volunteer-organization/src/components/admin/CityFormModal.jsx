// Create-only. nameEn is locked after creation (legacy records reference it); slug is auto-computed.

import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function CityFormModal({ open, onClose, onSubmit, isSubmitting, error }) {
  const [nameEn, setNameEn] = useState('')

  const handleSubmit = () => onSubmit({ nameEn })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New city"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!nameEn.trim()}
            loadingText="Saving..."
          >
            Create city
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger">{error}</p>}

        <Input
          label="Name (English)"
          name="nameEn"
          required
          value={nameEn}
          onChange={(event) => setNameEn(event.target.value)}
          placeholder="e.g. Damascus"
        />
      </div>
    </Modal>
  )
}
