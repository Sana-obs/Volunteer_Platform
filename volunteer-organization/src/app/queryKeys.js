// Centralized: Single source of truth for all React Query keys
export const queryKeys = {
  categories: {
    // Categories: All categories list
    all: ['categories'],
  },

  skills: {
    // Skills: All skills list
    all: ['skills'],
  },

  cities: {
    // Cities: All cities list
    all: ['cities'],
  },

  stats: {
    // Stats: Platform-wide statistics
    platform: ['stats', 'platform'],
  },

  volunteer: {
    // Volunteer Profile: Logged-in volunteer's own full profile (GET /volunteers/me).
    // Needed because the /login payload omits city + skills — only this endpoint has them.
    profile: ['volunteer', 'profile'],
  },

  organization: {
    // Org Profile: Organization profile by ID
    profile: (organizationId) => ['organization', 'profile', organizationId],

    // Org Dashboard Root: prefix for invalidating every org dashboard cache
    // regardless of org ID (used by participation mutations that change
    // dashboard stats but only know the opportunity, not the org).
    dashboards: ['organization', 'dashboard'],

    // Org Dashboard: Organization dashboard keyed by org ID to avoid cache collisions
    dashboard: (organizationId) => ['organization', 'dashboard', organizationId],
  },

  // Public Directory: Browsing organizations externally (not the logged-in org)
  organizations: {
    // Directory List: Public organizations list with filters
    list: (filters) => ['organizations', 'list', filters],

    // Directory Detail: Public organization detail
    detail: (id) => ['organizations', 'detail', id],

    // Directory Opportunities: Opportunities for a public organization
    opportunities: (id) => ['organizations', 'opportunities', id],
  },

  opportunities: {
    // Root Key: Invalidating this clears all subkeys (list/detail/mine/etc.)
    all: ['opportunities'],

    // List: Opportunities list with filters
    list: (filters) => ['opportunities', 'list', filters],

    // Suggested: Suggested opportunities based on user parameters
    suggested: (params) => ['opportunities', 'suggested', params],

    // Detail: Opportunity detail by ID
    detail: (id) => ['opportunities', 'detail', id],

    // Mine: Opportunities belonging to a specific organization
    mine: (organizationId) => ['opportunities', 'mine', organizationId],

    // Completed: Completed opportunities for the user
    completed: ['opportunities', 'completed'],
  },

  admin: {
    // Admin Pending: Organizations awaiting admin verification
    pendingOrganizations: ['admin', 'organizations', 'pending'],

    // Admin Orgs: All organizations for admin
    organizations: ['admin', 'organizations', 'all'],

    // Admin Volunteers: All volunteers for admin
    volunteers: ['admin', 'volunteers'],

    // Admin Opportunities: All opportunities for admin
    opportunities: ['admin', 'opportunities'],

    // Admin Dashboard: Admin dashboard data
    dashboard: ['admin', 'dashboard'],
  },

  participations: {
    // Participations Root: All participations
    all: ['participations'],

    // My Participations: Logged-in user's participations
    mine: ['participations', 'mine'],

    // Applicants: Applicants for a specific opportunity
    applicants: (opportunityId) => ['participations', 'applicants', opportunityId],
  },
}
