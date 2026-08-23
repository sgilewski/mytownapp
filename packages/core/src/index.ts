import type { Business, DashboardMetric, Offer, TownEvent } from "@mytownapp/types";

export const demoBusinesses: Business[] = [
  { id: "b1", townId: "t1", name: "Birch & Main", category: "Shopping", description: "Thoughtful home goods and gifts, chosen locally.", address: "18 Main Street", isFavorite: true },
  { id: "b2", townId: "t1", name: "Foundry Coffee", category: "Food & Drink", description: "Small-batch coffee and a sunny place to gather.", address: "42 Market Lane" },
  { id: "b3", townId: "t1", name: "Trailhead Outfitters", category: "Outdoors", description: "Gear and guidance for your next local adventure.", address: "7 River Road" }
];
export const demoOffers: Offer[] = [
  { id: "o1", businessId: "b1", title: "20% off one local favorite", description: "Choose any one regularly priced item.", status: "published", startsAt: "2026-08-01", endsAt: "2026-09-30", saves: 128, redemptions: 43 },
  { id: "o2", businessId: "b2", title: "Coffee + pastry for $8", description: "Weekdays through 11am.", status: "published", startsAt: "2026-08-01", endsAt: "2026-10-01", saves: 91, redemptions: 37 }
];
export const demoEvents: TownEvent[] = [
  { id: "e1", townId: "t1", title: "Friday Night on Main", venue: "Town Green", startsAt: "2026-08-28T18:00:00-04:00", recurrence: "Every Friday in August" },
  { id: "e2", townId: "t1", title: "Fall Makers Market", venue: "Foundry Hall", startsAt: "2026-09-12T10:00:00-04:00" }
];
export const businessMetrics: DashboardMetric[] = [
  { label: "Listing views", value: "2,481", change: "+18%", trend: "up" }, { label: "Offer saves", value: "128", change: "+12%", trend: "up" }, { label: "Redemptions", value: "43", change: "+8%", trend: "up" }, { label: "Favorites", value: "306", change: "+21", trend: "up" }
];
export const chamberMetrics: DashboardMetric[] = [
  { label: "Local members", value: "4,812", change: "+9%", trend: "up" }, { label: "Active businesses", value: "86", change: "+4", trend: "up" }, { label: "Offer redemptions", value: "1,204", change: "+15%", trend: "up" }, { label: "Event saves", value: "638", change: "+11%", trend: "up" }
];
export function activeOfferFor(businessId: string, offers = demoOffers) { return offers.find((offer) => offer.businessId === businessId && offer.status === "published"); }
