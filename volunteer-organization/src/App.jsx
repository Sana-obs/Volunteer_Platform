import { 
  Navigate, 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider, 
} from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LEGACY_REDIRECTS, ROUTES } from './constants/paths'
import { ACCOUNT_TYPES } from './constants/auth/accountTypes'
import ProtectedRoute from './app/routes/ProtectedRoute'
import RequireCompleteProfile from './app/routes/RequireCompleteProfile'
import MainLayout from './layouts/MainLayout'
import PageLoader from './components/common/PageLoader'
import RouteErrorBoundary from './components/common/RouteErrorBoundary'

// Home loads eagerly; other pages use lazy loading for better initial performance
import Home from './pages/home'

const About = lazy(() => import('./pages/about'))
const Participates = lazy(() => import('./pages/participates'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VolunteerProfile = lazy(() => import('./pages/volunteerProfile'))
const VolunteerJourney = lazy(() => import('./pages/volunteerJourney'))
const OrgProfile = lazy(() => import('./pages/orgProfile'))
const MyCauses = lazy(() => import('./pages/myCauses'))
const CreateEditCause = lazy(() => import('./pages/createEditCause'))
const ApplicantsList = lazy(() => import('./pages/applicantsList'))
const OpportunitiesListPage = lazy(() => import('./pages/opportunities/OpportunitiesListPage'))
const OpportunityDetailsPage = lazy(() => import('./pages/opportunities/OpportunityDetailsPage'))
const OrganizationsListPage = lazy(() => import('./pages/organization/OrganizationsListPage'))
const OrganizationDetailsPage = lazy(() => import('./pages/organization/OrganizationDetailsPage'))
const Notifications = lazy(() => import('./pages/notifications'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrganizationsReview = lazy(() => import('./pages/admin/AdminOrganizationsReview'))
const AdminVolunteers = lazy(() => import('./pages/admin/AdminVolunteers'))
const AdminOpportunities = lazy(() => import('./pages/admin/AdminOpportunities'))
const AdminCatalogManagement = lazy(() => import('./pages/admin/AdminCatalogManagement'))
const AdminCitiesManagement = lazy(() => import('./pages/admin/AdminCitiesManagement'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const NotFound = lazy(() => import('./pages/notFound'))

// Data Router setup enables navigation blocking and centralized route error handling
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Shared layout and centralized error boundary */}
      <Route element={<MainLayout />} errorElement={<RouteErrorBoundary />}>

        {/* Restricts incomplete volunteer profiles from accessing protected pages */}
        <Route element={<RequireCompleteProfile />}>

          {/* Public */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.PARTICIPATES} element={<Participates />} />
          <Route path={ROUTES.OPPORTUNITIES} element={<OpportunitiesListPage />} />
          <Route path={ROUTES.OPPORTUNITY_DETAILS} element={<OpportunityDetailsPage />} />
          <Route path={ROUTES.ORGANIZATIONS} element={<OrganizationsListPage />} />
          <Route path={`${ROUTES.ORGANIZATIONS}/:id`} element={<OrganizationDetailsPage />} />

          {/* Available to volunteers, organizations, and admins */}
          <Route
            element={
              <ProtectedRoute
                allowedAccountTypes={[
                  ACCOUNT_TYPES.VOLUNTEER,
                  ACCOUNT_TYPES.ORGANIZATION,
                  ACCOUNT_TYPES.ADMIN,
                ]}
              />
            }
          >
            <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          </Route>

          {/* Volunteer */}
          <Route element={<ProtectedRoute allowedAccountTypes={[ACCOUNT_TYPES.VOLUNTEER]} />}>
            <Route path={ROUTES.VOLUNTEER_PROFILE} element={<VolunteerProfile />} />
            <Route path={ROUTES.MY_JOURNEY} element={<VolunteerJourney />} />
            <Route path={ROUTES.EXPLORE} element={<OpportunitiesListPage />} />
            <Route path={ROUTES.MY_VOLUNTEERING} element={<Participates />} />
          </Route>

          {/* Organization */}
          <Route element={<ProtectedRoute allowedAccountTypes={[ACCOUNT_TYPES.ORGANIZATION]} />}>
            <Route path={ROUTES.ORGANIZATION_PROFILE} element={<OrgProfile />} />
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.MY_CAUSES} element={<MyCauses />} />
            <Route path={ROUTES.CREATE_CAUSE} element={<CreateEditCause />} />
            <Route path={`${ROUTES.MY_CAUSES}/:id/edit`} element={<CreateEditCause />} />
            <Route path={`${ROUTES.APPLICANTS}/:id`} element={<ApplicantsList />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedAccountTypes={[ACCOUNT_TYPES.ADMIN]} />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN_ORGANIZATIONS} element={<AdminOrganizationsReview />} />
            <Route path={ROUTES.ADMIN_VOLUNTEERS} element={<AdminVolunteers />} />
            <Route path={ROUTES.ADMIN_OPPORTUNITIES} element={<AdminOpportunities />} />
            <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCatalogManagement />} />
            <Route path={ROUTES.ADMIN_CITIES} element={<AdminCitiesManagement />} />
            <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfile />} />
            <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Keep 404 outside the profile completion guard */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Authentication routes with their own Suspense fallback */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <Suspense fallback={<PageLoader />}>
            <Register />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <Suspense fallback={<PageLoader />}>
            <ForgotPassword />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.RESET_PASSWORD}
        element={
          <Suspense fallback={<PageLoader />}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* Redirects from legacy routes */}
      {LEGACY_REDIRECTS.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
    </>,
  ),
)

function App() {
  return <RouterProvider router={router} />
}

export default App
