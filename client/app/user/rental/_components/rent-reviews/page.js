// rent-reviews

import { useState } from 'react';
import Swal from 'sweetalert2';
import StarRating from '../rent-rating/page';
import withReactContent from 'sweetalert2-react-content';
import ReactDOM from 'react-dom/client'
import { Howl } from 'howler'

const MySwal = withReactContent(Swal);

export default function RentReviews({ reviews = [] }) {
  const [reviewList, setReviewList] = useState(reviews);



  const handleReview = async (review) => {
    const today = new Date();
    const endDate = new Date(review.end_date);
    const commentDate = review.comment_at ? new Date(review.comment_at) : null;

    // 計算時間差距（以天為單位）
    const daysSinceEnd = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
    const daysSinceComment = commentDate ? Math.floor((today - commentDate) / (1000 * 60 * 60 * 24)) : null;

    // 只有 "未留言" 的情況下，取決於 end_date
    const canLeaveComment = review.comment === null ? daysSinceEnd <= 30 : daysSinceComment <= 30;

    // 按鈕顯示邏輯
    const showConfirmButton = canLeaveComment; // 超過 30 天未留言，不顯示「儲存」
    const showDenyButton = review.comment !== null && canLeaveComment; // 超過 30 天已留言，不顯示「刪除」

    // 快速留言
    const showQuickReplyButtons = review.comment === null && canLeaveComment; // ✅ 只有當 `comment === null` 才會顯示


    // 控制 textarea 是否可輸入
    const isDisabled = !canLeaveComment ? 'disabled style="caret-color: transparent;"' : '';

    let currentRating = review.rating || 0;

    MySwal.fire({
      color: '#fff',
      background: '#23425a',
      html: `
          <h4>
          ${review.brand_name ? `<span class='me-1'>${review.brand_name}</span> ` : ''}
          <span> ${review.product_name}</span>

          </h4 >
          <img 
            src='${review.image_url || "/images/rental/test/Leica-Q3-0.png"}' 
            class='k-swal-label d-block mx-auto m-0' 
            style='width: 50%;' 
            alt='${review.product_name}' 
          />
          <label class="my-2 d-block k-swal-label">租賃日期</label>
          <div class='k-swal-label k-aux-color-3'>
            <span>${new Date(review.start_date).toISOString().split('T')[0]}</span>
            ~
            <span>${new Date(review.end_date).toISOString().split('T')[0]}</span>
          </div>
          <div class="d-flex">
            <label class="my-2 me-2 d-block k-swal-label">評論內容</label>
            ${showQuickReplyButtons ? `
              <div class="k-quick-reply-container">
                <button class="k-quick-reply-btn" onclick="document.getElementById('comment').value='輕鬆租，輕鬆還，超讚！👍'">👍</button>
                <button class="k-quick-reply-btn" onclick="document.getElementById('comment').value='出貨快，設備佳，五星好評～⭐'">⭐</button>
                <button class="k-quick-reply-btn" onclick="document.getElementById('comment').value='線上租借超快、超方便！推推❤️'">❤️</button>
              </div>
            ` : ''}
          </div>
  
          <textarea id="comment" class="form-control" rows="3" ${isDisabled}>${review.comment || ''}</textarea>
          <label class="my-2 d-block k-swal-label">評分</label>
          <div id="star-rating"></div>
  `,
      didOpen: () => {
        const container = document.getElementById('star-rating')
        if (container) {
          const root = ReactDOM.createRoot(container)
          root.render(
            <StarRating
              rating={currentRating}
              setRating={(value) => {
                currentRating = value
              }}
            />
          );
        }
      },
      showCancelButton: true,
      // showConfirmButton: review.comment_at === null,
      showConfirmButton,
      showDenyButton,
      confirmButtonText: '儲存',
      cancelButtonText: '關閉',
      denyButtonText: '刪除',

      focusConfirm: false,
      customClass: {
        actions: 'd-flex justify-content-between k-review-swal-actions',
        popup: 'k-review-swal-popup',
        confirmButton: 'k-review-swal-btn-1',
        cancelButton: 'k-review-swal-btn-2 k-swal-margin-auto',
        denyButton: 'k-review-swal-btn-3'

      },
      preConfirm: () => {
        if (!canLeaveComment) {
          Swal.showValidationMessage('已超過可編輯時間，無法留言或修改');
          return false;
        }

        const comment = document.getElementById('comment').value.trim();
        if (!comment || currentRating < 1) {
          Swal.showValidationMessage('請填寫評論內容並選擇評分');
          return false;
        }

        return { comment, rating: currentRating };
      },


    }).then(async (result) => {
      if (result.isConfirmed) {
        // **二次確認：是否送出評論**
        const confirmResult = await Swal.fire({
          color: '#fff',
          icon: 'warning',
          iconColor: '#fff',
          title: '確認送出',
          text: '您要提交這則評論嗎？',
          background: '#23425a',
          showCancelButton: true,
          confirmButtonText: '確認',
          cancelButtonText: '取消',
          focusConfirm: false,
          customClass: {
            popup: 'k-swal-small-popup',
            confirmButton: 'k-review-swal-btn-1',
            cancelButton: 'k-review-swal-btn-2',
          },
        });

        if (confirmResult.isConfirmed) {
          await fetch(`http://localhost:8000/api/myorders/rent/reviews/${review.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('loginWithToken')}`,
            },
            body: JSON.stringify({
              comment: result.value.comment,
              rating: result.value.rating
            }),
          })
            .then((response) => {
              if (!response.ok) throw new Error('提交失敗');
              return response.json();
            })
            .then(() => {
              setReviewList((prev) =>
                prev.map((r) =>
                  r.id === review.id ? { ...r, ...result.value, comment_at: new Date().toISOString() } : r
                )
              );

              // 成功音效
              const successSound = new Howl({
                src: ['/sounds/success.mp3'], // 音效來源 (支援多格式陣列)
                volume: 0.4, // 調整音量 (0.0 ~ 1.0)
                loop: false // 是否重複播放
              });

              Swal.fire({
                didOpen: () => {
                  successSound.play()
                },
                color: '#fff',
                icon: 'success',
                iconColor: '#fff',
                iconHtml: `<img src="/images/icon/fixed_icon_4.svg" alt="已取消收藏圖示" class="k-swal-toast-icon">`,
                html: `<strong>評論成功</strong><br>
                您已更新 1 則評論
                `,
                background: '#23425a',
                showConfirmButton: false,
                timerProgressBar: true,
                showCloseButton: true,
                closeButtonHtml: '&times;', // "×" 符號
                timer: 1450,
                toast: true,
                position: 'top-end',
                customClass: {
                  icon: 'k-swal-toast-icon',
                  popup: 'k-swal-toast-popup',
                  closeButton: 'k-swal-toast-close',
                  timerProgressBar: 'k-swal-toast-progress'
                },
              });
            })
            .catch(() => {
              Swal.fire('錯誤', '無法提交評論，請稍後再試', 'error');
            });
        }
      }

      // **刪除評論**
      if (result.isDenied) { // ✅ 只在「刪除」按鈕被點擊時執行
        const deleteResult = await Swal.fire({
          color: '#fff',
          icon: 'warning',
          iconColor: '#fff',
          title: '確認刪除',
          text: '一旦刪除將不能反悔',
          background: '#23425a',
          showCancelButton: true,
          confirmButtonText: '刪除',
          cancelButtonText: '取消',
          focusConfirm: false,
          customClass: {
            popup: 'k-swal-small-popup',
            confirmButton: 'k-review-swal-btn-3',
            cancelButton: 'k-review-swal-btn-2',
          }
        });

        if (deleteResult.isConfirmed) {
          await fetch(`http://localhost:8000/api/myorders/rent/reviews/${review.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('loginWithToken')}`,
            },
            body: JSON.stringify({
              comment: null,
              rating: null,
              comment_at: null
            }),
          })
            .then((response) => {
              if (!response.ok) throw new Error('刪除失敗');
              return response.json();
            })
            .then(() => {
              setReviewList((prev) =>
                prev.map((r) =>
                  r.id === review.id ? { ...r, comment: null, rating: null, comment_at: null } : r
                )
              );

              // 成功音效
              const successSound = new Howl({
                src: ['/sounds/success.mp3'], // 音效來源 (支援多格式陣列)
                volume: 0.4, // 調整音量 (0.0 ~ 1.0)
                loop: false // 是否重複播放
              });

              Swal.fire({
                didOpen: () => {
                  successSound.play()
                },
                color: '#fff',
                icon: 'success',
                iconColor: '#fff',
                iconHtml: `<img src="/images/icon/fixed_icon_4.svg" alt="已取消收藏圖示" class="k-swal-toast-icon">`,
                html: `<strong>刪除成功</strong><br>
                您已刪除 1 則評論
                `,
                background: '#23425a',
                showConfirmButton: false,
                timerProgressBar: true,
                showCloseButton: true,
                closeButtonHtml: '&times;', // "×" 符號
                timer: 1450,
                toast: true,
                position: 'top-end',
                customClass: {
                  icon: 'k-swal-toast-icon',
                  popup: 'k-swal-toast-popup',
                  closeButton: 'k-swal-toast-close',
                  timerProgressBar: 'k-swal-toast-progress'
                },
              });
            })
            .catch(() => {
              Swal.fire('錯誤', '無法刪除評論，請稍後再試', 'error');
            });
        }
      }
    });
  }



  return (
    <div>
      {reviewList.map((review) => (
        <div key={review.id} className="review-item">
          {review.status === '已完成' && (
            <button className="btn btn-info k-main-radius" onClick={() => handleReview(review)}>評論</button>
          )}
        </div>
      ))}
    </div>
  );
}
