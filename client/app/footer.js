'use client'

import React, { useState, useEffect } from 'react'
import { Collapse } from 'react-bootstrap'

export default function Footer({ isCartPage }) {
    const [aboutUsOpen, setAboutUsOpen] = useState(false)
    const [accountCenterOpen, setAccountCenterOpen] = useState(false)
    const [faqOpen, setFaqOpen] = useState(false)
  return (
    <>
    {isCartPage ? '' :
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
                    onClick={() => setAccountCenterOpen(!accountCenterOpen)}
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
      </footer>}
     
      {/* copyright */}
      <div className={`copyright justify-content-between ${isCartPage ? 'copyrightColor' : ''}`}>
        <div className="row">
          {/* 左側連結 */}
          <div className={`col-lg-4 col-md-6 col-12 copyright-left d-flex justify-content-md-start justify-content-center ${isCartPage ? 'aColor' : ''}`}>
            <a href="#">聯絡我們</a>
            <span>|</span>
            <a href="#">購物說明</a>
            <span>|</span>
            <a href="#">最新消息</a>
          </div>
          {/* 右側連結 */}
          <div className={`col-lg-8 col-md-6 col-12 copyright-right d-flex justify-content-md-end justify-content-center mt-md-0 mt-1 p-0 ${isCartPage ? 'aColor' : ''}`}>
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
    </>
  )
}
