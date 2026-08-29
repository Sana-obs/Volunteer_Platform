import { useEffect, useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import Typography from "../components/ui/Typography";
import Button from "../components/ui/Button";
import CauseForm from "../components/organization/CauseForm";
import OpportunityPreviewCard from "../components/opportunity/OpportunityPreviewCard";
import Skeleton from "../components/ui/Skeleton";
import VerificationStatusBanner from "../components/OrgProfile/VerificationStatusBanner";
import Toast from "../components/common/Toast";
import { useAuth } from "../hooks/useAuth";
import { useOrganizationVerification } from "../hooks/useOrganizationVerification";
import { useCategoriesQuery } from "../hooks/queries/useCategoriesQuery";
import { useSkillsQuery } from "../hooks/queries/useSkillsQuery";
import { useCitiesQuery } from "../hooks/queries/useCitiesQuery";
import { useOpportunityDetailsQuery } from "../hooks/queries/useOpportunityDetailsQuery";
import { useSaveOpportunityMutation } from "../hooks/queries/useSaveOpportunityMutation";
import { useImageUpload } from "../hooks/useImageUpload";
import { useToast } from "../hooks/useToast";
import { createOpportunitySchema } from "../utils/opportunityValidation";
import { isOrganizationProfileComplete } from "../utils/auth/profileCompletion";
import { ROUTES } from "../constants/paths";
import { getOrganizationId } from "../utils/auth/getOrganizationId";
import { PANEL_SURFACE } from "../utils/surfaceStyles";

function CausePreviewPanel({ categories, imagePreview }) {
  const values = useWatch();
  const selectedCategory = categories.find((category) => category.id === values.categoryId);

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-19.75 flex flex-col gap-3">
        <Typography variant="overline" className="px-1">
          Live Preview: how volunteers will see this cause
        </Typography>
        <OpportunityPreviewCard
          title={values.title}
          description={values.description}
          imagePreview={imagePreview}
          categoryName={selectedCategory?.name}
          location={values.city}
          minHours={values.minHours}
          maxHours={values.maxHours}
          maxVolunteers={values.maxVolunteers}
        />
      </div>
    </div>
  );
}

const DEFAULT_VALUES = {
  title: "",
  description: "",
  categoryId: "",
  city: "",
  skills: [],
  startDate: "",
  endDate: "",
  registerStartAt: "",
  registerEndAt: "",
  minHours: "",
  maxHours: "",
  totalHours: "",
  minVolunteers: "",
  maxVolunteers: "",
  isGroup: false,
};

