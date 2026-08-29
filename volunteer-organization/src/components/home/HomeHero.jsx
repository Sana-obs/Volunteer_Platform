import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  UserPlus,
  HeartHandshake,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import Typography from "../ui/Typography";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import { ROUTES } from "../../constants/paths";
import { ACCOUNT_TYPES } from "../../constants/auth/accountTypes";
import { useAuth } from "../../hooks/useAuth";

const HERO_IMAGE_URL =
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=2000&q=80";


// Shared entrance easing (no bounce).
const EASE_OUT = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.05 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

const formatCount = (value) => value.toLocaleString("en-US");

function HeroStat({ value, label }) {
  return (
    <div>
      <p className="text-3xl font-extrabold leading-none text-primary sm:text-4xl">
        {formatCount(value)}+
      </p>
      <p className="mt-1.5 max-w-30 text-xs font-medium leading-snug text-white/70">
        {label}
      </p>
    </div>
  );
}

// Rendered twice: floating beside the hero on xl+, stacked in the content column below.
function HeroStatsCard({ volunteersCount, organizationsCount, loading, className = "" }) {
  const shell =
    "flex flex-col gap-4 rounded-2xl border border-white/15 border-l-2 border-l-primary bg-black/55 px-6 py-5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.65)] backdrop-blur-md sm:flex-row sm:gap-6";

  if (loading) {
    return (
      <div className={`${shell} ${className}`}>
        <div className="space-y-2">
          <Skeleton dark className="h-9 w-24" />
          <Skeleton dark className="h-3 w-28" />
        </div>
        <span className="hidden w-px self-stretch bg-white/15 sm:block" />
        <div className="space-y-2">
          <Skeleton dark className="h-9 w-20" />
          <Skeleton dark className="h-3 w-28" />
        </div>
      </div>
    );
  }

  if (!volunteersCount && !organizationsCount) return null;

  return (
    <div className={`${shell} ${className}`}>
      {volunteersCount ? (
        <HeroStat value={volunteersCount} label="Volunteers Making an Impact" />
      ) : null}

      {volunteersCount && organizationsCount ? (
        <span
          aria-hidden="true"
          className="h-px w-full bg-white/15 sm:h-auto sm:w-px sm:self-stretch"
        />
      ) : null}

      {organizationsCount ? (
        <HeroStat value={organizationsCount} label="Partner Organizations" />
      ) : null}
    </div>
  );
}

export default function HomeHero({ volunteersCount, organizationsCount, loading }) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated, accountType } = useAuth();

  return (
    <section className="relative flex min-h-[85vh] w-full items-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <motion.img
          src={HERO_IMAGE_URL}
          alt=""
          className="h-full w-full object-cover opacity-60"
          initial={{ scale: 1 }}
          animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.08 }}
          transition={{ duration: 24, ease: "easeOut" }}
        />

        {/* Darken left→right for text contrast, plus a slight vertical tie-in */}
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/85 to-black/20" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-2xl lg:pl-8"
        >
          {/* Decorative identity spine (lg+ only) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-2 bottom-2 hidden w-px bg-linear-to-b from-primary via-primary/40 to-transparent lg:block"
          />

          {/* Eyebrow */}
          <motion.div variants={fadeUpVariants}>
            <Typography
              variant="overline"
              className="mb-4 flex items-center gap-3 text-white/60!"
            >
              <span aria-hidden="true" className="h-px w-8 bg-primary" />
              A volunteering platform for Syria
            </Typography>
          </motion.div>

          {/* Title */}
          <motion.div variants={fadeUpVariants}>
            <Typography
              variant="display"
              className="text-white! text-5xl! sm:text-6xl! md:text-7xl! leading-[1.08] tracking-tight"
            >
              Connect with Purpose, <br /> Create an Impact.
            </Typography>
          </motion.div>

          <motion.div variants={fadeUpVariants}>
            <Typography variant="lead" className="mt-5 max-w-md text-white/75!">
              We bring volunteers and organizations together across Syria —
              helping people find causes that match their skills, and helping
              organizations find the volunteers they need.
            </Typography>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-10">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate(ROUTES.OPPORTUNITIES)}
                className="flex items-center gap-2"
              >
                <Search size={18} /> Explore Opportunities
              </Button>

              {!isAuthenticated ? (
                <Button
                  variant="outlineLight"
                  size="large"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="flex items-center gap-2"
                >
                  <UserPlus size={18} /> Get Started
                </Button>
              ) : accountType === ACCOUNT_TYPES.VOLUNTEER ? (
                <Button
                  variant="outlineLight"
                  size="large"
                  onClick={() => navigate(ROUTES.MY_VOLUNTEERING)}
                  className="flex items-center gap-2"
                >
                  <HeartHandshake size={18} /> My Volunteering
                </Button>
              ) : accountType === ACCOUNT_TYPES.ORGANIZATION ? (
                <Button
                  variant="outlineLight"
                  size="large"
                  onClick={() => navigate(ROUTES.CREATE_CAUSE)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={18} /> Post a New Opportunity
                </Button>
              ) : accountType === ACCOUNT_TYPES.ADMIN ? (
                <Button
                  variant="outlineLight"
                  size="large"
                  onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Button>
              ) : null}
            </div>

            {/* Mobile/tablet fallback — hidden on xl where the floating version shows */}
            <HeroStatsCard
              volunteersCount={volunteersCount}
              organizationsCount={organizationsCount}
              loading={loading}
              className="mt-8 w-fit xl:hidden"
            />
          </motion.div>
        </motion.div>

        {/* Floating version — xl+ only */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: EASE_OUT }}
          className="absolute right-8 bottom-20 hidden w-80 xl:block"
        >
          <HeroStatsCard
            volunteersCount={volunteersCount}
            organizationsCount={organizationsCount}
            loading={loading}
          />
        </motion.div>
      </div>
    </section>
  );
}