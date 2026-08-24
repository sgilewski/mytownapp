import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function DashboardPageIntro({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:{href:string;label:string;icon?:LucideIcon}}){
  const Icon=action?.icon;
  return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{action?<Link className="secondary" href={action.href}>{Icon?<Icon size={16}/>:null}{action.label}</Link>:null}</div>;
}

export function EmptyState({title,description,action}:{title:string;description:string;action?:{href:string;label:string}}){
  return <div className="empty-state"><div className="empty-mark">m</div><h3>{title}</h3><p>{description}</p>{action?<Link className="primary" href={action.href}>{action.label}</Link>:null}</div>;
}

export function RolePill({role}:{role:string}){return <span className="status">{role.replaceAll("_"," ")}</span>}
