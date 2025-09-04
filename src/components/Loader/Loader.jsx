import { useEffect } from "react";
import "./Loader.css";

export default function Loader() {
  useEffect(() => {
    const handleLoad = () => {
      document.body.classList.add("loaded");
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.classList.add("hide");
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <>
      {/* Preloader */}
      <div id="preloader">
        <img src="assets/img/logo.png" alt="Logo" />
      </div>

      {/* Website Content */}
      <div className="content">
        <h1>Welcome to Click4Trip 🎉</h1>
        <p>Page loaded successfully.</p>
      </div>
    </>
  );
}
