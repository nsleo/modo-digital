"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectPreviewDevice } from "@/content/site";

type DeviceKind = "desktop" | "tablet" | "mobile";

type DevicePreviewProps = {
  kind: DeviceKind;
  preview: ProjectPreviewDevice;
  isActive: boolean;
};

type ProjectPreviewShowcaseProps = {
  desktop: ProjectPreviewDevice;
  tablet: ProjectPreviewDevice;
  mobile: ProjectPreviewDevice;
  isActive: boolean;
  title: string;
};

function setScrollDistance(frame: HTMLDivElement | null, image: HTMLImageElement | null) {
  if (!frame || !image) {
    return;
  }

  frame.style.setProperty(
    "--preview-scroll-distance",
    `${Math.max(image.scrollHeight - frame.clientHeight, 0)}px`,
  );
}

function DevicePreview({ kind, preview, isActive }: DevicePreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const fullImageRef = useRef<HTMLImageElement>(null);
  const [isFullReady, setIsFullReady] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsFullReady(false);
    }
  }, [isActive]);

  const isShowingFull = isActive && isFullReady;

  return (
    <div className={`project-preview-showcase__device project-preview-showcase__device--${kind}`}>
      {kind === "desktop" ? (
        <div className="project-preview-showcase__browser-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
        </div>
      ) : (
        <div className="project-preview-showcase__device-notch" aria-hidden="true" />
      )}
      <div
        className={`project-preview-showcase__frame${isShowingFull ? " is-full-ready" : ""}`}
        ref={frameRef}
      >
        <img
          src={preview.hero.src}
          alt={preview.hero.alt}
          className="project-preview-showcase__image project-preview-showcase__image--poster"
          loading="lazy"
        />
        {isActive ? (
          <img
            ref={fullImageRef}
            src={preview.full.src}
            alt={preview.full.alt}
            className="project-preview-showcase__image project-preview-showcase__image--full"
            loading="eager"
            onLoad={() => {
              setScrollDistance(frameRef.current, fullImageRef.current);
              setIsFullReady(true);
            }}
          />
        ) : null}
        {isActive && !isFullReady ? (
          <span className="project-preview-showcase__loading" aria-live="polite">
            Carregando
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectPreviewShowcase({
  desktop,
  tablet,
  mobile,
  isActive,
  title,
}: ProjectPreviewShowcaseProps) {
  return (
    <div className="project-preview-showcase" aria-label={`Preview do site ${title}`}>
      <DevicePreview kind="desktop" preview={desktop} isActive={isActive} />
      <DevicePreview kind="tablet" preview={tablet} isActive={isActive} />
      <DevicePreview kind="mobile" preview={mobile} isActive={isActive} />
    </div>
  );
}
