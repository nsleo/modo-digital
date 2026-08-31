"use client";

import { useEffect, useRef, useState } from "react";

type PreviewAsset = {
  src: string;
  alt: string;
};

type ProjectPreviewShowcaseProps = {
  poster: PreviewAsset;
  full?: PreviewAsset;
  title: string;
};

function setScrollDistance(frame: HTMLDivElement | null, image: HTMLImageElement | null) {
  if (!frame || !image) {
    return;
  }

  const distance = Math.max(image.scrollHeight - frame.clientHeight, 0);
  frame.style.setProperty("--preview-scroll-distance", `${distance}px`);
}

export function ProjectPreviewShowcase({
  poster,
  full,
  title,
}: ProjectPreviewShowcaseProps) {
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const fullImageRef = useRef<HTMLImageElement>(null);
  const [isFullReady, setIsFullReady] = useState(false);

  useEffect(() => {
    const updateDistances = () => {
      setScrollDistance(desktopFrameRef.current, fullImageRef.current);
    };

    updateDistances();
    window.addEventListener("resize", updateDistances);

    return () => {
      window.removeEventListener("resize", updateDistances);
    };
  }, []);

  return (
    <div className="project-preview-showcase" aria-label={`Preview do site ${title}`}>
      <div className="project-preview-showcase__desktop-shell">
        <div className="project-preview-showcase__browser-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div
          className={`project-preview-showcase__desktop-frame${isFullReady ? " is-full-ready" : ""}`}
          ref={desktopFrameRef}
        >
          <img
            src={poster.src}
            alt={poster.alt}
            className="project-preview-showcase__image project-preview-showcase__image--poster"
            loading="eager"
          />
          {full ? (
            <img
              ref={fullImageRef}
              src={full.src}
              alt={full.alt}
              className="project-preview-showcase__image project-preview-showcase__image--full"
              loading="lazy"
              onLoad={() => {
                setScrollDistance(desktopFrameRef.current, fullImageRef.current);
                setIsFullReady(true);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
