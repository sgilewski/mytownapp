import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { loadFeed, redeemOffer, setPrimaryTown, toggleBusinessFavorite, toggleOfferSave, type TownFeed } from "@/lib/data";
import { useAuth } from "@/providers/auth-provider";

type FeedContextValue = TownFeed & {
  loading: boolean;
  refresh(): Promise<void>;
  selectTown(townId: string): Promise<void>;
  toggleFavorite(businessId: string): Promise<void>;
  toggleSave(offerId: string): Promise<void>;
  redeem(offerId: string): Promise<void>;
};
const FeedContext = createContext<FeedContextValue | null>(null);
const empty: TownFeed = { towns: [], town: null, businesses: [], offers: [], events: [], favoriteIds: [], savedOfferIds: [], redeemedOfferIds: [] };

export function FeedProvider({ children }: PropsWithChildren) {
  const { userId, loading: authLoading } = useAuth();
  const [feed, setFeed] = useState<TownFeed>(empty);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setFeed(await loadFeed(userId)); } finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { if (!authLoading) void refresh(); }, [authLoading, refresh]);

  const value = useMemo<FeedContextValue>(() => ({
    ...feed,
    loading,
    refresh,
    async selectTown(townId) {
      await setPrimaryTown(userId, townId);
      setFeed(await loadFeed(userId, townId));
    },
    async toggleFavorite(businessId) {
      if (!userId) throw new Error("Sign in to save businesses.");
      const saved = feed.favoriteIds.includes(businessId);
      await toggleBusinessFavorite(userId, businessId, saved);
      setFeed(current => ({ ...current, favoriteIds: saved ? current.favoriteIds.filter(id => id !== businessId) : [...current.favoriteIds, businessId] }));
    },
    async toggleSave(offerId) {
      if (!userId) throw new Error("Sign in to save offers.");
      const saved = feed.savedOfferIds.includes(offerId);
      await toggleOfferSave(userId, offerId, saved);
      setFeed(current => ({ ...current, savedOfferIds: saved ? current.savedOfferIds.filter(id => id !== offerId) : [...current.savedOfferIds, offerId] }));
    },
    async redeem(offerId) {
      if (!userId) throw new Error("Sign in to redeem offers.");
      await redeemOffer(offerId);
      setFeed(current => ({ ...current, redeemedOfferIds: [...current.redeemedOfferIds, offerId] }));
    },
  }), [feed, loading, refresh, userId]);
  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const value = useContext(FeedContext);
  if (!value) throw new Error("useFeed must be used inside FeedProvider");
  return value;
}
