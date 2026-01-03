import { useEffect, useCallback, useRef } from "react";
import { trackEvent, trackBatchEvents } from "../store/api/analyticsApi";

/**
 * Hook for tracking user behavior events
 */
export const useTracking = () => {
  const eventQueue = useRef([]);
  const flushTimeoutRef = useRef(null);

  // Flush queued events
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await trackBatchEvents(events);
    } catch (error) {
      console.error("Failed to flush events:", error);
      // Re-add events to queue on failure
      eventQueue.current = [...events, ...eventQueue.current];
    }
  }, []);

  // Queue an event for batch sending
  const queueEvent = useCallback(
    (eventData) => {
      eventQueue.current.push({
        ...eventData,
        timestamp: new Date().toISOString(),
      });

      // Clear existing timeout
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }

      // Flush after 2 seconds of inactivity or if queue is full
      if (eventQueue.current.length >= 10) {
        flushEvents();
      } else {
        flushTimeoutRef.current = setTimeout(flushEvents, 2000);
      }
    },
    [flushEvents]
  );

  // Track a single event immediately
  const track = useCallback(async (eventType, data = {}) => {
    try {
      await trackEvent({
        eventType,
        ...data,
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }, []);

  // Track product view
  const trackProductView = useCallback(
    (productId, category, price) => {
      queueEvent({
        eventType: "view",
        productId,
        category,
        price,
      });
    },
    [queueEvent]
  );

  // Track product click
  const trackProductClick = useCallback(
    (productId, category) => {
      track("click", { productId, category });
    },
    [track]
  );

  // Track add to cart
  const trackAddToCart = useCallback(
    (productId, category, price, quantity = 1) => {
      track("add_to_cart", { productId, category, price, quantity });
    },
    [track]
  );

  // Track remove from cart
  const trackRemoveFromCart = useCallback(
    (productId) => {
      track("remove_from_cart", { productId });
    },
    [track]
  );

  // Track purchase
  const trackPurchase = useCallback(
    (productId, category, price, quantity = 1) => {
      track("purchase", { productId, category, price, quantity });
    },
    [track]
  );

  // Track search
  const trackSearch = useCallback(
    (searchQuery) => {
      queueEvent({
        eventType: "search",
        searchQuery,
      });
    },
    [queueEvent]
  );

  // Track wishlist add
  const trackWishlistAdd = useCallback(
    (productId, category) => {
      track("wishlist_add", { productId, category });
    },
    [track]
  );

  // Track wishlist remove
  const trackWishlistRemove = useCallback(
    (productId) => {
      track("wishlist_remove", { productId });
    },
    [track]
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushEvents();
    };
  }, [flushEvents]);

  // Flush on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushEvents();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushEvents]);

  return {
    track,
    trackProductView,
    trackProductClick,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchase,
    trackSearch,
    trackWishlistAdd,
    trackWishlistRemove,
    flushEvents,
  };
};

/**
 * Hook for tracking page views
 */
export const usePageTracking = (pageName) => {
  const { track } = useTracking();

  useEffect(() => {
    track("page_view", {
      metadata: {
        pageName,
        pageUrl: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }, [pageName, track]);
};

export default useTracking;
