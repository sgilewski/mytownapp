import { DashboardShell } from "@/components/dashboard";
import { DashboardPageIntro } from "@/components/dashboard-list";
import { getChamberDashboard } from "@/lib/dashboard-data";

export default async function ChamberSettingsPage(){const data=await getChamberDashboard();return <DashboardShell kind="chamber" active="settings" metrics={[]} workspaceName={data.workspaceName} userName={data.userName} title="Settings"><section className="panel"><DashboardPageIntro eyebrow="Workspace" title="Chamber settings" description="A single mytownapp brand serves every town while each chamber manages its own community data."/><dl className="settings-list"><div><dt>Workspace name</dt><dd>{data.workspaceName}</dd></div><div><dt>Chambers available</dt><dd>{data.chambers.length}</dd></div><div><dt>Database status</dt><dd><span className="status">Connected</span></dd></div></dl></section></DashboardShell>}
