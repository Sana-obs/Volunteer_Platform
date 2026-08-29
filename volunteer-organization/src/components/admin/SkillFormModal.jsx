// Like CategoryFormModal, but the skill must be linked to an existing categoryId.

import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { getCategoryLabel } from '../../utils/categoryStyles'

const EMPTY_FORM = { name: '', categoryId: '' }

export default function SkillFormModal({ open, skill, categories, onClose, onSubmit, isSubmitting, error }) {
  // Remounted via key by the parent — no useEffect sync.
  const [form, setForm] = useState(() =>
    skill ? { name: skill.name, categoryId: skill.categoryId } : EMPTY_FORM,
  )
  const isEditing = Boolean(skill)

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = () => onSubmit(form)

  const categoryOptions = categories.map((category) => ({ label: getCategoryLabel(category.name), value: category.id }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit "${skill?.name}"` : 'New skill'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!form.name.trim() || !form.categoryId}
            loadingText="Saving..."
          >
            {isEditing ? 'Save changes' : 'Create skill'}
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
          placeholder="e.g. First Aid"
        />

        <Input
          as="select"
          label="Category"
          name="categoryId"
          required
          value={form.categoryId}
          onChange={handleChange('categoryId')}
          placeholder="Select a category"
          options={categoryOptions}
        />
      </div>
    </Modal>
  )
}