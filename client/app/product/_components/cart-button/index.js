'use client'
import Swal from 'sweetalert2'
import styles from './cart-button.module.scss'
import { toast } from "react-toastify";
import { MdError } from "react-icons/md";


export default function CartButton({ product }) {
  const addToCart = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('loginWithToken')
        : null

        if (!token) {
          toast.success("請先登入才能加入購物車！", {
            position: "top-right",
            autoClose: 2000,
            icon: <MdError size={30} />, // ✅ 改成購物車 icon
          });          
          return;
        }

    const cart = JSON.parse(localStorage.getItem('cart')) || []
    const existingProduct = cart.find((item) => item.id === product.id)

    if (existingProduct) {
      existingProduct.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem('cart', JSON.stringify(cart))

    Swal.fire({
      icon: 'success',
      title: '已加入購物車！',
      text: `${product.name} 已成功加入購物車 🎉`,
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: 'top-end',
      customClass: {
        popup: styles.swalPopupAdjust
      },
    });

  }

  return (
    <button
      className={styles.cartButton}
      onClick={(e) => {
        e.stopPropagation()
        addToCart()
      }}
    >
      加入購物車
    </button>
  )
}
