
import { useFormContext, Controller } from "react-hook-form";
import { Building2, Globe, MapPin } from "lucide-react";

import Input from "../ui/Input";
import Dropdown from "../ui/Dropdown";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import Typography from "../ui/Typography";
import { getGovernorateDropdownItems } from "../../services/syrianGovernorates";

export default function OrgProfileForm({ submitting, governorates = [] }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-7">

      {/* ===========================
          Basic Info
      ============================ */}
      <Typography variant="h3" gutterBottom>
        Basic Information
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Organization Name"
          name="name"
          icon={Building2}
          register={register}
          error={errors.name?.message}
          required
          fullWidth
        />

        <Input
          label="Website"
          name="website"
          icon={Globe}
          register={register}
          placeholder="https://example.org"
          error={errors.website?.message}
          fullWidth
        />

        {/* Governorate */}
        <Controller
          name="city"
          control={control}
          defaultValue=""
          render={({ field: { value, onChange } }) => (
            <Dropdown
              label="Governorate"
              items={getGovernorateDropdownItems(governorates, value)}
              value={value}
              onChange={onChange}
              placeholder="Select your governorate"
              icon={MapPin}
              error={errors.city?.message}
            />
          )}
        />
      </div>

      {/* Description */}
      <Textarea
        label="Description"
        name="description"
        rows={5}
        register={register}
        placeholder="Tell volunteers what your organization does..."
        error={errors.description?.message}
      />

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
        <Button type="submit" isLoading={submitting}>
          {submitting ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}