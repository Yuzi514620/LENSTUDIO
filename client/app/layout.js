'use client'

import { Noto_Sans_TC } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/style/globals.css'
import { useState } from 'react'
import { Collapse } from 'react-bootstrap'

const notoSansTC = Noto_Sans_TC({
  weight: ['100', '400', '700', '900'],
  subsets: ['latin', 'chinese-traditional'],
  display: 'swap',
})

// export const metadata = {
//   title: 'Lenstudio - 賣相機和攝影課程的平台',
//   description: 'Lenstudio 提供各種相機、鏡頭與專業攝影課程，讓你提升拍攝技巧。',
// }

export default function RootLayout({ children }) {
  const [aboutUsOpen, setAboutUsOpen] = useState(false)
  const [accountCenterOpen, setAccountCenterOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  return (
    <>
      <html lang="en">
        <body className={`${notoSansTC.variable}`}>
          <header className="nav-fixed-1" data-type="nav-fixed-1">
            <div className="search-icon">
              <a href="#">
                <img src="./images/search.svg" alt="search" />
              </a>
            </div>
            <div className="logo">
              <a href="#">
                <img src="./images/lenstudio-logo.svg" alt="logo" />
              </a>
            </div>
            <div className="menu-icon">
              <img src="./images/menu.svg" alt="menu" />
            </div>
            <nav>
              <ul className="nav-left">
                <li>
                  <a href="#">首頁</a>
                </li>
                <li className="product-item">
                  <a href="#">產品系列</a>
                  <div className="hover-gap" />
                  {/* 透明的緩衝區域 */}
                  <ul className="pd-dropdown">
                    <li className="drop-camera">
                      <a href="#">
                        機身
                        <span className="icon">
                          <img src="./images/arrow-down.svg" alt="Icon" />
                        </span>
                      </a>
                      <ul className="camera-brands">
                        <li>
                          <a href="#">
                            <img src="./images/canon.png" alt="Canon" />
                            <span>Canon</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/nikon.png" alt="Nikon" />
                            <span>Nikon</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/sony.png" alt="Sony" />
                            <span>Sony</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img
                              src="./images/hasselblad.png"
                              alt="Hasselblad"
                            />
                            <span>Hasselblad</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/leica.png" alt="Leica" />
                            <span>Leica</span>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="drop-lens">
                      <a href="#">
                        鏡頭
                        <span className="icon">
                          <img src="./images/arrow-down.svg" alt="Icon" />
                        </span>
                      </a>
                      <ul className="lens-brands">
                        <li>
                          <a href="#">
                            <img src="./images/canon.png" alt="Canon" />
                            <span>Canon</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/nikon.png" alt="Nikon" />
                            <span>Nikon</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/sony.png" alt="Sony" />
                            <span>Sony</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img
                              src="./images/hasselblad.png"
                              alt="Hasselblad"
                            />
                            <span>Hasselblad</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/leica.png" alt="Leica" />
                            <span>Leica</span>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="drop-other">
                      <a href="#">
                        配件
                        <span className="icon">
                          <img src="./images/arrow-down.svg" alt="Icon" />
                        </span>
                      </a>
                      <ul className="other-brands">
                        <li>
                          <a href="#">
                            <img src="./images/canon.png" alt="Canon" />
                            <span>Canon</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/nikon.png" alt="Nikon" />
                            <span>Nikon</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/sony.png" alt="Sony" />
                            <span>Sony</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img
                              src="./images/hasselblad.png"
                              alt="Hasselblad"
                            />
                            <span>Hasselblad</span>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img src="./images/leica.png" alt="Leica" />
                            <span>Leica</span>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <div className="separator" />
                  </ul>
                </li>
                <li>
                  <a href="#">租借服務</a>
                </li>
                <li>
                  <a href="#">影像學院</a>
                </li>
                <li>
                  <a href="#">影像誌</a>
                </li>
                <li>
                  <a href="#">聯絡我們</a>
                </li>
              </ul>
              <ul className="nav-right">
                <li>
                  <a href="#">
                    <img src="./images/search.svg" alt="" />
                  </a>
                  <a href="#">
                    <img src="./images/user.svg" alt="" />
                  </a>
                  <a href="#">
                    <img src="./images/compare.svg" alt="" />
                  </a>
                  <a href="#">
                    <img src="./images/cart.svg" alt="" />
                  </a>
                </li>
              </ul>
            </nav>
          </header>
          {children}
          <div>
            <footer>
              <div className="container">
                <div className="row footer-block">
                  {/* Left side (About Us, Account Center, FAQ) */}
                  <div className="col-sm-7 col-12 col-md">
                    <div className="row">
                      {/* About Us */}
                      <div className="col-12 col-md mb-3">
                        <div
                          className="title-plus d-flex justify-content-between"
                          onClick={() => setAboutUsOpen(!aboutUsOpen)}
                        >
                          <h5 className="footer-title">About Us</h5>
                          <div className="plus d-md-none mx-0 mx-sm-5">
                            {aboutUsOpen ? '-' : '+'}
                          </div>
                        </div>
                        <Collapse in={aboutUsOpen}>
                          <ul className="list-unstyled  d-md-block">
                            <li>
                              <a href="#">關於我們</a>
                            </li>
                            <li>
                              <a href="#">品牌故事</a>
                            </li>
                            <li>
                              <a href="#">新聞與公告</a>
                            </li>
                            <li>
                              <a href="#">媒體報導</a>
                            </li>
                            <li>
                              <a href="#">服務條款</a>
                            </li>
                          </ul>
                        </Collapse>
                      </div>
                      {/* Account Center */}
                      <div className="col-12 col-md mb-3">
                        <div
                          className="title-plus d-flex justify-content-between"
                          onClick={() =>
                            setAccountCenterOpen(!accountCenterOpen)
                          }
                        >
                          <h5 className="footer-title">Account Center</h5>
                          <div className="plus d-md-none mx-0 mx-sm-5">
                            {accountCenterOpen ? '-' : '+'}
                          </div>
                        </div>
                        <Collapse in={accountCenterOpen}>
                          <ul className="list-unstyled collapse d-md-block">
                            <li>
                              <a href="#">會員中心</a>
                            </li>
                            <li>
                              <a href="#">我的最愛</a>
                            </li>
                            <li>
                              <a href="#">訂單資訊查詢</a>
                            </li>
                            <li>
                              <a href="#">租賃訂單查詢</a>
                            </li>
                            <li>
                              <a href="#">課程查詢</a>
                            </li>
                            <li>
                              <a href="#">優惠專區</a>
                            </li>
                          </ul>
                        </Collapse>
                      </div>
                      {/* FAQ */}
                      <div className="col-12 col-md mb-3">
                        <div
                          className="title-plus d-flex justify-content-between"
                          onClick={() => setFaqOpen(!faqOpen)}
                        >
                          <h5 className="footer-title">FAQ</h5>
                          <div className="plus d-md-none mx-0 mx-sm-5">
                            {' '}
                            {faqOpen ? '-' : '+'}
                          </div>
                        </div>
                        <Collapse in={faqOpen}>
                          <ul className="list-unstyled collapse d-md-block">
                            <li>
                              <a href="#">購物須知</a>
                            </li>
                            <li>
                              <a href="#">產品諮詢</a>
                            </li>
                            <li>
                              <a href="#">維修保固</a>
                            </li>
                            <li>
                              <a href="#">帳戶問題</a>
                            </li>
                            <li>
                              <a href="#">訂單問題</a>
                            </li>
                          </ul>
                        </Collapse>
                      </div>
                    </div>
                  </div>
                  {/* Right side (LENSTUDIO, Open Hours) */}
                  <div className="col-sm-5 col-12 col-md">
                    <div className="row">
                      {/* LENSTUDIO */}
                      <div className="col mb-md-0 mb-4">
                        <h5 className="footer-title">LENSTUDIO</h5>
                        <p>桃園市中壢區新生路二段421號</p>
                        <p>03-3583-2748</p>
                        <p>客服信箱：LENSTUDIO@gamil.com</p>
                        <div className="social-icons">
                          <a href="#">
                            <i className="fab fa-facebook" />
                          </a>
                          <a href="#">
                            <i className="fab fa-instagram" />
                          </a>
                          <a href="#">
                            <i className="fab fa-line" />
                          </a>
                        </div>
                      </div>
                      {/* Open Hours */}
                      <div className="col">
                        <h5 className="footer-title">OPEN HOURS</h5>
                        <ul className="list-unstyled">
                          <li>週二至週五 13:00-18:30</li>
                          <li>週六及週日 11:00-18:30</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
            {/* copyright */}
            <div className="copyright justify-content-between">
              <div className="row">
                {/* 左側連結 */}
                <div className="col-lg-4 col-md-6 col-12 copyright-left d-flex justify-content-md-start justify-content-center">
                  <a href="#">聯絡我們</a>
                  <span>|</span>
                  <a href="#">購物說明</a>
                  <span>|</span>
                  <a href="#">最新消息</a>
                </div>
                {/* 右側連結 */}
                <div className="col-lg-8 col-md-6 col-12 copyright-right d-flex justify-content-md-end justify-content-center mt-md-0 mt-1 p-0">
                  <div className="copyright-right-div">
                    <div className="mobile-none">
                      <a href="#">網站使用條款</a>
                      <span>|</span>
                      <a href="#">隱私權政策</a>
                      <span>|</span>
                      <a href="#">免責聲明</a>
                      <span>|</span>
                    </div>
                    <div className="copyright-text">
                      © Copyright 2025. Lenstudio Co. Ltd. All rights reserved
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    </>
  )
}
