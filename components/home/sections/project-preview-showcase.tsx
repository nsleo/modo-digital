"use client";

import { useEffect, useRef } from "react";

type PreviewAsset = {
  src: string;
  alt: string;
};

type ProjectPreviewShowcaseProps = {
  desktop: PreviewAsset;
  mobile?: PreviewAsset;
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
  desktop,
  mobile,
  title,
}: ProjectPreviewShowcaseProps) {
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const desktopImageRef = useRef<HTMLImageElement>(null);
  const mobileFrameRef = useRef<HTMLDivElement>(null);
  const mobileImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const updateDistances = () => {
      setScrollDistance(desktopFrameRef.current, desktopImageRef.current);
      setScrollDistance(mobileFrameRef.current, mobileImageRef.current);
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
        <div className="project-preview-showcase__desktop-frame" ref={desktopFrameRef}>
          <img
            ref={desktopImageRef}
            src={desktop.src}
            alt={desktop.alt}
            className="project-preview-showcase__image project-preview-showcase__image--desktop"
            loading="lazy"
            onLoad={() => setScrollDistance(desktopFrameRef.current, desktopImageRef.current)}
          />
        </div>
      </div>

      {mobile ? (
        <div className="project-preview-showcase__mobile-shell">
          <div className="project-preview-showcase__mobile-speaker" aria-hidden="true" />
          <div className="project-preview-showcase__mobile-frame" ref={mobileFrameRef}>
            <img
              ref={mobileImageRef}
              src={mobile.src}
              alt={mobile.alt}
              className="project-preview-showcase__image project-preview-showcase__image--mobile"
              loading="lazy"
              onLoad={() => setScrollDistance(mobileFrameRef.current, mobileImageRef.current)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
