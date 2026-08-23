import { demoBusinesses, demoEvents, demoOffers } from "@mytownapp/core";
import { supabase } from "@/lib/supabase";

export type Town = { id: string; name: string; state: string };
export type FeedBusiness = { id: string; name: string; category: string; description: string; address: string };
export type FeedOffer = { id: string; businessId: string; title: string; description: string };
export type FeedEvent = { id: string; title: string; venue: string; startsAt: string; recurrence: string | null };
export type TownFeed = { towns: Town[]; town: Town | null; businesses: FeedBusiness[]; offers: FeedOffer[]; events: FeedEvent[]; favoriteIds: string[]; savedOfferIds: string[] };

const demoFeed: TownFeed = {
  towns: [{ id: "t1", name: "Hillside", state: "NJ" }], town: { id: "t1", name: "Hillside", state: "NJ" },
  businesses: demoBusinesses, offers: demoOffers, events: demoEvents.map(event => ({ ...event, recurrence: event.recurrence ?? null })),
  favoriteIds: demoBusinesses.filter(item => item.isFavorite).map(item => item.id), savedOfferIds: [],
};

export async function loadFeed(userId: string | null, requestedTownId?: string): Promise<TownFeed> {
  if (!supabase) return demoFeed;
  const { data: towns, error: townsError } = await supabase.from("towns").select("id,name,state").eq("is_active", true).order("name");
  if (townsError) throw townsError;
  let primaryTownId = requestedTownId;
  if (!primaryTownId && userId) {
    const { data } = await supabase.from("user_towns").select("town_id").eq("user_id", userId).eq("is_primary", true).maybeSingle();
    primaryTownId = data?.town_id;
  }
  const town = towns?.find(item => item.id === primaryTownId) ?? towns?.[0] ?? null;
  if (!town) return { ...demoFeed, towns: [], town: null, businesses: [], offers: [], events: [], favoriteIds: [], savedOfferIds: [] };
  const { data: businesses, error: businessError } = await supabase.from("businesses").select("id,name,category,description,address").eq("town_id", town.id).eq("status", "published").order("name");
  if (businessError) throw businessError;
  const businessIds = businesses?.map(item => item.id) ?? [];
  const [offersResult, eventsResult, favoritesResult, savesResult] = await Promise.all([
    businessIds.length ? supabase.from("offers").select("id,business_id,title,description").in("business_id", businessIds).eq("status", "published").lte("starts_at", new Date().toISOString()).gte("ends_at", new Date().toISOString()) : Promise.resolve({ data: [], error: null }),
    supabase.from("events").select("id,title,venue,starts_at,recurrence_rule").eq("town_id", town.id).eq("status", "published").gte("starts_at", new Date().toISOString()).order("starts_at"),
    userId ? supabase.from("business_favorites").select("business_id").eq("user_id", userId) : Promise.resolve({ data: [], error: null }),
    userId ? supabase.from("offer_saves").select("offer_id").eq("user_id", userId) : Promise.resolve({ data: [], error: null }),
  ]);
  const firstError = offersResult.error ?? eventsResult.error ?? favoritesResult.error ?? savesResult.error;
  if (firstError) throw firstError;
  return {
    towns: towns ?? [], town, businesses: businesses ?? [],
    offers: (offersResult.data ?? []).map(item => ({ id: item.id, businessId: item.business_id, title: item.title, description: item.description })),
    events: (eventsResult.data ?? []).map(item => ({ id: item.id, title: item.title, venue: item.venue, startsAt: item.starts_at, recurrence: item.recurrence_rule })),
    favoriteIds: (favoritesResult.data ?? []).map(item => item.business_id), savedOfferIds: (savesResult.data ?? []).map(item => item.offer_id),
  };
}

export async function setPrimaryTown(userId: string | null, townId: string) {
  if (!supabase || !userId) return;
  const { error: updateError } = await supabase.from("user_towns").update({ is_primary: false }).eq("user_id", userId).eq("is_primary", true);
  if (updateError) throw updateError;
  const { error } = await supabase.from("user_towns").upsert({ user_id: userId, town_id: townId, is_primary: true });
  if (error) throw error;
}
export async function toggleBusinessFavorite(userId: string, businessId: string, saved: boolean) {
  if (!supabase) return;
  const result = saved ? await supabase.from("business_favorites").delete().match({ user_id: userId, business_id: businessId }) : await supabase.from("business_favorites").insert({ user_id: userId, business_id: businessId });
  if (result.error) throw result.error;
}
export async function toggleOfferSave(userId: string, offerId: string, saved: boolean) {
  if (!supabase) return;
  const result = saved ? await supabase.from("offer_saves").delete().match({ user_id: userId, offer_id: offerId }) : await supabase.from("offer_saves").insert({ user_id: userId, offer_id: offerId });
  if (result.error) throw result.error;
}
