'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useRef, useEffect, useState } from 'react'
import { usePathname } from "next/navigation";

export default function Header({ searchOpen, setSearchOpen, isCartPage }) {
  const router = useRouter()
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const selectRef = useRef(null)
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setSearchOpen])

  const handleSearch = async (e) => {
    e.preventDefault()
    const keyword = inputRef.current.value.trim()
    if (!keyword) return

    // 清除當前 URL 的查詢參數
    await router.replace('/article')

    // 根據使用者輸入產生新的查詢參數
    const query = `?search=${encodeURIComponent(keyword)}`
    const targetUrl = `/article${query}`

    router.push(targetUrl)
    // 強制重新渲染
    router.refresh()

    inputRef.current.value = ''
    setSearchOpen(false)
  }

  // 監聽 Enter 鍵按下事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault() // 防止表單提交
      handleSearch(e) // 直接呼叫 handleSearch 函數
    }
  }

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (searchOpen && inputRef.current) {
        inputRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [searchOpen])

  return (
    <>
      <header className="nav-fixed-1" data-type="nav-fixed-1">
        <div className="search-icon">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSearchOpen(!searchOpen)
            }}
          >
            <img src="/images/icon/search.svg" alt="search" />
          </a>
        </div>
        <div className="logo">
          <Link href="/">
            <img src="/images/icon/lenstudio-logo.svg" alt="logo" />
          </Link>
        </div>
        <div className="menu-icon">
          <img src="/images/icon/menu.svg" alt="menu" />
        </div>
        <nav className={`d-flex justify-content-end`}>
          <ul className="nav-left">
            <li className={pathname === "/" ? "nav-active" : ""}>
              <Link href="/">首頁</Link>
            </li>
            <li className={pathname.startsWith("/product") ? "nav-active" : ""}>
              <Link href="/product">產品系列</Link>
              <div className="hover-gap" />
              {/* 透明的緩衝區域 */}
              <ul className="pd-dropdown">
                <li className="drop-camera">
                  <Link href="/product">
                    機身
                    <span className="icon">
                      <img src="/images/icon/arrow-down.svg" alt="Icon" />
                    </span>
                  </Link>
                  <ul className="camera-brands">
                    <li>
                      <Link href="/product">
                        <img src="/images/canon.png" alt="Canon" />
                        <span>Canon</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/nikon.png" alt="Nikon" />
                        <span>Nikon</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/sony.png" alt="Sony" />
                        <span>Sony</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/hasselblad.png" alt="Hasselblad" />
                        <span>Hasselblad</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/leica.png" alt="Leica" />
                      </Link>
                      <span>Leica</span>
                    </li>
                  </ul>
                </li>
                <li className="drop-lens">
                  <Link href="/product">
                    鏡頭
                    <span className="icon">
                      <img src="/images/icon/arrow-down.svg" alt="Icon" />
                    </span>
                  </Link>
                  <ul className="lens-brands">
                    <li>
                      <Link href="/product">
                        <img src="/images/product/Hasselblad_XCD_20-35mm_F3_2-4_5_E.png" alt="Canon" />
                        <span>廣角鏡頭</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/product/Leica_Noctilux-M_50_f1_2_ASPH.webp" alt="Nikon" />
                        <span>標準鏡頭</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/product/Sony_FE_300mm_F2_8_GM_OSS.jpg" alt="Sony" />
                        <span>長焦鏡頭</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/product/Nikon_NIKKOR_Z_MC_50mm_f2_8.png" alt="Hasselblad" />
                        <span>微距鏡頭</span>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="drop-other">
                  <Link href="/product">
                    配件
                    <span className="icon">
                      <img src="/images/icon/arrow-down.svg" alt="Icon" />
                    </span>
                  </Link>
                  <ul className="other-brands">
                    <li>
                      <Link href="/product">
                        <img src="/images/product/717c4e036af74f12a02ba54701cf75ef_Battery+Pack+LP-E6P+Main+Image.png" alt="Canon" />
                        <span>電池</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/product/typeb1610385628_1592040_600x.webp" alt="Nikon" />
                        <span>記憶卡</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/product">
                        <img src="/images/product/1625829630_1642348_600x.webp" alt="Sony" />
                        <span>背帶</span>
                      </Link>
                    </li>
                  </ul>
                </li>
                <div className="separator" />
              </ul>
            </li>
            <li className={pathname.startsWith("/rental") ? "nav-active" : ""}>
              <Link href="/rental">租借服務</Link>
            </li>
            <li className={pathname.startsWith("/courses") ? "nav-active" : ""}>
              <Link href="/courses">影像學院</Link>
            </li>
            <li className={pathname.startsWith("/article") ? "nav-active" : ""}>
              <Link href="/article">影像誌</Link>
            </li>
            <li>
              <a href="#">聯絡我們</a>
            </li>
          </ul>

          <ul className="nav-right">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setSearchOpen(!searchOpen)
                }}
              >
                <img src="/images/icon/search.svg" alt="" />
              </a>
              <Link href="/login">
                <img src="/images/icon/user.svg" alt="" />
              </Link>
              <Link href="/product/spec">
                <img src="/images/icon/compare.svg" alt="" />
              </Link>
              <Link href="/cart">
                <img src="/images/icon/cart.svg" alt="" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {searchOpen && (
        <div
          ref={searchRef}
          className="search-modal"
          style={{
            width: '100%',
            background: '#eaeaea',
            padding: '1rem',
            position: 'fixed', // 改為 fixed 定位
            top: '80px', // 設定與 header 底部的距離
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'slideDown 0.5s ease forwards',
            overflow: 'hidden',
            zIndex: 9,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              maxWidth: '1000px',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="搜尋關鍵字"
              style={{
                flex: 3,
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                borderRadius: '25px',
              }}
            />
            <select
              ref={selectRef}
              defaultValue="全站搜尋"
              style={{
                flex: 1,
                marginLeft: '1rem',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '25px',
                background: '#fff',
              }}
            >
              {/* <option value="全站搜尋">全站搜尋</option>
              <option value="產品">產品</option> */}
              <option value="最新消息">最新消息</option>
              {/* <option value="課程">課程</option>
              <option value="租賃">租賃</option> */}
            </select>
            <button className="search-button" onClick={handleSearch}>
              搜尋
            </button>
          </div>
        </div>
      )}
    </>
  )
}
