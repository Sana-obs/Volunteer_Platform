import { useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useSkillsQuery } from "../hooks/queries/useSkillsQuery";
import { useCitiesQuery } from "../hooks/queries/useCitiesQuery";
import { useVolunteerProfileQuery } from "../hooks/queries/useVolunteerProfileQuery";
import { useUpdateVolunteerProfileMutation } from "../hooks/queries/useUpdateVolunteerProfileMutation";
import { useImageUpload } from "../hooks/useImageUpload";
import { useToast } from "../hooks/useToast";
import { PANEL_SURFACE } from "../utils/surfaceStyles";

import ProfileHeader from "../components/volunteerProfile/ProfileHeader";
import ProfileForm from "../components/volunteerProfile/ProfileForm";
import ProfilePreview from "../components/volunteerProfile/ProfilePreview";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Toast from "../components/common/Toast";
import useUnsavedChangesGuard from "../hooks/useUnsavedChangesGuard";
import { profileSchema } from "../utils/auth/VolunteerProfileValidation";

const normalizeGenderFromUser = (gender) => {
  if (!gender) return "";

  const g = String(gender).toLowerCase();

  if (g === "female" || g === "f") return "Female";
  if (g === "male" || g === "m") return "Male";
  if (g.includes("prefer") || g.includes("not")) return "Prefer not to say";

  return gender;
};

export default function VolunteerProfile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const guardMessage = location.state?.message || "";

  const skillsQuery = useSkillsQuery();
  const availableSkills = skillsQuery.data ?? [];
  const skillsLoading = skillsQuery.isPending;

  const citiesQuery = useCitiesQuery();
  const governorates = citiesQuery.data ?? [];
  const governoratesLoading = citiesQuery.isPending;

  const savedProfileQuery = useVolunteerProfileQuery();
  const savedProfile = savedProfileQuery.data ?? null;

  const updateProfileMutation =
    useUpdateVolunteerProfileMutation(user?.id);

  const imageUpload = useImageUpload(user?.imageUrl || "");
  const imagePreview = imageUpload.previewUrl;

  const { toast, showSuccess, showError, closeToast } = useToast({
    message: guardMessage,
    variant: "info",
  });

  const defaultValues = useMemo(
    () => ({
      educationLevel: user?.educationLevel || "",
      dateOfBirth: user?.dateOfBirth || user?.dob || "",
      gender: normalizeGenderFromUser(user?.gender),
      city: user?.city || "",
      skills: Array.isArray(user?.skillIds)
        ? user.skillIds.map(String)
        : [],
      about: user?.about || user?.bio || "",
    }),
    [user]
  );

  const methods = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Resolve legacy skill names to IDs once the skills list is available.
  useEffect(() => {
    if (skillsLoading || Array.isArray(user?.skillIds)) return;
    if (!Array.isArray(user?.skillNames) || user.skillNames.length === 0) {
      return;
    }

    const mappedIds = user.skillNames
      .map(
        (name) =>
          availableSkills.find((skill) => skill.name === name)?.id
      )
      .filter(Boolean);

    if (mappedIds.length > 0) {
      methods.setValue("skills", mappedIds, { shouldDirty: false });
    }

    // methods is intentionally excluded because it is stable for this form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsLoading, availableSkills, user?.skillIds, user?.skillNames]);

  // Hydrate the form from the complete server profile without overwriting
  // edits if the query finishes after the user starts changing fields.
  const hydratedFromServerRef = useRef(false);

  useEffect(() => {
    if (
      hydratedFromServerRef.current ||
      !savedProfile ||
      skillsLoading
    ) {
      return;
    }

    hydratedFromServerRef.current = true;

    methods.reset({
      educationLevel: savedProfile.educationLevel || "",
      dateOfBirth: savedProfile.dateOfBirth || "",
      gender: normalizeGenderFromUser(savedProfile.gender),
      city: savedProfile.city || "",
      skills: savedProfile.skillNames
        .map(
          (name) =>
            availableSkills.find((skill) => skill.name === name)?.id
        )
        .filter(Boolean),
      about: savedProfile.about || "",
    });

    if (savedProfile.imageUrl) {
      imageUpload.reset(savedProfile.imageUrl);
    }

    // methods and imageUpload are intentionally excluded from dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedProfile, skillsLoading, availableSkills]);

  const hasUnsavedImageChange =
    Boolean(imageUpload.file) || imageUpload.removed;

  const unsavedChangesBlocker = useUnsavedChangesGuard(
    (methods.formState.isDirty || hasUnsavedImageChange) &&
      !updateProfileMutation.isPending
  );

  const fullName = user?.displayName;

  const onSubmit = async (data) => {
    try {
      const result = await updateProfileMutation.mutateAsync({
        values: data,
        photoFile: imageUpload.file,
        removePhoto: imageUpload.removed,
      });

      if (!result.success) {
        showError(result.error || "Failed to save profile");
        return;
      }

      showSuccess("Profile saved successfully.");
      methods.reset(data);

      const savedImageUrl =
        result.data?.imageUrl ??
        (imageUpload.removed ? "" : imageUpload.previewUrl);

      imageUpload.reset(savedImageUrl);

      updateUser({
        ...data,
        skillIds: data.skills,
        imageUrl: savedImageUrl,
      });
    } catch (err) {
      showError(err.message || "Failed to save profile");
    }
  };

  const onInvalidSubmit = () => {
    showError("Please fix the highlighted fields before saving.");
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full flex-1 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 md:px-16 py-10 md:py-14">
          <ProfileHeader
            fullName={fullName}
            gender={methods.watch("gender")}
            imagePreview={imageUpload.previewUrl}
            onImageChange={imageUpload.handleFileChange}
            onImageRemove={imageUpload.handleRemove}
          />

          {imageUpload.error && (
            <p className="mt-2 text-sm text-danger">
              {imageUpload.error}
            </p>
          )}

          <form
            onSubmit={methods.handleSubmit(onSubmit, onInvalidSubmit)}
            className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div
              className={`lg:col-span-2 ${PANEL_SURFACE} p-6 md:p-8`}
            >
              <ProfileForm
                submitting={updateProfileMutation.isPending}
                availableSkills={availableSkills}
                skillsLoading={skillsLoading}
                governorates={governorates}
                governoratesLoading={governoratesLoading}
              />
            </div>

            <ProfilePreview
              fullName={fullName}
              email={user?.email}
              phone={user?.phone}
              availableSkills={availableSkills}
            />
          </form>
        </div>
      </div>

      <Modal
        open={unsavedChangesBlocker.state === "blocked"}
        onClose={() => unsavedChangesBlocker.reset?.()}
        title="Unsaved changes"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => unsavedChangesBlocker.reset?.()}
            >
              Stay on this page
            </Button>

            <Button
              variant="danger"
              onClick={() => unsavedChangesBlocker.proceed?.()}
            >
              Leave without saving
            </Button>
          </>
        }
      >
        You have unsaved changes to your profile. If you leave now,
        these changes will be lost.
      </Modal>

      <Toast
        message={toast.message}
        variant={toast.variant}
        duration={7000}
        onClose={closeToast}
      />
    </FormProvider>
  );
}
