"use client";
import { useState, useEffect } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { MdError } from "react-icons/md";
import styles from "./favorite-button.module.scss";

export default function FavoriteButton({ productId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("loginWithToken") : null;

  useEffect(() => {
    if (!token || !productId) return;

    fetch(`http://localhost:8000/api/product/collection/${productId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setIsFavorite(data.isFavorite))
      .catch((error) => console.error("無法確認收藏狀態:", error));
  }, [productId]);

  const toggleFavorite = async () => {
    if (!token) {
      toast.success('請先登入才能加入收藏！', {
        position: 'top-right',
        autoClose: 2000,
        icon: <MdError size={30} />, // ✅ 改成購物車 icon
      })
      return
    }
    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch("http://localhost:8000/api/product/collection", {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!res.ok) {
        const errMessage = await res.text();
        throw new Error(errMessage || "API 發生錯誤");
      }

      setIsFavorite((prev) => !prev);

      Swal.fire({
        icon: "success",
        title: isFavorite ? "已取消收藏" : "成功加入收藏",
        text: isFavorite ? "商品已從收藏列表移除" : "商品已加入您的收藏",
        showConfirmButton: false,
        timer: 1500,
      });

    } catch (error) {
      console.error(" 收藏錯誤:", error);
      Swal.fire({
        icon: "error",
        title: "操作失敗",
        text: error.message || "發生錯誤，請稍後再試",
      });
    }
  };

  return (
    <button onClick={toggleFavorite} className={styles.favoriteIcon}>
      {isFavorite ? (
        <FaHeart size={22} color="#d0b088" />
      ) : (
        <FaRegHeart size={22} color="#d0b088" />
      )}
    </button>
  );
}
