export type AppRole = "consumer" | "business_admin" | "business_editor" | "chamber_admin" | "chamber_editor" | "platform_admin";
export type RecordStatus = "draft" | "scheduled" | "published" | "archived";

export interface Town { id: string; name: string; state: string; slug: string; }
export interface Business { id: string; townId: string; name: string; category: string; description: string; address: string; imageUrl?: string; isFavorite?: boolean; }
export interface Offer { id: string; businessId: string; title: string; description: string; status: RecordStatus; startsAt: string; endsAt: string; saves: number; redemptions: number; }
export interface TownEvent { id: string; townId: string; title: string; venue: string; startsAt: string; recurrence?: string; imageUrl?: string; }
export interface DashboardMetric { label: string; value: string; change: string; trend: "up" | "down" | "neutral"; }
export interface Membership { id: string; userId: string; role: AppRole; businessId?: string; chamberId?: string; }
