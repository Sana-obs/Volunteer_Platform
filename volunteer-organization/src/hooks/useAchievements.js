// Also flags achievements unlocked since the user last viewed the list.

import { useEffect, useState } from "react";
import { fetchVolunteerAchievements } from "../services/achievements";
import { getSeenAchievementIds, markAchievementIdsSeen } from "../utils/achievementSeenTracker";

const MARK_SEEN_DELAY_MS = 4000;

export default function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [justUnlockedIds, setJustUnlockedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let markSeenTimeout;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchVolunteerAchievements();
        if (!isMounted) return;

        const seen = getSeenAchievementIds();
        const unlockedIds = data.filter((item) => item.unlocked).map((item) => item.id);
        const newlyUnlocked = new Set(unlockedIds.filter((id) => !seen.has(id)));

        setJustUnlockedIds(newlyUnlocked);
        setAchievements(data);

        markSeenTimeout = setTimeout(() => {
          markAchievementIdsSeen(new Set([...seen, ...unlockedIds]));
        }, MARK_SEEN_DELAY_MS);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load achievements");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
      clearTimeout(markSeenTimeout);
    };
  }, [retryCount]);

  const retry = () => setRetryCount((count) => count + 1);

  return { achievements, justUnlockedIds, loading, error, retry };
}
