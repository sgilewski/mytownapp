import { businessMetrics as demoBusinessMetrics, chamberMetrics as demoChamberMetrics, demoBusinesses, demoEvents, demoOffers } from "@mytownapp/core";
import type { DashboardMetric } from "@mytownapp/types";
import { requireRole } from "@/lib/auth";

export async function getBusinessDashboard() {
  const auth=await requireRole(["business_admin","business_editor","platform_admin"]);
  if(auth.demo)return{metrics:demoBusinessMetrics,businesses:demoBusinesses,offers:demoOffers,redemptions:[],memberships:[],isDemo:true,workspaceName:"Birch & Main",userName:"Maya"};
  const isPlatformAdmin=auth.memberships.some(m=>m.role==="platform_admin");
  const businessIds=auth.memberships.map(m=>m.business_id).filter((id):id is string=>Boolean(id));
  const businessesQuery=auth.supabase.from("businesses").select("id,name,town_id,category,description,address,status");
  const offersQuery=auth.supabase.from("offers").select("id,business_id,title,description,status,starts_at,ends_at").order("created_at",{ascending:false});
  const favoritesQuery=auth.supabase.from("business_favorites").select("business_id");
  const redemptionsQuery=auth.supabase.from("redemptions").select("id,offer_id,redeemed_at,offers!inner(title,business_id)").order("redeemed_at",{ascending:false});
  const results=await Promise.all([
    isPlatformAdmin?businessesQuery:businessesQuery.in("id",businessIds),
    isPlatformAdmin?offersQuery:offersQuery.in("business_id",businessIds),
    isPlatformAdmin?favoritesQuery:favoritesQuery.in("business_id",businessIds),
    isPlatformAdmin?redemptionsQuery:redemptionsQuery.in("offers.business_id",businessIds)
  ]);
  const firstError=results.find(result=>result.error)?.error;
  if(firstError)throw new Error(`Unable to load business dashboard: ${firstError.message}`);
  const [{data:businesses},{data:offers},{data:favorites},{data:redemptions}]=results;
  const liveOffers=(offers??[]).filter(o=>o.status==="published").length;
  const metrics:DashboardMetric[]=[
    {label:"Businesses",value:String(businesses?.length??0),change:"in your workspace",trend:"neutral"},
    {label:"Live offers",value:String(liveOffers),change:"currently published",trend:"neutral"},
    {label:"Redemptions",value:String(redemptions?.length??0),change:"all time",trend:"neutral"},
    {label:"Favorites",value:String(favorites?.length??0),change:"all time",trend:"neutral"}
  ];
  return{metrics,businesses:businesses??[],offers:offers??[],redemptions:redemptions??[],memberships:auth.memberships,isDemo:false,workspaceName:isPlatformAdmin?"All businesses":businesses?.[0]?.name??"Business workspace",userName:auth.userName};
}

export async function getChamberDashboard(){
  const auth=await requireRole(["chamber_admin","chamber_editor","platform_admin"]);
  if(auth.demo)return{metrics:demoChamberMetrics,businesses:demoBusinesses,events:demoEvents,invitations:[],announcements:[],chambers:[{id:"c1",name:"Hillside Chamber",town_id:"t1"}],memberships:[],chamberId:"c1",isDemo:true,workspaceName:"Hillside Chamber",userName:"Alex"};
  const isPlatformAdmin=auth.memberships.some(m=>m.role==="platform_admin");
  const chamberIds=auth.memberships.map(m=>m.chamber_id).filter((id):id is string=>Boolean(id));
  const chambersQuery=auth.supabase.from("chambers").select("id,town_id,name");
  const eventsQuery=auth.supabase.from("events").select("id,title,venue,starts_at,status,chamber_id").order("starts_at");
  const invitationsQuery=auth.supabase.from("invitations").select("id,email,status,created_at,chamber_id").order("created_at",{ascending:false});
  const announcementsQuery=auth.supabase.from("announcements").select("id,title,status,starts_at,ends_at,chamber_id").order("created_at",{ascending:false});
  const results=await Promise.all([
    isPlatformAdmin?chambersQuery:chambersQuery.in("id",chamberIds),
    isPlatformAdmin?eventsQuery:eventsQuery.in("chamber_id",chamberIds),
    isPlatformAdmin?invitationsQuery:invitationsQuery.in("chamber_id",chamberIds),
    isPlatformAdmin?announcementsQuery:announcementsQuery.in("chamber_id",chamberIds)
  ]);
  const firstError=results.find(result=>result.error)?.error;
  if(firstError)throw new Error(`Unable to load chamber dashboard: ${firstError.message}`);
  const [{data:chambers},{data:events},{data:invitations},{data:announcements}]=results;
  const townIds=(chambers??[]).map(c=>c.town_id);
  const {data:businesses,error:businessError}=townIds.length?await auth.supabase.from("businesses").select("id,name,status,town_id").in("town_id",townIds):{data:[],error:null};
  if(businessError)throw new Error(`Unable to load chamber businesses: ${businessError.message}`);
  const metrics:DashboardMetric[]=[
    {label:"Businesses",value:String(businesses?.length??0),change:"in chamber towns",trend:"neutral"},
    {label:"Published events",value:String((events??[]).filter(e=>e.status==="published").length),change:"on the calendar",trend:"neutral"},
    {label:"Pending invites",value:String((invitations??[]).filter(i=>i.status==="pending").length),change:"awaiting response",trend:"neutral"},
    {label:"Announcements",value:String((announcements??[]).filter(a=>a.status==="published").length),change:"currently published",trend:"neutral"}
  ];
  return{metrics,businesses:businesses??[],events:events??[],invitations:invitations??[],announcements:announcements??[],chambers:chambers??[],memberships:auth.memberships,chamberId:chambers?.[0]?.id??"",isDemo:false,workspaceName:isPlatformAdmin?"All chambers":chambers?.[0]?.name??"Chamber workspace",userName:auth.userName};
}
