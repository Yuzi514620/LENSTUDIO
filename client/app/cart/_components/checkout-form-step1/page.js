"use client"; // Next.js 13+ 必須加上這行，讓 useRouter 正確運行

import styles from "./price-summary.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 使用 useRouter 來進行導向
import { jwtDecode } from 'jwt-decode'

export default function CheckoutFormStep1({ slItem }) {
  const token = localStorage.getItem("loginWithToken")
  const decoded = jwtDecode(token);

  const [price, setPrice] = useState(0);
  const router = useRouter(); // 取得 Next.js router
  const [show, setShow] = useState(false);
  const [checkState, setCheckState] = useState(false)
  const [cpName, setCpName] = useState("")
  const [couponData, setCouponData] = useState([]); // 儲存優惠券資料
  const handleClose = () => {
    setCheckState(false)
    setShow(false)
  };

  // 計算 totalPrice
  useEffect(() => {

    if (slItem && Array.isArray(slItem)) {
      const itemPrice =
        slItem.reduce((acc, item) => acc + ((item.price * item.quantity) || 0), 0)
      setPrice(itemPrice);
    }
  }, [slItem]); // 只有當 slItem 變更時才更新 price

  function handleClick() {
    if (slItem && slItem.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(slItem));

      // 確保數據已寫入後再跳轉
      setTimeout(() => {
        router.push("/cart/cart-step2");
      }, 100); // 加入微小延遲確保 localStorage 寫入完成
    } else {
      alert("購物車內沒有商品，請添加商品後再結帳！");
    }
  }

  async function handleCheck() {
    setCheckState(!checkState)
    if (!checkState) {
      setCheckState(true)
      setShow(true)
      await fetchCoupon(); // 取得優惠券資訊
    }
  }

  function handsumbit() {
    setShow(false)
    setCpName("asdadasdasdasd")
  }

  

  async function fetchCoupon() {
    try {
      const response = await fetch(`/api/coupon?id=${decoded.id}`, {
        method: "GET",
      });

      if (response.status === 200) {
        const data = await response.json();
        setCouponData(data.result); // 儲存優惠券資訊
      } else {
        console.error("獲取失敗:", await response.text());
      }
    } catch (error) {
      console.error("請求錯誤:", error);
    }
  }

  function handleCouponSelect(coupon) {
    setCpName(coupon.code);
    setShow(false); // 選擇優惠券後關閉 Modal
  }

  return (
    <div className={`${styles["j-payStep"]} col-sm-11 col-md-9 col-lg-4 col-xl-4 mb-5 ms-lg-0 d-flex flex-column align-items-center`}>
      <div className={`${styles["j-pCount"]} border-bottom mb-3 d-flex flex-column gap-2`}>
        <div className={`${styles["j-pTitle"]} ${styles["j-publicFont"]} ms-lg-3 ms-xl-0`}>摘要</div>
        <div className={`${styles["j-ifCouponUse"]} ${styles["j-publicFont"]} ms-lg-3 ms-xl-0`}>
          <input className="form-check-input" type="checkbox" id="flexCheck" onChange={handleCheck} checked={checkState} />
          <label className="form-check-label" htmlFor="flexCheck">
            {/* <svg xmlns="http://www.w3.org/2000/svg" width={24} height={25} viewBox="0 0 24 25" fill="none">
              <circle cx={12} cy="12.5" r={11} stroke="#003150" strokeWidth={2} />
              <circle cx={12} cy="12.5" r="7.5" fill="#003150" />
            </svg> */}
            是否使用優惠券
          </label>
        </div>
        <Modal show={show} onHide={handleClose} backdrop="static" size="lg" className="j-model">
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
           {couponData.length > 0 ? (
              couponData.map((coupon, index) => (
                <div key={index} className={`${styles['j-cp']} mb-2 d-flex`}>
                  <img src={`/images/cart/${coupon.img}`} alt="" />
                </div>
              ))
            ) : (
              <p>沒有可用的優惠券</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handsumbit}>
              ok
            </Button>
          </Modal.Footer>
        </Modal>
        {/* <!-- Modal --> */}

        <div className={`${styles["couponName"]} d-flex flex-column ${styles["j-publicFont"]} ms-lg-3 ms-xl-0`}>
          {cpName}
        </div>
        <div className={`${styles["subTotalBox"]} d-flex justify-content-between ${styles["j-publicFont"]} ms-lg-3 ms-xl-0 me-lg-3 me-xl-0`}>
          <div className={styles["subTotal"]}>小計</div>
          <div className={styles["subPrice"]}>NT${price}</div>
        </div>
        <div className={`${styles["totalPriceBox"]} d-flex justify-content-between ${styles["j-publicFont"]} ms-lg-3 ms-xl-0 me-lg-3 me-xl-0`}>
          <div className={styles["total"]}>總額</div>
          <div className={styles["totalPrice"]}>NT${price}</div>
        </div>
      </div>
      <div className={`${styles["j-Checkout"]} d-flex justify-content-center align-items-center align-self-stretch`}>
        <button className={`${styles["j-btn"]} btn text-align-center d-flex flex-grow-1 justify-content-center`} onClick={handleClick}>
          結帳
        </button>
      </div>
    </div>
  );
}
