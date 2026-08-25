"use client";

import { useEffect } from "react";

export default function SotaraLoader() {
  useEffect(() => {
    const MIN_MS = 1600;
    const start = Date.now();
    const el = document.getElementById("sotara-loader");
    if (!el) return;

    const hide = () => {
      const wait = Math.max(0, MIN_MS - (Date.now() - start));
      setTimeout(() => {
        el.classList.add("is-done");
        setTimeout(() => el.remove(), 550);
      }, wait);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }
    const safety = setTimeout(hide, 6000);
    return () => clearTimeout(safety);
  }, []);

  return (
    <div id="sotara-loader" role="status" aria-label="Loading Sotara">
      <svg className="sotara-mark" viewBox="0 0 360 100" xmlns="http://www.w3.org/2000/svg">
        <line className="edge e1" pathLength="1" x1="50" y1="26" x2="23" y2="73"/>
        <line className="edge e2" pathLength="1" x1="50" y1="26" x2="75" y2="49"/>
        <line className="edge e3" pathLength="1" x1="75" y1="49" x2="49" y2="73"/>
        <line className="edge e4" pathLength="1" x1="23" y1="73" x2="49" y2="73"/>
        <circle className="node n1" cx="50" cy="26" r="7.5" fill="#3b4fd4"/>
        <circle className="node n2" cx="23" cy="73" r="7.5" fill="#b9c2ee"/>
        <circle className="node n3" cx="49" cy="73" r="7.5" fill="#3b4fd4"/>
        <circle className="node n4" cx="75" cy="49" r="7.5" fill="#1e2a6b"/>
        <text
          className="wordmark"
          x="102" y="66"
          fontFamily="'Segoe UI','Nunito',system-ui,-apple-system,sans-serif"
          fontSize="52" fontWeight="700" fill="#1e2a6b"
          letterSpacing="-1"
        >
          sotara
        </text>
      </svg>
      <div className="sotara-bar"><span /></div>
    </div>
  );
}
