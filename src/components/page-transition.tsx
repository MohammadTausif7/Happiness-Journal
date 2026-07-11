"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const hasMounted = useRef(false);
  const navigationTimeout = useRef<number | null>(null);
  const routeFrame = useRef<number | null>(null);
  const currentRoute = useRef("");

  useEffect(() => {
    if (navigationTimeout.current) {
      window.clearTimeout(navigationTimeout.current);
      navigationTimeout.current = null;
    }

    if (routeFrame.current) {
      window.cancelAnimationFrame(routeFrame.current);
      routeFrame.current = null;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      currentRoute.current = `${window.location.pathname}${window.location.search}`;
      return;
    }

    currentRoute.current = `${window.location.pathname}${window.location.search}`;

    routeFrame.current = window.requestAnimationFrame(() => {
      setIsNavigating(true);
      routeFrame.current = null;
    });

    navigationTimeout.current = window.setTimeout(() => {
      setIsNavigating(false);
      navigationTimeout.current = null;
    }, 620);
  }, [pathname]);

  useEffect(() => {
    function shouldHandleNavigation(event: globalThis.MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
      }

      const link = (event.target as Element | null)?.closest("a");

      if (!link) {
        return false;
      }

      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target ||
        link.hasAttribute("download")
      ) {
        return false;
      }

      const nextUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        nextUrl.origin === currentUrl.origin &&
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;

      return nextUrl.origin === currentUrl.origin && !isSamePage;
    }

    function handleNavigationStart(event: MouseEvent) {
      if (!shouldHandleNavigation(event)) {
        return;
      }

      setIsNavigating(true);

      if (navigationTimeout.current) {
        window.clearTimeout(navigationTimeout.current);
      }

      navigationTimeout.current = window.setTimeout(() => {
        setIsNavigating(false);
        navigationTimeout.current = null;
      }, 1400);
    }

    function handleHistoryNavigation() {
      const nextRoute = `${window.location.pathname}${window.location.search}`;

      if (nextRoute === currentRoute.current) {
        return;
      }

      currentRoute.current = nextRoute;
      setIsNavigating(true);

      if (navigationTimeout.current) {
        window.clearTimeout(navigationTimeout.current);
      }

      navigationTimeout.current = window.setTimeout(() => {
        setIsNavigating(false);
        navigationTimeout.current = null;
      }, 900);
    }

    document.addEventListener("click", handleNavigationStart, true);
    window.addEventListener("popstate", handleHistoryNavigation);

    return () => {
      document.removeEventListener("click", handleNavigationStart, true);
      window.removeEventListener("popstate", handleHistoryNavigation);

      if (navigationTimeout.current) {
        window.clearTimeout(navigationTimeout.current);
      }

      if (routeFrame.current) {
        window.cancelAnimationFrame(routeFrame.current);
      }
    };
  }, []);

  return (
    <div className={`page-transition-shell ${isNavigating ? "is-navigating" : ""}`}>
      <div className="route-loading-veil" aria-hidden="true">
        <div className="route-liquid-card">
          <span className="route-liquid-highlight" />
          <span className="route-liquid-brand">
            <BrandMark size={30} />
          </span>
        </div>
      </div>
      <div className="page-transition-glow" aria-hidden="true" />
      <div className="page-transition-stage" key={pathname}>
        {children}
      </div>
    </div>
  );
}
