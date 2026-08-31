import Link from "next/link";
import { CalendarPlus,MailPlus,Megaphone } from "lucide-react";
import { setAnnouncementStatus,setEventStatus } from "@/app/actions/resources";
import { DashboardShell } from "@/components/dashboard";
import { StatusAction } from "@/components/status-action";
import { getChamberDashboard } from "@/lib/dashboard-data";

export default async function ChamberDashboard(){
  const {metrics,businesses,events,announcements,isDemo,workspaceName,userName}=await getChamberDashboard();
  return <DashboardShell kind="chamber" metrics={metrics} workspaceName={workspaceName} userName={userName}>
    <div className="dashboard-grid"><section className="panel feature"><div className="panel-heading"><div><p className="eyebrow">Community pulse</p><h2>{isDemo?"Hillside is showing up.":`${businesses.length} local businesses connected.`}</h2></div></div><p>Invite local owners, publish events, and keep residents connected to what is happening nearby.</p><Link className="primary" href="/chamber/invitations/new"><MailPlus size={17}/> Invite a business</Link></section>
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Upcoming</p><h2>Events at a glance</h2></div><Link className="secondary" href="/chamber/events/new"><CalendarPlus size={16}/> Add event</Link></div>
        {events.length?events.map(e=>{const startsAt="starts_at" in e?e.starts_at:e.startsAt;const status="status" in e?String(e.status):"published";return <div className="event" key={e.id}><time><b>{new Date(startsAt).toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</b><strong>{new Date(startsAt).getDate()}</strong></time><span><b>{e.title}</b><small>{e.venue} · {status}</small></span>{isDemo?null:<StatusAction action={setEventStatus} id={e.id} status={status==="published"?"archived":"published"} label={status==="published"?"Archive":"Publish"}/>}</div>}):<p className="empty-copy">No events have been added yet.</p>}
      </section></div>
    <section className="panel activity"><div className="panel-heading"><div><p className="eyebrow">Business network</p><h2>Recently added businesses</h2></div><Link className="secondary" href="/chamber/businesses">View all businesses</Link></div>
      {businesses.slice(0,5).map(b=><div className="business-row" key={b.id}><div className="avatar">{b.name.split(" ").map((x:string)=>x[0]).join("").slice(0,2)}</div><b>{b.name}</b><span className="status">{"status" in b?String(b.status):"published"}</span><small>Business</small></div>)}
      {!businesses.length?<p className="empty-copy">Invite the first business to join this town.</p>:null}
    </section>
    <section className="panel activity" id="announcements"><div className="panel-heading"><div><p className="eyebrow">Town updates</p><h2>Announcements</h2></div><Link className="secondary" href="/chamber/announcements/new"><Megaphone size={16}/> New announcement</Link></div>
      {announcements.length?announcements.map(a=><div className="activity-row" key={a.id}><div className="activity-icon">!</div><span><b>{a.title}</b><small>{a.status} · starts {new Date(a.starts_at).toLocaleDateString()}</small></span>{isDemo?null:<StatusAction action={setAnnouncementStatus} id={a.id} status={a.status==="published"?"archived":"published"} label={a.status==="published"?"Archive":"Publish"}/>}</div>):<p className="empty-copy">Share the first update with your town.</p>}
    </section>
  </DashboardShell>
}
