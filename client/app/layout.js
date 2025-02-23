'use client'

import { Noto_Sans_TC, Inter } from 'next/font/google'
import '@/styles/ck-custom.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Footer from './footer'
import Header from './header'
import TeacherFooter from './teacher/_component/teacher-footer/page'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppProvider from '@/hooks/app-provider'

const notoSansTC = Noto_Sans_TC({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'chinese-traditional'],
  display: 'swap',
})
const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const isTeacherPage = useMemo(
    () => pathname?.startsWith('/teacher'),
    [pathname]
  )

  return (
    <html lang="zh-TW" className={`${notoSansTC.className} ${inter.className}`}>
      <body>
        <div className="layout-container">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={true}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
            className="custom-toast-container"
          />
          {!isTeacherPage && (
            <Header searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
          )}
          <AppProvider>
            {' '}
            <main className="root-content">{children}</main>
          </AppProvider>
          {isTeacherPage ? <TeacherFooter /> : <Footer />}
        </div>
      </body>
    </html>
  )
}
