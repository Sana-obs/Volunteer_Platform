import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Navbar from './navbar/Navbar'
import Footer from './Footer'
import PageLoader from '../components/common/PageLoader'
import { useAuth } from '../hooks/useAuth'

export default function MainLayout() {
  const { accountType } = useAuth()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className='flex min-h-screen flex-col bg-canvas text-heading'>
      {!isAdminRoute && <Navbar role={accountType || 'guest'} />}

      <main className='w-full flex-1'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: 'easeInOut' }}
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}