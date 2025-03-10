import { useState, useEffect } from "react";
import { IoIosArrowUp } from "react-icons/io";
import styles from "./top-btn.module.scss"

const ScrollTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isMobile = window.innerWidth < 1200; // 1200px 以下不顯示按鈕

      if (isMobile) {
        setShowButton(false);
        return;
      }

      if (scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }

      if (scrollY + windowHeight >= documentHeight - 50) {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 頁面載入時先檢查一次

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    showButton && (
      <button onClick={scrollToTop} className={styles['top-btn']}>
        <IoIosArrowUp size={25} className="hvr-icon" />
      </button>
    )
  );
};

export default ScrollTopButton;
