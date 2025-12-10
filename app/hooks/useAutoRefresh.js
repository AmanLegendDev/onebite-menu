"use client";

import { useEffect } from "react";

export default function useAutoRefresh(callback, delay = 10000) {
  useEffect(() => {
    callback(); // run once
    const id = setInterval(callback, delay);
    return () => clearInterval(id); // cleanup MUST be a function returning nothing else
  }, [callback, delay]);
}
