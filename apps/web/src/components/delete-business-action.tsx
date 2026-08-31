"use client";

export function DeleteBusinessAction({action,id,name}:{action:(formData:FormData)=>void|Promise<void>;id:string;name:string}){
  return <form action={action} onSubmit={event=>{if(!window.confirm(`Delete ${name}? This permanently removes the business and its related offers.`))event.preventDefault()}}>
    <input type="hidden" name="id" value={id}/>
    <button className="text-action danger" type="submit" aria-label={`Delete ${name}`}>Delete</button>
  </form>;
}
