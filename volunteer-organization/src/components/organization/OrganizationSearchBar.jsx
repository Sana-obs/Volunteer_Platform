
import { Search } from 'lucide-react'
import Input from '../ui/Input'

/**
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export default function OrganizationSearchBar({ value, onChange }) {
  return (
    <Input
      name="organization-search"
      type="search"
      icon={Search}
      placeholder="Search organizations by name or city..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search organizations"
      fullWidth
    />
  )
}