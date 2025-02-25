'use client';
import { useEffect, useState } from "react";
import useAuth from "@/hooks/use-auth";
import Sidenav from "../_components/Sidenav/page";
import FavoriteButton from "../_components/favorite-button/page";
import styles from "./collect.module.scss";

export default function CollectPage() {
  const { token, loading } = useAuth();
  const [collections, setCollections] = useState({
    products: [],
    rents: [],
    courses: [],
    articles: [],
  }); // ✅ 確保 collections 為物件
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`http://localhost:8000/api/users/favorites/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setCollections(data);
        } else {
          setCollections({ products: [], rents: [], courses: [], articles: [] });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("獲取收藏失敗:", err);
        setIsLoading(false);
      });
  }, [token]);

  if (loading || isLoading) {
    return <div className="text-center mt-5">載入中...</div>;
  }

  return (
    <div className="container py-4">
      <div className={`row ${styles.marginTop}`}>
        <Sidenav />
        <div className="col-lg-9">
          <h1 className="mb-4">我的收藏</h1>

          {/* 產品收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">相機</h5>
            {collections.products.length === 0 ? (
              <p>目前沒有收藏的商品</p>
            ) : (
              <div className="row g-4">
                {collections.products.map((item) => (
                  <div key={item.collect_id || item.product_id} className="col-12 col-md-6 col-lg-4">
                    <div className={`p-4 ${styles.collectionCard}`}>
                      <div className='text-end'>
                        <FavoriteButton productId={item.product_id} />
                      </div>
                      <img src={item.image_url} alt={item.name} className="mb-3" />
                      <div className={styles.cardDivider} />
                      <h6 className={styles.textGray}>{item.brand_name}</h6>
                      <h5 className="mb-3">{item.name}</h5>
                      <h5 className="mb-3">價格: ${item.price}</h5>
                      <h6 className={styles.textGray}>{item.short_introduce}</h6>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 租賃收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">租賃</h5>
            {collections.rents.length === 0 ? (
              <p>沒有收藏的租賃</p>
            ) : (
              <div className="row g-4">
                {collections.rents.map((item) => (
                  <div key={item.collect_id || item.rent_id} className="col-12 col-md-6 col-lg-4">
                    <div className={`p-4 ${styles.collectionCard}`}>
                    <div className='text-end'>
                        <FavoriteButton productId={item.product_id} />
                      </div>
                      <img src={item.image_url} alt={item.rent_name} className="mb-3" />
                      <div className={styles.cardDivider} />
                      <h6 className={styles.textGray}>{item.brand}</h6>
                      <h5 className="mb-3">{item.rent_name}</h5>
                      <h5 className="mb-3">價格: ${item.price} /天</h5>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 課程收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">課程</h5>
            {collections.courses.length === 0 ? (
              <p>沒有收藏的課程</p>
            ) : (
              <div className="row g-4">
                {collections.courses.map((item) => (
                  <div key={item.collect_id || item.course_id} className="col-12 col-md-6 col-lg-4">
                    <div className={`p-4 ${styles.collectionCard}`}>
                    <div className='text-end'>
                        <FavoriteButton productId={item.product_id} />
                      </div>
                      <img src={item.image_url} alt={item.course_title} className="mb-3" />
                      <div className={styles.cardDivider} />
                      <h5>{item.course_title}</h5>
                      <h6 className={styles.textGray}>講師: {item.instructor_name}</h6>
                      <h5 className="mb-3">價格: ${item.price}</h5>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 文章收藏 */}
          <section className="mb-5">
            <h5 className="mb-3">文章</h5>
            {collections.articles.length === 0 ? (
              <p>沒有收藏的文章</p>
            ) : (
              <div className="row g-4">
                {collections.articles.map((item) => (
                  <div key={item.collect_id || item.article_id} className="col-12 col-md-6 col-lg-4">
                    <div className={`p-4 ${styles.collectionCard}`}>
                      <img src={item.image_url} alt={item.title} className="mb-3" />
                      <div className={styles.cardDivider} />
                      <h5>{item.title}</h5>
                      <h6 className={styles.textGray}>{item.subtitle}</h6>
                      <p>{item.content.slice(0, 100)}...</p> {/* 顯示前100字 */}
                      <h6 className={styles.textGray}>讚數: {item.like_count}</h6>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
