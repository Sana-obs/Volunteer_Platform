import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

export default function useUnsavedChangesGuard(shouldBlock) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (!shouldBlock) return;
      event.preventDefault();
      // some older browsers require returnValue to be set explicitly
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldBlock]);

  return blocker;
}