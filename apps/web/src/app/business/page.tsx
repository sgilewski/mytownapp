import Link from "next/link";
import { Plus } from "lucide-react";
import { setOfferStatus } from "@/app/actions/resources";
import { DashboardShell } from "@/components/dashboard";
import { StatusAction } from "@/components/status-action";
import { getBusinessDashboard } from "@/lib/dashboard-data";

export default async function BusinessDashboard(){
  const {metrics,businesses,offers,isDemo,workspaceName,userName}=await getBusinessDashboard();
  return <DashboardShell kind="business" metrics={metrics} workspaceName={workspaceName} userName={userName}>
    <section className="panel activity"><div className="panel-heading"><div><p className="eyebrow">Your businesses</p><h2>{isDemo?"A clear view of local momentum":"Workspace listings"}</h2></div><Link className="secondary" href="/business/offers/new"><Plus size={16}/> New offer</Link></div>
      {businesses.length?businesses.map(b=><div className="business-row" key={b.id}><div className="avatar">{b.name.split(" ").map((x:string)=>x[0]).join("").slice(0,2)}</div><b>{b.name}</b><span className="status">{"status" in b?String(b.status):"published"}</span><small>{"category" in b?String(b.category):""}</small><Link className="text-action" href={`/business/businesses/${b.id}/edit`}>Edit profile</Link></div>):<p className="empty-copy">No businesses are connected to this account yet.</p>}
    </section>
    <section className="panel activity"><div className="panel-heading"><div><p className="eyebrow">Offers</p><h2>Scheduled and active</h2></div></div>
      {offers.length?offers.map(o=><div className="activity-row" key={o.id}><div className="activity-icon">%</div><span><b>{o.title}</b><small>{o.status}</small></span>{isDemo?<strong>Preview</strong>:<StatusAction action={setOfferStatus} id={o.id} status={o.status==="published"?"archived":"published"} label={o.status==="published"?"Archive":"Publish"}/>}</div>):<p className="empty-copy">Create the first offer for this workspace.</p>}
    </section>
  </DashboardShell>
}
