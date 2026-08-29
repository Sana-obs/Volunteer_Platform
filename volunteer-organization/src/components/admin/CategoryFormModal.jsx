// One modal for create and edit — category=null means create.

import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

const EMPTY_FORM = { name: '', description: '' }

export default function CategoryFormModal({ open, category, onClose, onSubmit, isSubmitting, error }) {
  // Parent remounts this via key on open, so no useEffect is needed to sync with category.
  const [form, setForm] = useState(() =>
    category ? { name: category.name, description: category.description } : EMPTY_FORM,
  )
  const isEditing = Boolean(category)

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = () => onSubmit(form)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit "${category?.name}"` : 'New category'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!form.name.trim() || !form.description.trim()}
            loadingText="Saving..."
          >
            {isEditing ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger">{error}</p>}

        <Input
          label="Name"
          name="name"
          required
          value={form.name}
          onChange={handleChange('name')}
          placeholder="e.g. Environment"
        />

        <Textarea
          label="Description"
          name="description"
          required
          rows={3}
          value={form.description}
          onChange={handleChange('description')}
          placeholder="Short description shown to volunteers and organizations"
        />
      </div>
    </Modal>
  )
}