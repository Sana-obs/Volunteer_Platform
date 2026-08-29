import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LogIn,
  Menu,
  UserPlus,
  X,
  UserIcon,
  LogOut,
  Settings2,
  UserRound,
  ChevronDown,
  Compass,
} from "lucide-react";

import { ROUTES } from "../../constants/paths";
import { ACCOUNT_TYPES } from "../../constants/auth/accountTypes";
import { linksByRole } from "../../constants/navLinks";

import LogoIcon from "../../components/ui/LogoIcon";
import Button from "../../components/ui/Button";
import NavbarDropdown from "../../components/ui/NavbarDropdown";
import NotificationBell from "../../components/ui/NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import useRecentUpdates from "../../hooks/useRecentUpdates";
import { getOrganizationId } from "../../utils/auth/getOrganizationId";

export default function Navbar({ role = "guest" }) {
  const navigate = useNavigate();
  const { user, accountType, isAuthenticated, logout } = useAuth();
  const { items: recentUpdates } = useRecentUpdates();
  // بيوصل من AuthContext (real API) أو محليًا (mock mode بعد التسجيل —
  // راجع registerUser بـ services/auth.js). زر الـ Dashboard لازم
  // يعتمد على وجوده فعليًا، مش بس على نوع الحساب
  const organizationId = getOrganizationId(user);

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const profileHref =
    accountType === ACCOUNT_TYPES.ADMIN
      ? ROUTES.ADMIN_PROFILE
      : accountType === ACCOUNT_TYPES.VOLUNTEER
        ? ROUTES.VOLUNTEER_PROFILE
        : ROUTES.ORGANIZATION_PROFILE;

  const dropdownItems = [
    {
      name: accountType === ACCOUNT_TYPES.ADMIN ? "Profile" : "My Profile",
      href: profileHref,
      icon: UserRound,
    },
  ];

  if (accountType === ACCOUNT_TYPES.VOLUNTEER) {
    dropdownItems.push({
      name: "My Journey",
      href: ROUTES.MY_JOURNEY,
      icon: Compass,
    });
  }

  if (accountType === ACCOUNT_TYPES.ADMIN) {
    dropdownItems.push({
      name: "Settings",
      href: ROUTES.ADMIN_SETTINGS,
      icon: Settings2,
    });
  }

  dropdownItems.push({
    name: "Logout",
    icon: LogOut,
    onClick: handleLogout,
  });

  const baseLinks = [{ name: "Home", href: ROUTES.HOME }];
  const aboutLink = { name: "About Us", href: ROUTES.ABOUT };

  // هذا الملف لا يُعرض إطلاقًا داخل صفحات الأدمن (AdminLayout يستخدم
  // AdminTopbar المستقل بدلًا منه) — فأي مستخدم يظهر له هذا الشريط هو
  // بالتعريف خارج لوحة التحكم. الأدمن هون بوضع تصفّح الموقع العام، فبياخد
  // نفس روابط الزائر (guest) بدل linksByRole.admin (الفاضية عمدًا)
  const navRole = accountType === ACCOUNT_TYPES.ADMIN ? "guest" : role;

  // "Dashboard" مرتبط فعليًا بمنظمة موثّقة بـ id — لو مش متوفر بعد
  // (مثلًا مباشرة بعد التسجيل بوضع real API لسا ما وصل)، منخفيه بدل ما
  // يوصل المستخدم لصفحة داشبورد بدون organizationId صالح
  const roleLinks = (linksByRole[navRole] || []).filter(
    (link) => link.name !== "Dashboard" || Boolean(organizationId)
  );

  const allLinks = [...baseLinks, ...roleLinks, aboutLink];

  // نسخة مطوّرة بصريًا فقط عن الأصل: pill بخلفية ممتلئة عند التفعيل +
  // نقطة مؤشر صغيرة تحت الرابط النشط، بدل الاعتماد على border-b وحده.
  // بنية الدالة نفسها (تاخد isActive وترجع className) ما تغيّرت —
  // لسا نفس التوقيع المستخدم بكل مكان.
  const linkClass = ({ isActive }) =>
    `group relative inline-flex items-center gap-2 rounded-xl px-4 py-3
   text-base font-medium transition-all duration-200
     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-white/75 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/95 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <NavLink
            to={ROUTES.HOME}
            className="group flex shrink-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {/* حاوية صغيرة (badge) حول أيقونة الشعار — تحسين بصري بحت،
                ما بيأثر على أبعاد أو سلوك أي عنصر تاني بالسطر */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-colors duration-200 group-hover:border-primary/30">
              <LogoIcon className="h-6 w-6 text-white" />
            </div>

              <span className="block whitespace-nowrap text-xl font-bold leading-tight text-white">
                Volunteer Platform
              </span>
              
          </NavLink>

          {/* Right Section */}
          <div className="flex items-center gap-3 lg:order-2">

            {!isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-3">

                {/* زوج CTA متّسق الهندسة (نفس الاستدارة/الحشو/حجم الخط)،
                    الفرق الوحيد مقصود: تعبئة برتقالية صلبة = الفعل الأساسي
                    (حساب جديد)، وحدود شفافة = الفعل الثانوي (تسجيل دخول) */}

                {/* Create Account — الفعل الأساسي */}
                <Button
                  onClick={() => navigate(ROUTES.REGISTER)}
                  variant="primary"
                  size="medium"
                  className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-base font-medium"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </Button>

                {/* Sign In — الفعل الثانوي */}
                <Button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  variant="ghost"
                  size="medium"
                  className="flex items-center gap-2 rounded-2xl border border-white/25 bg-transparent px-5 py-2.5 text-base font-medium text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>

              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <NotificationBell
                  items={recentUpdates}
                  isOpen={isBellOpen}
                  onToggle={() => setIsBellOpen((current) => !current)}
                  onClose={() => setIsBellOpen(false)}
                />

                <NavbarDropdown
                  isOpen={isProfileOpen}
                  setIsOpen={setIsProfileOpen}
                  triggerAriaLabel={user?.displayName ? `Account menu for ${user.displayName}` : "Account menu"}
                  header={

                    <div className="flex min-w-0 items-center gap-3">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover border-2 border-primary/70"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                          <UserIcon className="h-4.5 w-4.5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="hidden max-w-[220px] sm:inline sm:text-base text-sm break-words">
                          {user?.displayName}
                        </p>
                        <p className="truncate text-xs text-body capitalize">{accountType}</p>
                      </div>
                    </div>
                  }
                  trigger={
                    <div className="flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2
                                    bg-white/10 border border-white/15
                                    text-white hover:bg-white/15 hover:border-white/25
                                    transition">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="h-7 w-7 shrink-0 rounded-full object-cover border-2 border-primary/70"
                        />
                      ) : (
                        <div className="h-7 w-7 shrink-0 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {/* اسم المستخدم مخفي تحت sm (كان يسبب overflow أفقي حقيقي
                          على 375px — تأكدنا بالقياس الفعلي: scrollWidth 520px
                          مقابل clientWidth 375px). truncate + max-w من sm فما
                          فوق بدل عرض كامل بلا قيد، حتى لا يتكرر نفس overflow
                          لاسم مستخدم طويل على شاشات ضيقة نسبيًا */}
                      <span className="hidden max-w-28 truncate sm:inline sm:text-base text-sm">
                        {user?.displayName}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-white/60 transition-transform ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  }
                  items={dropdownItems}
                />
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="small"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="p-2 rounded-2xl bg-white/10 border border-white/15 text-white
                         hover:bg-white/15 hover:border-white/25 lg:hidden"
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>

          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex lg:w-auto lg:order-1">
            {/* التباعد بين الروابط يتّسع من xl فما فوق (الشاشة العريضة يلي
                ظهرت فيها المشكلة) — lg يبقى gap-1 لعدم المخاطرة بـ overflow
                عند 1024px مع الأدوار كثيرة الروابط (متطوع = 5 روابط) */}
            <ul className="flex flex-row items-center gap-1 font-medium text-sm xl:gap-3 xl:text-base">
              {allLinks.map((link) => (
                <li key={link.name}>
                  <NavLink to={link.href} className={linkClass}>
                    {({ isActive }) => (
                      <>
                        {link.icon && <link.icon size={18} aria-hidden="true" />}
                        <span>{link.name}</span>
                        {/* نقطة مؤشر صغيرة تحت الرابط النشط — إضافة بصرية
                            بحتة، بديل عن الحد السفلي القديم (border-b) */}
                        {isActive && (
                          <span className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isOpen ? "mt-4 max-h-150 pb-4 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col items-start space-y-1 border-t border-white/10 pt-4 font-medium text-[16px]">
            {allLinks.map((link) => (
              <li key={link.name} className="w-full">
                <NavLink
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block w-full rounded-lg border-l-4 px-3 py-3 transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-white hover:bg-white/5"
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    {link.icon && <link.icon size={18} aria-hidden="true" />}
                    {link.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* تسجيل الدخول/إنشاء حساب — غير موجودين إطلاقًا بأعلى الناف بار
              تحت md، فلازم يكونوا هون حتى يقدر الزائر يوصلهم من الموبايل */}
          {!isAuthenticated && (
            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 mt-2">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate(ROUTES.REGISTER);
                }}
                variant="primary"
                fullWidth
                className="flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </Button>

              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
                variant="ghost"
                fullWidth
                className="flex items-center justify-center gap-2 bg-transparent! text-white! border-white/25!"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}