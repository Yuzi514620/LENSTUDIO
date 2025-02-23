// rent-shopping

"use client";

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Howl } from 'howler'


export default function RentShopping({ rental }) {
  // 日期相關的狀態
  const [startDate, setStartDate] = useState('') // 選擇的開始日期
  const [endDate, setEndDate] = useState('')     // 選擇的結束日期

  // 開始日期的範圍
  const [minStartDate, setMinStartDate] = useState('')
  const [maxStartDate, setMaxStartDate] = useState('')

  // 結束日期的範圍
  const [minEndDate, setMinEndDate] = useState('')
  const [maxEndDate, setMaxEndDate] = useState('')

  // 禁用的日期 (所有星期日)
  const [disabledDates, setDisabledDates] = useState([])

  useEffect(() => {
    const today = new Date()

    // 🛠️設置開始日期的最小值 (今天 +3 天)
    today.setDate(today.getDate() + 3) // 今天 + 3 天
    const minStart = today.toISOString().split('T')[0]
    setMinStartDate(minStart)

    // 🛠️ 設置開始日期的最大值 (今天 +90 天)
    const maxStart = new Date()
    maxStart.setDate(maxStart.getDate() + 90) // 今天 + 90 天
    setMaxStartDate(maxStart.toISOString().split('T')[0])

    // 生成未來 6 個月內的所有星期日作為禁用日期
    setDisabledDates(generateDisabledSundays())
  }, [])

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value
    setStartDate(newStartDate)

    // 設置結束日期的最小值 (開始日期 + 1 天)
    const minEnd = new Date(newStartDate)
    minEnd.setDate(minEnd.getDate() + 1)
    setMinEndDate(minEnd.toISOString().split('T')[0])

    // 設置結束日期的最大值 (開始日期 + 90 天)
    const maxEnd = new Date(newStartDate)
    maxEnd.setDate(maxEnd.getDate() + 90)
    setMaxEndDate(maxEnd.toISOString().split('T')[0])
  }

  useEffect(() => {
    // 當開始日期未選擇時，設置結束日期的初始範圍
    if (!startDate && !endDate) {
      const today = new Date()

      // 🛠️ 設置結束日期的最小值 (今天 + 4 天)
      const minEnd = new Date(today)
      minEnd.setDate(minEnd.getDate() + 4) // 保持與 startDate +3 一致
      setMinEndDate(minEnd.toISOString().split('T')[0])

      // 🛠️ 設置結束日期的最大值 (今天 + 180 天)
      const maxEnd = new Date(today)
      maxEnd.setDate(maxEnd.getDate() + 180) // 最大 180 天
      setMaxEndDate(maxEnd.toISOString().split('T')[0])

      // 自動設定結束日期為合理的最小值
      // setEndDate(minEnd.toISOString().split('T')[0])
    }
  }, [startDate])

  useEffect(() => {
    if (new Date(endDate) < new Date(minEndDate) ||
      new Date(endDate) > new Date(maxEndDate)) {
      // 💡 使用防抖技術，確保狀態更新 100% 成功
      const timeout = setTimeout(() => {
        // 當結束日期無效時，自動設置為最小可選日期 (但避免星期日)
        let newEndDate = minEndDate

        // 🛠️ 如果最小可選日期 (minEndDate) 是星期日，自動跳到星期一
        const minEnd = new Date(minEndDate)
        if (minEnd.getUTCDay() === 0) { // 0 代表星期日
          minEnd.setDate(minEnd.getDate() + 1)
          newEndDate = minEnd.toISOString().split('T')[0]
        }

        setEndDate(newEndDate) // 重置為最小可選日期

      }, 50) // 延遲 100ms 確保 React 狀態更新完成

      return () => clearTimeout(timeout) // 清除上一次的計時器，避免重複觸發
    }
  }, [endDate, minEndDate, maxEndDate])

  // 🛠️ 檢查是否為星期日 (台北時間)
  const isSunday = (dateStr) => {
    const date = new Date(dateStr)
    return date.getUTCDay() === 0 // 0 代表星期日 (Sunday)
  }

  // 🛠️ 生成未來 6 個月內的所有星期日 (禁用日期)
  const generateDisabledSundays = () => {
    const disabledDates = []
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6) // 設置最大日期 (例如半年內)

    while (today <= maxDate) {
      if (isSunday(today.toISOString().split('T')[0])) {
        disabledDates.push(today.toISOString().split('T')[0])
      }
      today.setDate(today.getDate() + 1)
    }
    return disabledDates
  }

  // 🛒 加入購物車邏輯
  const handleAddToCart = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('loginWithToken') : null

    // 錯誤音效
    const falseSound = new Howl({
      src: ['/sounds/false.mp3'], // 音效來源 (支援多格式陣列)
      volume: 0.4, // 調整音量 (0.0 ~ 1.0)
      loop: false // 是否重複播放
    });

    if (!token) {
      Swal.fire({
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            const decorationBar = document.createElement('div');
            decorationBar.className = 'k-auth-swal-top-bar'; // 添加裝飾條的類別
            popup.prepend(decorationBar); // 在視窗頂部插入裝飾條
          }
          falseSound.play(); // 播放音效
        },
        color: '#fff',
        icon: 'warning',
        iconColor: '#fff',
        title: '請先登入',
        text: '登入後即可租借商品',
        background: '#23425a',
        confirmButtonText: '前往登入',
        cancelButtonText: '稍後前往',
        showCancelButton: true,
        customClass: {
          icon: 'k-auth-swal-icon',
          popup: 'k-auth-swal-popup',
          confirmButton: 'k-auth-swal-btn-1',
          cancelButton: 'k-auth-swal-btn-2'
        },
        willClose: () => {
          falseSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'
        }
      })
      return
    }

    // 驗證日期是否已選擇
    if (!startDate || !endDate) {
      Swal.fire({
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            const decorationBar = document.createElement('div');
            decorationBar.className = 'k-auth-swal-top-bar'; // 添加裝飾條的類別
            popup.prepend(decorationBar); // 在視窗頂部插入裝飾條
          }
          falseSound.play(); // 播放音效
        },
        color: '#fff',
        icon: 'warning',
        iconColor: '#fff',
        title: '請選擇租借日期',
        text: '開始與結束日期皆為必填項目',
        confirmButtonText: '前往填寫',
        background: '#23425a',
        customClass: {
          icon: 'k-auth-swal-icon',
          popup: 'k-auth-swal-popup',
          confirmButton: 'k-auth-swal-btn-1',
        },
        willClose: () => {
          falseSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
        }
      })
      return
    }

    // 解析現有的購物車內容
    const cart = JSON.parse(localStorage.getItem('cart')) || []
    const existingItem = cart.find((item) => item.rentalId === rental.id)

    if (existingItem) {
      existingItem.start = startDate
      existingItem.end = endDate
    } else {
      cart.push({
        rentalId: rental.id,
        brand: rental.brand,
        name: rental.name,
        fee: rental.fee,
        start: startDate,
        end: endDate,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
      })
    }

    const successSound = new Howl({
      src: ['/sounds/cha-ching.mp3'], // 音效來源 (支援多格式陣列)
      volume: 0.5, // 調整音量 (0.0 ~ 1.0)
      loop: false // 是否重複播放
    });

    Swal.fire({
      didOpen: () => {
        successSound.play(); // 播放音效
      },
      color: '#fff',
      icon: 'success',
      iconColor: '#fff',
      iconHtml: `<img src="/images/icon/cart-2.svg" alt="加入購物車成功圖示" class="k-swal-toast-icon">`,
      background: '#23425a',
      html: `<strong>${rental?.brand !== null ? `${rental?.brand} ` : ''}${rental?.name}</strong><br>
      租借時段 ${formatDate(startDate)} ~ ${formatDate(endDate)}`,
      showConfirmButton: false,
      timerProgressBar: true,
      showCloseButton: true,
      closeButtonHtml: '&times;', // 自訂關閉按鈕顯示的內容 (例如 "×" 符號)
      timer: 2000,
      toast: true,
      position: 'top-end',
      customClass: {
        icon: 'k-swal-toast-icon',
        popup: 'k-swal-toast-popup',
        closeButton: 'k-swal-toast-close',
        timerProgressBar: 'k-swal-toast-progress'
      },
      willClose: () => {
        successSound.stop(); // 關閉視窗時停止音效 (適用於長音效)
      }
    })
  }

  return (
    <div className="mt-3">
      <h5 className="card-title k-main-text">租借時段</h5>
      <div className="mt-2 m-3">
        <label htmlFor="startDate">開始日期</label>
        <input
          type="date"
          id="startDate"
          className="form-control mb-2"
          value={startDate}
          min={minStartDate}
          max={maxStartDate}
          onChange={handleStartDateChange}
        />
        {/* 提示禁止選擇星期日 */}
        {isSunday(startDate) && (
          <div className="k-warn-text  my-1">
            ⚠️ 週日恕無法配送 &gt; &lt; 請選其他日期
          </div>
        )}
        <label htmlFor="endDate">結束日期</label>
        <input
          type="date"
          id="endDate"
          className="form-control mb-2"
          value={endDate}
          min={minEndDate}
          max={maxEndDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {/* 提示禁止選擇星期日 */}
        {isSunday(endDate) && (
          <div className="k-warn-text  mt-1">
            ⚠️ 週日恕無法取回 &gt; &lt; 請選其他日期
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end m-1">
        <button className="btn btn-primary k-main-radius me-1">
          立即租借
        </button>
        <button
          className="btn btn-outline-primary k-main-radius"
          onClick={handleAddToCart}
          disabled={
            isSunday(startDate) ||
            isSunday(endDate)
          }
        >
          加入購物車
        </button>
      </div>
    </div>
  );
}
