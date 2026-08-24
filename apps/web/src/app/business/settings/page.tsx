import { DashboardShell } from "@/components/dashboard";
import { DashboardPageIntro } from "@/components/dashboard-list";
import { getBusinessDashboard } from "@/lib/dashboard-data";

export default async function BusinessSettingsPage(){const data=await getBusinessDashboard();return <DashboardShell kind="business" active="settings" metrics={[]} workspaceName={data.workspaceName} userName={data.userName} title="Settings"><section className="panel"><DashboardPageIntro eyebrow="Workspace" title="Business account settings" description="Your public listing details are managed from the Businesses screen."/><dl className="settings-list"><div><dt>Workspace name</dt><dd>{data.workspaceName}</dd></div><div><dt>Signed in as</dt><dd>{data.userName}</dd></div><div><dt>Database status</dt><dd><span className="status">Connected</span></dd></div></dl></section></DashboardShell>}
