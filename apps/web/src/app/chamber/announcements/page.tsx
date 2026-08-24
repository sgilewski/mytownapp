import { Megaphone } from "lucide-react";
import { setAnnouncementStatus } from "@/app/actions/resources";
import { DashboardShell } from "@/components/dashboard";
import { DashboardPageIntro,EmptyState } from "@/components/dashboard-list";
import { StatusAction } from "@/components/status-action";
import { getChamberDashboard } from "@/lib/dashboard-data";

export default async function AnnouncementsPage(){const data=await getChamberDashboard();return <DashboardShell kind="chamber" active="announcements" metrics={data.metrics} workspaceName={data.workspaceName} userName={data.userName} title="Announcements"><section className="panel activity"><DashboardPageIntro eyebrow="Town updates" title="Announcements" description="Share important community news with residents." action={{href:"/chamber/announcements/new",label:"New announcement",icon:Megaphone}}/>{data.announcements.length?data.announcements.map(a=><div className="activity-row" key={a.id}><div className="activity-icon">!</div><span><b>{a.title}</b><small>{a.status} · starts {new Date(a.starts_at).toLocaleDateString()}</small></span>{data.isDemo?null:<StatusAction action={setAnnouncementStatus} id={a.id} status={a.status==="published"?"archived":"published"} label={a.status==="published"?"Archive":"Publish"}/>}</div>):<EmptyState title="No announcements yet" description="Create the first update for residents in your town." action={{href:"/chamber/announcements/new",label:"Create announcement"}}/>}</section></DashboardShell>}
