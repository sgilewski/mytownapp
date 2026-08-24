import Link from "next/link";
import { Bell, CalendarDays, ChevronDown, Heart, LayoutDashboard, Megaphone, Settings, Store, Tag, TicketCheck, Users } from "lucide-react";
import type { DashboardMetric } from "@mytownapp/types";

const icons = { overview: LayoutDashboard, businesses: Store, offers: Tag, redemptions: TicketCheck, team: Users, events: CalendarDays, announcements: Megaphone, settings: Settings };
function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function DashboardShell({ kind, metrics, workspaceName, userName, children }: { kind: "business" | "chamber"; metrics: DashboardMetric[]; workspaceName?: string; userName?: string; children: React.ReactNode }) {
  const isBusiness = kind === "business";
  const resolvedWorkspaceName = workspaceName ?? (isBusiness ? "Birch & Main" : "Hillside Chamber");
  const resolvedUserName = userName ?? (isBusiness ? "Maya" : "Alex");
  const nav = isBusiness ? ["overview", "businesses", "offers", "redemptions", "team", "settings"] : ["overview", "businesses", "events", "announcements", "team", "settings"];
  return <div className="shell"><aside><Link className="wordmark" href="/">mytown<span>app</span></Link><div className="workspace"><div className="avatar">{initials(resolvedWorkspaceName)}</div><span><b>{resolvedWorkspaceName}</b><small>{isBusiness ? "Business account" : "Chamber workspace"}</small></span><ChevronDown size={16}/></div><nav>{nav.map((item, index) => { const Icon = icons[item as keyof typeof icons]; return <a className={index === 0 ? "active" : ""} href={`#${item}`} key={item}><Icon size={18}/>{item[0].toUpperCase()+item.slice(1)}</a>})}</nav><div className="support"><Heart size={19}/><b>Need a hand?</b><p>We’re here to help your local community thrive.</p><button>Contact support</button></div></aside><main className="dashboard"><header><div><p className="eyebrow">{isBusiness ? "Business dashboard" : "Chamber dashboard"}</p><h1>Welcome, <em>{resolvedUserName}.</em></h1></div><div className="header-actions"><button className="icon-button" aria-label="Notifications"><Bell size={20}/></button><div className="avatar">{initials(resolvedUserName)}</div></div></header><section className="metric-grid">{metrics.map((metric)=><article className="metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small className={metric.trend}>↗ {metric.change}</small></article>)}</section>{children}</main></div>;
}
