"use client";
import { useEffect, useMemo, useState } from "react";
import HTMLFlipBook from "react-pageflip";

export default function FlipBook({ pdfUrl }) {
  const [pageImages, setPageImages] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const workerConfigured = useMemo(() => ({ configured: false }), []);

  useEffect(() => {
    let cancelled = false;
    if (!pdfUrl) {
      setError("No PDF URL provided");
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        setError("");
        setPageImages([]);

        // Dynamically import pdfjs to avoid build-time dependency if not installed.
        const pdfjsLib = await import("pdfjs-dist").catch(() => null);
        if (!pdfjsLib) {
          throw new Error(
            "Missing dependency 'pdfjs-dist'. Run: npm install pdfjs-dist"
          );
        }

        // Try to configure worker. Fall back gracefully if it fails.
        try {
          // Prefer modern worker path if available
          const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs");
          // Some bundlers require explicit workerSrc; keep for safety.
          // eslint-disable-next-line no-underscore-dangle
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            worker && worker.default
              ? worker.default
              : new URL(
                  "pdfjs-dist/build/pdf.worker.min.mjs",
                  import.meta.url
                ).toString();
          workerConfigured.configured = true;
        } catch (_) {
          // As a fallback, try CDN worker
          try {
            // eslint-disable-next-line no-underscore-dangle
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://unpkg.com/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs";
            workerConfigured.configured = true;
          } catch (__) {
            // ignore; pdf.js can still work without explicit workerSrc in some environments
          }
        }

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });
        const pdf = await loadingTask.promise;

        const images = [];
        for (let i = 1; i <= pdf.numPages; i += 1) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL("image/png"));
        }
        if (!cancelled) setPageImages(images);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load PDF");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, workerConfigured]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      {isLoading && <div className="text-gray-700">Loading PDF…</div>}
      {!isLoading && error && <div className="text-red-600">{error}</div>}
      {!isLoading && !error && pageImages.length > 0 && (
        <HTMLFlipBook
          width={500}
          height={700}
          size="fixed"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1536}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startPage={0}
          showCover={true}
          mobileScrollSupport={true}
          className="shadow-lg"
        >
          <div className="bg-white flex items-center justify-center text-3xl font-bold">
            Front Cover
          </div>
          {pageImages.map((src, idx) => (
            <div key={idx} className="bg-white">
              <img
                src={src}
                alt={`Page ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
          <div className="bg-white flex items-center justify-center text-3xl font-bold">
            Back Cover
          </div>
        </HTMLFlipBook>
      )}
    </div>
  );
}
