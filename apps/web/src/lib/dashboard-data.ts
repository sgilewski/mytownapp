import { businessMetrics as demoBusinessMetrics, chamberMetrics as demoChamberMetrics, demoBusinesses, demoEvents, demoOffers } from "@mytownapp/core";
import type { DashboardMetric } from "@mytownapp/types";
import { requireRole } from "@/lib/auth";

export async function getBusinessDashboard() {
  const auth=await requireRole(["business_admin","business_editor","platform_admin"]);
  if(auth.demo)return{metrics:demoBusinessMetrics,businesses:demoBusinesses,offers:demoOffers,isDemo:true};
  const businessIds=auth.memberships.map(m=>m.business_id).filter((id):id is string=>Boolean(id));
  const [{data:businesses},{data:offers},{data:favorites},{data:redemptions}]=await Promise.all([
    auth.supabase.from("businesses").select("id,name,town_id,category,description,address,status").in("id",businessIds),
    auth.supabase.from("offers").select("id,business_id,title,description,status,starts_at,ends_at").in("business_id",businessIds).order("created_at",{ascending:false}),
    auth.supabase.from("business_favorites").select("business_id").in("business_id",businessIds),
    auth.supabase.from("redemptions").select("id,offer_id,offers!inner(business_id)").in("offers.business_id",businessIds)
  ]);
  const liveOffers=(offers??[]).filter(o=>o.status==="published").length;
  const metrics:DashboardMetric[]=[
    {label:"Businesses",value:String(businesses?.length??0),change:"in your workspace",trend:"neutral"},
    {label:"Live offers",value:String(liveOffers),change:"currently published",trend:"neutral"},
    {label:"Redemptions",value:String(redemptions?.length??0),change:"all time",trend:"neutral"},
    {label:"Favorites",value:String(favorites?.length??0),change:"all time",trend:"neutral"}
  ];
  return{metrics,businesses:businesses??[],offers:offers??[],isDemo:false};
}

export async function getChamberDashboard(){
  const auth=await requireRole(["chamber_admin","chamber_editor","platform_admin"]);
  if(auth.demo)return{metrics:demoChamberMetrics,businesses:demoBusinesses,events:demoEvents,invitations:[],announcements:[],chamberId:"c1",isDemo:true};
  const chamberIds=auth.memberships.map(m=>m.chamber_id).filter((id):id is string=>Boolean(id));
  const [{data:chambers},{data:events},{data:invitations},{data:announcements}]=await Promise.all([
    auth.supabase.from("chambers").select("id,town_id,name").in("id",chamberIds),
    auth.supabase.from("events").select("id,title,venue,starts_at,status,chamber_id").in("chamber_id",chamberIds).order("starts_at"),
    auth.supabase.from("invitations").select("id,email,status,created_at,chamber_id").in("chamber_id",chamberIds).order("created_at",{ascending:false}),
    auth.supabase.from("announcements").select("id,title,status,starts_at,ends_at,chamber_id").in("chamber_id",chamberIds).order("created_at",{ascending:false})
  ]);
  const townIds=(chambers??[]).map(c=>c.town_id);
  const {data:businesses}=townIds.length?await auth.supabase.from("businesses").select("id,name,status,town_id").in("town_id",townIds):{data:[]};
  const metrics:DashboardMetric[]=[
    {label:"Businesses",value:String(businesses?.length??0),change:"in chamber towns",trend:"neutral"},
    {label:"Published events",value:String((events??[]).filter(e=>e.status==="published").length),change:"on the calendar",trend:"neutral"},
    {label:"Pending invites",value:String((invitations??[]).filter(i=>i.status==="pending").length),change:"awaiting response",trend:"neutral"},
    {label:"Announcements",value:String((announcements??[]).filter(a=>a.status==="published").length),change:"currently published",trend:"neutral"}
  ];
  return{metrics,businesses:businesses??[],events:events??[],invitations:invitations??[],announcements:announcements??[],chamberId:chamberIds[0]??"",isDemo:false};
}
