'use client';

import { useState } from 'react';
import styles from './course-content.module.scss';

export default function CourseContent({ content }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!content) return <p>⏳ 內容載入中...</p>;

  return (
    <div className={styles['course-detail-container']}>
      <div className={styles['container']}>
        <div className={`${styles['course-detail-content']} ${isExpanded ? styles['expanded'] : ''}`}>
          <div className={styles['content-text']} dangerouslySetInnerHTML={{ __html: content }} />
          <div className={styles['toggle-btn-container']}>
            <button className={styles['toggle-btn']} onClick={toggleExpand}>
              <span>{isExpanded ? '收起內容' : '更多課程內容'}</span>
              <img
                src="/images/icon/arrow-down-white.svg"
                alt=""
                className={isExpanded ? styles['rotate'] : ''}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
