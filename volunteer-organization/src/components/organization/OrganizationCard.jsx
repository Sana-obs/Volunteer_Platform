
import { useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { ROUTES } from "../../constants/paths";

export default function OrganizationCard({ organization }) {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [lastLogoUrl, setLastLogoUrl] = useState(organization?.profileImageUrl);
  if (organization?.profileImageUrl !== lastLogoUrl) {
    setLastLogoUrl(organization?.profileImageUrl);
    setLogoFailed(false);
  }

  const hasLogo = Boolean(organization.profileImageUrl) && !logoFailed;

  const buildingIconFallback = (
    <div className="flex w-full aspect-video items-center justify-center bg-primary/10">
      <Building2 className="h-10 w-10 text-primary" aria-hidden="true" />
    </div>
  );

  const logoMedia = (
    <div className="relative w-full aspect-video bg-primary/10">
      <img
        src={organization.profileImageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30"
      />
      <img
        src={organization.profileImageUrl}
        alt={organization.name}
        onError={() => setLogoFailed(true)}
        className="relative w-full h-full object-contain p-4"
      />
    </div>
  );

  const verifiedBadge = null;

  const goToProfile = () => navigate(`${ROUTES.ORGANIZATIONS}/${organization.id}`);

  return (
    <Card
      imageFallback={hasLogo ? logoMedia : buildingIconFallback}
      badge={verifiedBadge}
      title={organization.name}
      description={organization.description}
      onAction={goToProfile}
    >
      <div className="flex items-center gap-1 mb-4 text-sm text-body">
        <MapPin size={16} className="text-primary" aria-hidden="true" />
        {organization.city}
      </div>

      <Button
        variant="secondary"
        fullWidth
        className="py-4 rounded-4xl text-[15px] font-bold uppercase tracking-wide mt-auto"
        onClick={goToProfile}
      >
        View Profile
      </Button>
    </Card>
  );
}
