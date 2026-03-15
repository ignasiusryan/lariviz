"use client";

import { useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
}

export function DownloadButton({ targetRef, filename }: Props) {
  const [capturing, setCapturing] = useState(false);
  const { theme } = useTheme();

  const handleDownload = async () => {
    if (!targetRef.current) return;
    setCapturing(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#fafafa",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download failed:", e);
    }

    setCapturing(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={capturing}
      style={{
        background: "transparent",
        border: "1px solid var(--orange-4)",
        color: "var(--orange-5)",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        cursor: capturing ? "wait" : "pointer",
        transition: "all 0.2s",
        letterSpacing: "0.05em",
        opacity: capturing ? 0.5 : 1,
      }}
    >
      {capturing ? "Capturing…" : "Download PNG"}
    </button>
  );
}
