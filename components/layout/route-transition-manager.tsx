"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRouteTransitionStore } from "@/stores/route-transition-store";

function isInternalNavigationAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return null;
  if (anchor.target === "_blank") return null;
  if (anchor.hasAttribute("download")) return null;
  if (anchor.getAttribute("rel")?.includes("external")) return null;
  const href = anchor.getAttribute("href") || "";
  if (!href || href.startsWith("#")) return null;

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
    return anchor;
  } catch {
    return null;
  }
}

export function RouteTransitionManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const isNavigating = useRouteTransitionStore((s) => s.isNavigating);
  const progress = useRouteTransitionStore((s) => s.progress);
  const start = useRouteTransitionStore((s) => s.start);
  const setProgress = useRouteTransitionStore((s) => s.setProgress);
  const done = useRouteTransitionStore((s) => s.done);
  const rafRef = useRef<number | null>(null);
  const lastRouteKeyRef = useRef(routeKey);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isInternalNavigationAnchor(event.target)) return;
      start();
    };

    const onPopState = () => {
      start();
    };

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [start]);

  useEffect(() => {
    if (!isNavigating) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const current = useRouteTransitionStore.getState().progress;
      if (current < 80) {
        setProgress(current + 0.6);
      } else if (current < 92) {
        setProgress(current + 0.25);
      } else if (current < 96) {
        setProgress(current + 0.08);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isNavigating, setProgress]);

  useEffect(() => {
    if (!isNavigating) {
      lastRouteKeyRef.current = routeKey;
      return;
    }

    if (routeKey !== lastRouteKeyRef.current) {
      done();
      lastRouteKeyRef.current = routeKey;
    }
  }, [routeKey, isNavigating, done]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-primary shadow-[0_0_10px_rgba(59,130,246,0.55)] transition-opacity duration-200",
        isNavigating ? "opacity-100" : "opacity-0"
      )}
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  );
}
