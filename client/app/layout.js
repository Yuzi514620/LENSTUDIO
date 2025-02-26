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
import { IoIosArrowUp } from "react-icons/io";
import "hover.css";

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

  const isCartPage = useMemo(
    () => pathname?.startsWith('/cart'),
    [pathname]
  )
  // top按鈕
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY; 
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight; 

    
      if (scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }

      if (scrollY + windowHeight >= documentHeight - 50) {
        setShowButton(false); 
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


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
            style={{ marginTop: '80px' }}
          />
          {!isTeacherPage && (
            <Header searchOpen={searchOpen} setSearchOpen={setSearchOpen} isCartPage={isCartPage}/>
          )}
          <AppProvider>
            {' '}
            <main className="root-content">{children}</main>
          </AppProvider>
          {isTeacherPage ? <TeacherFooter /> : <Footer isCartPage={isCartPage}/>}
        </div>

        {/* top按鈕 */}
        {showButton && (
          <button onClick={scrollToTop} className='scroll-top-btn hvr-icon-bob d-none d-xl-block'>
            <IoIosArrowUp size={25}   className="hvr-icon"/>
          </button>
        )}
      </body>
    </html>
  )
}
