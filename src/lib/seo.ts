import { useEffect } from "react";

/** Per-route SEO: title, meta description, Open Graph (SRD Section 20).
 *  Client-rendered SPA — a prerender pass covers the marketing routes at build. */
export function useSeo(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = `${title} · GeoGrid`;
    else document.title = "GeoGrid — The academic OS for WhatsApp-based tutoring";
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    }
    if (title) {
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${title} · GeoGrid`);
    }
  }, [title, description]);
}