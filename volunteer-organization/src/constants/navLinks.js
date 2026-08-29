import { ROUTES } from './paths'

export const linksByRole = {
  volunteer: [
    { name: 'Explore Opportunities', href: ROUTES.EXPLORE },
    { name: 'My Volunteering', href: ROUTES.MY_VOLUNTEERING },
    { name: 'Organizations', href: ROUTES.ORGANIZATIONS },
  ],

  organization: [
    { name: 'Dashboard', href: ROUTES.DASHBOARD },
    { name: 'My Causes', href: ROUTES.MY_CAUSES },
  ],
 
  admin: [],

  guest: [
    { name: 'Opportunities', href: ROUTES.OPPORTUNITIES },
    { name: 'Organizations', href: ROUTES.ORGANIZATIONS },
  ],
}