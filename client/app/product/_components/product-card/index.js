"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CompareButton from "../product-button";
import CartButton from "../cart-button";
import styles from "./product-card.module.scss";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null); // 👈 取得每張卡片的 DOM 元素

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.fadeInUp); // ✅ 進入畫面時觸發動畫
          } else {
            entry.target.classList.remove(styles.fadeInUp); // ✅ 滑出畫面時移除動畫，讓它可以重新播放
          }
        });
      },
      { threshold: 0.3 } // ✅ 當 30% 出現在視野內就觸發
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef} // 👈 設定 ref
      className={`col-6 col-sm-6 col-md-4 col-lg-3 mb-4 ${styles.card}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="position-relative">
        <div className={`position-absolute top-0 end-0 p-2 z-3 ${isHovered ? styles.showCompare : styles.hideCompare}`}>
          <CompareButton product={product} isHovered={isHovered} />
        </div>

        <Link href={`/product/${product.id}`} className="stretched-link" aria-label={`查看 ${product.name} 的詳細資訊`} />

        <div className="position-relative">
          <img src={product.image_url} alt={product.name} className={styles.cardImgTop} />
        </div>

        <div className={`${styles.cardbody} position-relative`}>
          <p className={`text mb-2 ${styles.productBrand}`}>{product.brand_name}</p>
          <h5 className={`card-title ${styles.productTitle}`}>{product.name}</h5>
          <p className={`card-text ${styles.cardText}`}>NT. {product.price.toLocaleString()}</p>
          <div className="d-flex justify-content-center">
            <CartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
