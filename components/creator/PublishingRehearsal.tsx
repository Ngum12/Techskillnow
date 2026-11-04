'use client';
import { useEffect, useState } from 'react';
import type { CreatorProject } from '@/lib/creator/types';

/** A deliberately labelled practice checkout. Never calls a payment service. */
export function PublishingRehearsal({project, onComplete}: {project: CreatorProject; onComplete: () => void}) {
 const [file, setFile] = useState<{name:string;size:number;url:string}|null>(null);
 const [step,setStep] = useState(0);
 const [method,setMethod] = useState('');
 const [message,setMessage] = useState('');
 const [outcome,setOutcome] = useState<'pending'|'failed'|'confirmed'>('pending');
 const [delivered,setDelivered] = useState(false);
 useEffect(()=>()=>{if(file)URL.revokeObjectURL(file.url);},[file]);
 const button='min-h-12 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-950 hover:bg-violet-50';
 const stages=['Upload','Storefront','Checkout','Delivery'];
 return <div className="overflow-hidden rounded-2xl border border-violet-200 bg-white">
  <header className="bg-slate-950 p-4 text-white"><span className="rounded-full bg-amber-300 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-950">Practice only · no money moves</span><h4 className="mt-3 text-lg font-semibold">Walk through your buyer’s journey</h4><p className="mt-1 text-xs leading-relaxed text-slate-300">A training storefront, not Selar’s actual interface. Payment methods below are examples; confirm availability in your real account.</p></header>
  <ol className="grid grid-cols-4 gap-1 border-b p-3 text-center text-[10px] sm:text-xs">{stages.map((s,i)=><li key={s} aria-current={i===step?'step':undefined} className={`rounded-lg px-1 py-2 ${i===step?'bg-violet-100 font-bold text-violet-950':'text-slate-500'}`}>{i+1}. {s}</li>)}</ol>
  <div className="space-y-4 p-4">
  {step===0 && <><label className="block text-sm font-semibold">Select your real final PDF<input type="file" accept="application/pdf,.pdf" className="mt-3 block w-full text-sm" onChange={async e=>{
    setMessage('');const selected=e.target.files?.[0];if(!selected)return;
    if(selected.size>20000000){setMessage('For this mobile exercise, use a PDF under 20 MB. Compress large images and export again.');return;}
    const signature=new TextDecoder().decode(await selected.slice(0,5).arrayBuffer());
    if(signature!=='%PDF-'){setMessage('This file does not have a PDF signature. Export a real PDF rather than renaming a file.');return;}
    setFile({name:selected.name,size:selected.size,url:URL.createObjectURL(selected)});setDelivered(false);
   }}/></label><p className="text-xs text-slate-600">Your file stays in this browser session. It is not uploaded to TechSkillNow or Selar. The check confirms format and size, not accuracy or completeness.</p>{file&&<p className="rounded-lg bg-emerald-50 p-3 text-sm">✓ {file.name} · {(file.size/1000000).toFixed(2)} MB</p>}<button type="button" disabled={!file} className={`${button} disabled:opacity-50`} onClick={()=>setStep(1)}>Preview my offer →</button></>}
  {step===1 && <><div className="rounded-xl bg-violet-950 p-5 text-white"><p className="text-xs uppercase tracking-widest text-amber-300">Digital download · PDF</p><h5 className="mt-3 text-xl font-bold">{project.title||'Your practical guide'}</h5><p className="mt-2 text-sm text-violet-100">{project.outcome}</p><p className="mt-4 text-2xl font-bold">{Number(project.price||0).toLocaleString()} FCFA</p></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{project.description||'Write your listing description above so your buyer knows exactly what is included.'}</p><button type="button" className={button} disabled={!project.title.trim()||Number(project.price)<=0||!project.description.trim()} onClick={()=>setStep(2)}>Continue as a practice buyer →</button></>}
  {step===2 && <><p className="text-sm">Choose an example route. No phone number, PIN or real payment is required.</p><div className="grid gap-2">{['MTN MoMo (example)','Orange Money (example)','Card (example)'].map(m=><button type="button" key={m} aria-pressed={method===m} className={`${button} ${method===m?'ring-2 ring-violet-500':''}`} onClick={()=>setMethod(m)}>{m}</button>)}</div><button type="button" className={`${button} w-full bg-violet-50`} disabled={!method} onClick={()=>{setStep(3);setOutcome('pending');}}>Place practice order →</button></>}
  {step===3 && <><div aria-live="polite" className={`rounded-xl p-4 ${outcome==='confirmed'?'bg-emerald-50':'bg-amber-50'}`}><p className="font-bold">{outcome==='pending'?'Payment pending':outcome==='failed'?'Payment failed':'Practice payment confirmed'}</p><p className="mt-2 text-sm">{outcome==='confirmed'?'The simulated official order is confirmed. You can now check delivery.':outcome==='failed'?'No confirmed sale. Help the buyer retry through the official checkout; never ask for a PIN.':'A buyer screenshot does not confirm receipt. Check the platform order status before granting access.'}</p></div><div className="grid gap-2"><button type="button" className={button} onClick={()=>{setOutcome('failed');setMessage('Failed payments are not completed sales. Let the buyer retry using the official process.');}}>Explore a failed payment</button><button type="button" className={button} onClick={()=>{setOutcome('confirmed');setMessage('Confirmed in this practice order only. Nothing was charged.');}}>Simulate platform confirmation</button><button type="button" className={button} disabled={outcome!=='confirmed'||!file} onClick={()=>{setDelivered(true);setMessage('Delivery unlocked after confirmation. Open the file below and inspect the reader experience.');}}>Unlock practice delivery</button></div>{delivered&&file&&<><a href={file.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-emerald-100 p-4 text-center text-sm font-bold text-emerald-950">Open the delivered PDF ↗</a><button type="button" className={`${button} w-full`} onClick={()=>{onComplete();setMessage('Buyer journey completed. You must still check your real Selar listing and delivery separately.');}}>I opened it and checked the correct file</button></>}</>}
  {message&&<p role="status" className="rounded-lg bg-slate-100 p-3 text-sm leading-relaxed">{message}</p>}
  {step>0&&<button type="button" onClick={()=>setStep(s=>s-1)} className="min-h-12 text-sm text-violet-800 underline">← Back to {stages[step-1]}</button>}
  </div>
 </div>;
}
