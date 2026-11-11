import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // scroll whole page
    window.scrollTo(0, 0);

    // scroll inside layout (IMPORTANT)
    const scrollContainer = document.querySelector(".scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;