export default function CreateEditCause() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const organizationId = getOrganizationId(user);
  const { status, rejectionReason, isVerified, hasLoadError, organization } =
    useOrganizationVerification();

  const categoriesQuery = useCategoriesQuery();
  const skillsQuery = useSkillsQuery();
  const citiesQuery = useCitiesQuery();
  const opportunityQuery = useOpportunityDetailsQuery(id);

  const saveMutation = useSaveOpportunityMutation({
    isEditMode,
    id,
    organizationId,
    organizationName: user?.orgName,
  });

  const categories = categoriesQuery.data ?? [];
  const availableSkills = skillsQuery.data ?? [];
  const governorates = citiesQuery.data ?? [];
  const opportunity = opportunityQuery.data?.opportunity ?? null;

  const { toast, showSuccess, showError, closeToast } = useToast();

  const {
    previewUrl: imagePreview,
    error: imageError,
    handleFileChange,
    file: imageFile,
    setPreviewUrl,
  } = useImageUpload();

  // Preserve the original creation time when editing an existing opportunity.
  const createdAt = useMemo(() => {
    if (isEditMode && opportunity?.createdAt) {
      return new Date(opportunity.createdAt);
    }

    return new Date();
  }, [isEditMode, opportunity]);

  const opportunitySchema = useMemo(
    () => createOpportunitySchema(createdAt),
    [createdAt]
  );

  const methods = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Populate the form and image preview once the existing opportunity is loaded.
  useEffect(() => {
    if (!isEditMode || !opportunity) return;

    methods.reset({
      title: opportunity.title,
      description: opportunity.description,
      categoryId: opportunity.category?.id || "",
      city: opportunity.location,
      skills: opportunity.skills?.map((skill) => skill.id) || [],
      startDate: opportunity.startDate,
      endDate: opportunity.endDate,
      registerStartAt: opportunity.registerStartAt || "",
      registerEndAt: opportunity.registerEndAt || "",
      minHours: opportunity.minHours,
      maxHours: opportunity.maxHours,
      totalHours: opportunity.totalHours,
      minVolunteers: opportunity.minVolunteers,
      maxVolunteers: opportunity.maxVolunteers,
      isGroup: opportunity.isGroup || false,
    });

    if (opportunity.image) {
      setPreviewUrl(opportunity.image);
    }
    // methods and setPreviewUrl are stable for this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunity, isEditMode]);

  const loading = isEditMode
    ? categoriesQuery.isPending ||
      skillsQuery.isPending ||
      citiesQuery.isPending ||
      opportunityQuery.isPending
    : categoriesQuery.isPending ||
      skillsQuery.isPending ||
      citiesQuery.isPending;

  const loadError = categoriesQuery.isError
    ? categoriesQuery.error?.message || "Failed to load categories"
    : skillsQuery.isError
      ? skillsQuery.error?.message || "Failed to load skills"
      : citiesQuery.isError
        ? citiesQuery.error?.message || "Failed to load governorates"
        : isEditMode && opportunityQuery.isError
          ? opportunityQuery.error?.message || "Failed to load this cause"
          : "";

  const handleRetryLoad = () => {
    categoriesQuery.refetch();
    skillsQuery.refetch();
    citiesQuery.refetch();

    if (isEditMode) {
      opportunityQuery.refetch();
    }
  };

  const onSubmit = async (values) => {
    const selectedCategory = categories.find(
      (category) => category.id === values.categoryId
    );

    const selectedSkillIds = Array.isArray(values.skills) ? values.skills : [];
    const selectedSkills = availableSkills
      .filter((skill) => selectedSkillIds.includes(skill.id))
      .map((skill) => ({ id: skill.id, name: skill.name }));

    const payload = {
      ...values,
      category: selectedCategory
        ? { id: selectedCategory.id, name: selectedCategory.name }
        : null,
      skills: selectedSkills,
      location: values.city,
      imageFile,
    };

    const result = await saveMutation.mutateAsync(payload);

    if (!result.success) {
      showError(result.error || "Something went wrong");
      return;
    }

    showSuccess(
      isEditMode
        ? "Changes saved successfully."
        : "Cause published successfully."
    );

    setTimeout(() => navigate(ROUTES.MY_CAUSES), 900);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-start gap-3 rounded-lg border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
          <p>{loadError}</p>
          <Button variant="danger" size="small" onClick={handleRetryLoad}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <VerificationStatusBanner
        status={status}
        rejectionReason={rejectionReason}
        hasLoadError={hasLoadError}
      />

      <Typography variant="sectionTitle" className="mb-2">
        {isEditMode ? "Edit Cause" : "Create a New Cause"}
      </Typography>

      <Typography variant="body" className="mb-8 text-body">
        {isEditMode
          ? "Update the details of this volunteering opportunity."
          : "Publish a new volunteering opportunity for people to join."}
      </Typography>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className={`lg:col-span-2 ${PANEL_SURFACE} p-6 md:p-8`}>
            <CauseForm
              categories={categories}
              availableSkills={availableSkills}
              skillsLoading={skillsQuery.isPending}
              governorates={governorates}
              governoratesLoading={citiesQuery.isPending}
              submitting={saveMutation.isPending}
              submitDisabled={!isVerified}
              submitLabel={isEditMode ? "Save Changes" : "Publish Cause"}
              imagePreview={imagePreview}
              imageError={imageError}
              onImageChange={handleFileChange}
              profileIncomplete={
                Boolean(organization) &&
                !isOrganizationProfileComplete(organization)
              }
            />

            {!isVerified && (
              <p className="text-sm text-heading/50 mt-4">
                You can prepare this cause now, but publishing requires your
                organization to be verified first.
              </p>
            )}
          </div>

          <CausePreviewPanel
            categories={categories}
            imagePreview={imagePreview}
          />
        </form>
      </FormProvider>

      <Toast
        message={toast.message}
        variant={toast.variant}
        duration={7000}
        onClose={closeToast}
      />
    </div>
  );
}
