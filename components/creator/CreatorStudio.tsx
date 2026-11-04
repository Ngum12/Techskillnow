'use client';
import { useEffect, useState } from 'react';
import { emptyProject, type CreatorLabTask, type CreatorProject, type ProjectField } from '@/lib/creator/types';
import { exportGuide, launchPack } from '@/lib/creator/export';
import { useLesson } from '@/components/LessonContext';
import { PublishingRehearsal } from './PublishingRehearsal';

const STORAGE = 'tsn_creator_project_v1';
const fieldClass = 'mt-2 w-full rounded-xl border border-violet-200 bg-white p-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500';
const buttonClass = 'min-h-12 rounded-xl border border-violet-200 bg-white px-4 py-3 text-left text-sm font-semibold text-violet-950 transition hover:bg-violet-50 disabled:opacity-50';
function download(name: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CreatorStudio({task, passed, onPass}: {task: CreatorLabTask; passed: boolean; onPass: () => void}) {
  const { reportAttempt } = useLesson();
  const [project, setProject] = useState<CreatorProject>(emptyProject);
  const [loaded, setLoaded] = useState(false);
  const [storageNote, setStorageNote] = useState('');
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [issues, setIssues] = useState<string[]>([]);
  const [done, setDone] = useState(passed);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'violet' | 'amber' | 'slate'>('violet');
  const [fee, setFee] = useState(5);
  const [fixed, setFixed] = useState(0);
  const [cost, setCost] = useState(0);
  const [sales, setSales] = useState(3);
  const [rehearsed, setRehearsed] = useState(false);
  const [repair, setRepair] = useState('This method works in every oven and guarantees a perfect result. Mix well and bake until perfect.');
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      const p = {...emptyProject};
      for (const k of Object.keys(p) as ProjectField[]) if (typeof saved[k] === 'string') p[k] = saved[k].slice(0, 60000);
      setProject(p);
    } catch { setStorageNote('Could not restore this phone’s draft. Import a backup if you have one.'); }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE, JSON.stringify(project)); }
    catch { setStorageNote('Phone storage is unavailable. Download a project backup before leaving.'); }
  }, [project, loaded]);
  const update = (key: ProjectField, value: string) => { setProject(p => ({...p, [key]: value})); setIssues([]); };
  const prompt = `Act as a practical guide editor. My reader is ${project.audience || '[describe your reader]'}. Help them ${project.outcome || '[one achievable result]'}. My experience and constraints: ${project.experience || '[what I have actually tried; available tools and budget]'}. Create a short, actionable outline, then draft one section at a time. Include materials, numbered actions, checkpoints, common mistakes and troubleshooting. Use clear mobile-friendly language. Ask about missing details first. Do not invent measurements, evidence, testimonials or income claims. Mark facts I must verify. Outline: ${project.outline || '[add outline]'}.`;
  const earnings = (Number(project.price) || 0) * (1 - fee / 100) - fixed;
  function check() {
    const errors: string[] = [];
    for (const f of task.fields ?? []) {
      if (project[f.key].trim().length < f.min) errors.push(`${f.label}: add enough specific detail (${f.min} characters minimum).`);
      if (f.key === 'price' && (!/^\d+$/.test(project.price.trim()) || Number(project.price) < 100 || Number(project.price) > 1000000)) errors.push('Choose a whole-number price between 100 and 1,000,000 FCFA, using digits only.');
      if (f.key === 'storeUrl') {
        try {const u = new URL(project.storeUrl); if (u.protocol !== 'https:' || !(u.hostname === 'selar.com' || u.hostname.endsWith('.selar.com') || u.hostname === 'selar.co' || u.hostname.endsWith('.selar.co'))) errors.push('Enter your actual HTTPS Selar listing link.');}
        catch {errors.push('Paste your actual Selar product link, starting with https://.');}
      }
    }
    task.rounds?.forEach((r, i) => {if (!r.options[choices[i]]?.correct) errors.push(`Customer desk ${i + 1}: resolve the situation and read the feedback.`);});
    if (task.order && order.join('|') !== task.order.answer.join('|')) errors.push('Rebuild the sequence: prerequisites come before the action, and checks follow it.');
    task.checklist?.forEach((label,i) => {if (!checks[i]) errors.push(`Real-world task still pending: ${label}`);});
    if (task.stage === 'My storefront' && !rehearsed) errors.push('Complete the practice upload, checkout and file delivery journey.');
    if (task.stage === 'Instruction repair desk' && (repair.trim().split(/\s+/).length < 25 || /every oven|guarantees|until perfect|mix well/i.test(repair))) errors.push('Repair the practice instructions: remove unsupported guarantees and vague actions; describe equipment limits and observable checkpoints in at least 25 words.');
    if (task.stage === 'Assemble the guide' && project.outline.split(/\n/).filter(x=>x.trim()).length < 6) errors.push('Give your outline at least six separate section headings, one per line.');
    if (task.stage === 'Instruction repair desk' && project.draft.trim().split(/\s+/).length < 150) errors.push('Develop your own guide to at least 150 words so a reader has enough instructions to try.');
    setIssues(errors); reportAttempt(errors.length === 0, errors);
    if (!errors.length) {setDone(true); onPass();}
  }
  const allFields = Object.values(project).filter(v => v.trim()).length;
  return <section className="overflow-hidden rounded-3xl border border-violet-200 bg-[#faf7ff] shadow-sm">
    <div className="bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 p-5 text-white sm:p-7">
      <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Creator studio</span><span className="rounded-full border border-white/20 px-3 py-1 text-xs">{allFields}/13 project pieces</span></div>
      <h3 className="mt-3 text-2xl font-semibold">{task.stage}</h3><p className="mt-2 text-sm leading-relaxed text-violet-100">{task.instruction}</p>
      <div className="mt-5 flex gap-1" aria-label="Project progress">{Object.keys(emptyProject).map((k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${project[k as ProjectField] ? 'bg-amber-300' : 'bg-white/20'}`} />)}</div>
    </div>
    <div className="space-y-6 p-4 sm:p-6">
      <p className="text-xs leading-relaxed text-slate-600">Your project stays on this browser, on this phone. It does not sync between devices. Download backups, especially on a shared phone. Never enter passwords, PINs or identity documents here.</p>
      {storageNote && <p role="status" className="rounded-xl bg-amber-100 p-3 text-sm">{storageNote}</p>}
      {task.image && <img src={`/illustrations/${task.image}.webp`} alt="A scene from Merveille’s creator journey" width={1000} height={700} loading="lazy" className="max-h-64 w-full rounded-2xl object-cover" />}
      {task.tools && <div className="grid gap-3 sm:grid-cols-2">{task.tools.map(tool => <a key={tool.url} href={tool.url} target="_blank" rel="noopener noreferrer" className={buttonClass}><span className="block text-base">{tool.label} ↗</span><span className="mt-1 block text-xs font-normal leading-relaxed text-slate-600">{tool.why}</span></a>)}</div>}
      {task.rounds?.map((round, i) => <div key={i} className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
        <div className="border-b border-violet-100 bg-violet-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-700">{round.customer || 'Practice desk'} · {i+1}/{task.rounds!.length}</p><p className="mt-2 leading-relaxed">{round.scene}</p></div>
        <div className="space-y-2 p-3">{round.options.map((option,j) => <button key={j} type="button" aria-pressed={choices[i] === j} onClick={() => setChoices(c => ({...c,[i]:j}))} className={`${buttonClass} w-full ${choices[i] === j ? 'ring-2 ring-violet-500' : ''}`}>{option.text}</button>)}
        {choices[i] !== undefined && <p role="status" className={`rounded-xl p-3 text-sm leading-relaxed ${round.options[choices[i]].correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}>{round.options[choices[i]].feedback}</p>}</div>
      </div>)}
      {task.order && <div className="rounded-2xl border border-violet-200 bg-white p-4"><h4 className="font-semibold">Build the reader’s route</h4><p className="my-2 text-sm text-slate-600">Tap the cards in the order a beginner needs them. Tap an assembled card to remove it.</p><ol className="space-y-2">{order.map((id,i) => <li key={id}><button type="button" className={`${buttonClass} w-full bg-violet-50`} onClick={() => setOrder(v=>v.filter(x=>x!==id))}>{i+1}. {task.order!.items.find(x=>x.id===id)?.label}</button></li>)}</ol><div className="mt-3 flex flex-wrap gap-2">{task.order.items.filter(x=>!order.includes(x.id)).map(item=><button key={item.id} type="button" className={buttonClass} onClick={()=>setOrder(v=>[...v,item.id])}>{item.label} +</button>)}</div>{order.join('|')===task.order.answer.join('|') && <div className="mt-4 space-y-2 text-sm text-emerald-900">{order.map(id=><p key={id}>{task.order!.items.find(x=>x.id===id)?.why}</p>)}</div>}</div>}
      {task.stage === 'Instruction repair desk' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><label className="font-semibold">Repair this practice draft<textarea rows={5} value={repair} onChange={e=>setRepair(e.target.value)} className={fieldClass}/></label><p className="mt-2 text-sm leading-relaxed">Replace the universal promise and vague actions. Explain equipment limits, actions and what a reader should observe. Do not invent recipe measurements. The structure check spots obvious weaknesses; it cannot verify a recipe.</p></div>}
      {task.fields?.map(f => <label key={f.key} className="block font-semibold text-slate-900">{f.label}<span className="mt-1 block text-sm font-normal text-slate-600">{f.hint}</span><textarea rows={f.key === 'draft' ? 14 : f.key === 'title' || f.key === 'price' || f.key === 'storeUrl' ? 2 : 5} maxLength={60000} value={project[f.key]} disabled={!loaded} onChange={e=>update(f.key,e.target.value)} className={fieldClass} /></label>)}
      {task.stage === 'My storefront' && <PublishingRehearsal project={project} onComplete={()=>setRehearsed(true)} />}
      {(task.stage.includes('AI') || task.stage.includes('Prompt')) && <div className="rounded-2xl border border-violet-200 bg-white p-4"><h4 className="font-semibold">Your personal AI brief</h4><p className="my-3 whitespace-pre-wrap text-sm leading-relaxed">{prompt}</p><button type="button" className={buttonClass} onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setStorageNote('AI brief copied. Paste it into your AI tool; check its response yourself.');}catch{setStorageNote('Copy is unavailable. Select the brief above to copy manually.');}}}>Copy my prompt</button><p className="mt-2 text-xs text-slate-600">This builds a prompt from your project. It does not make a live AI request.</p></div>}
      {task.stage.includes('Price') && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h4 className="font-semibold">Profit sandbox · hypothetical fees</h4><p className="mt-2 text-sm">Replace these assumptions with your current Selar fees. Sales are scenarios, not a forecast.</p><div className="mt-4 grid grid-cols-2 gap-3">{[{label:'Fee (%)',value:fee,set:setFee,max:100},{label:'Fixed fee per sale (FCFA)',value:fixed,set:setFixed,max:100000},{label:'Launch costs (FCFA)',value:cost,set:setCost,max:1000000},{label:'Number of sales',value:sales,set:setSales,max:10000}].map(f=><label key={f.label} className="text-xs font-semibold">{f.label}<input type="number" min={0} max={f.max} value={f.value} onChange={e=>f.set(Math.min(f.max,Math.max(0,Number(e.target.value)||0)))} className={fieldClass}/></label>)}</div><p aria-live="polite" className="mt-4 text-xl font-bold text-violet-950">{Math.round(earnings*sales-cost).toLocaleString()} FCFA after assumed fees and costs</p><p className="mt-1 text-xs">Before tax and other expenses. With zero sales: {(-cost).toLocaleString()} FCFA.</p></div>}
      {task.checklist && <fieldset className="rounded-2xl border border-violet-200 bg-white p-4"><legend className="px-2 font-semibold">Do it outside the simulation</legend><p className="mb-3 text-xs text-slate-600">Tick only after completing each action. These are your declarations; TechSkillNow cannot verify external accounts or sales.</p>{task.checklist.map((label,i)=><label key={i} className="flex min-h-12 cursor-pointer items-start gap-3 py-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0 accent-violet-700" type="checkbox" checked={!!checks[i]} onChange={e=>setChecks(v=>({...v,[i]:e.target.checked}))}/>{label}</label>)}</fieldset>}
      <div className="rounded-2xl border border-violet-200 bg-white p-4"><button type="button" className="flex min-h-12 w-full items-center justify-between text-left font-semibold" aria-expanded={preview} onClick={()=>setPreview(v=>!v)}>My product · preview & downloads <span>{preview?'−':'+'}</span></button>{preview && <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2"><label className="text-xs">Reading size <input aria-label="Preview font size" type="range" min={12} max={22} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/></label><label className="text-xs">Cover colour <select value={theme} onChange={e=>setTheme(e.target.value as typeof theme)} className="ml-2 rounded border p-2"><option value="violet">Purple</option><option value="amber">Gold</option><option value="slate">Ink</option></select></label></div>
        <article className="mx-auto max-w-sm overflow-hidden rounded-xl border shadow-lg"><header className={`p-6 text-white ${theme==='amber'?'bg-amber-800':theme==='slate'?'bg-slate-900':'bg-violet-900'}`}><p className="text-xs uppercase tracking-[.18em]">A practical digital guide</p><h4 className="my-4 text-2xl font-bold break-words">{project.title||'Your guide starts here'}</h4><p className="text-sm">{project.outcome||'One reader. One useful result.'}</p></header><div style={{fontSize}} className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words bg-white p-5 leading-relaxed">{project.draft||'Your own instructions will appear here as you write.'}</div></article>
        <p className="text-xs text-slate-600">Preview controls help you assess readability. PDF export uses a simple purple layout with selectable text. Advanced layouts and photos can be added in Canva. Standard PDF fonts support English and French; review other scripts separately.</p>
        <div className="grid gap-2 sm:grid-cols-2"><button type="button" className={buttonClass} disabled={busy||!project.title.trim()||!project.draft.trim()} onClick={async()=>{setBusy(true);try{await exportGuide(project);}catch{setStorageNote('PDF export failed. Download your project backup and try again.');}finally{setBusy(false);}}}>{busy?'Preparing…':'Download my guide PDF'}</button><button type="button" className={buttonClass} onClick={()=>download('my-launch-pack.txt',launchPack(project))}>Download launch pack</button><button type="button" className={buttonClass} onClick={()=>download('my-product-backup.json',JSON.stringify(project,null,2),'application/json')}>Back up my project</button><label className={`${buttonClass} cursor-pointer`}>Restore project backup<input className="mt-2 block w-full text-xs" type="file" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0]; if(!file)return;try{if(file.size>1000000)throw new Error();const raw=JSON.parse(await file.text());const restored={...emptyProject};for(const key of Object.keys(restored) as ProjectField[]){if(typeof raw[key]!=='string')throw new Error();restored[key]=raw[key].slice(0,60000);}if(window.confirm('Replace this phone’s current project with this backup?'))setProject(restored);}catch{setStorageNote('This is not a valid TechSkillNow product backup. Your project has not changed.');}e.target.value='';}}/></label></div>
        <button type="button" className="min-h-12 text-sm text-red-700 underline" onClick={()=>{if(window.confirm('Delete this phone’s product draft? Download a backup first.')){setProject({...emptyProject});setStorageNote('Local product draft cleared.');}}}>Clear project from this phone</button>
      </div>}</div>
      {issues.length>0 && <div role="alert" className="rounded-xl bg-amber-100 p-4 text-sm"><p className="font-bold">Before you move on</p><ul className="mt-2 list-disc space-y-2 pl-5">{issues.map((issue,i)=><li key={i}>{issue}</li>)}</ul></div>}
      {done && <p role="status" className="rounded-xl bg-emerald-100 p-4 text-sm font-semibold text-emerald-950">✓ {task.success}</p>}
      <button type="button" className="btn btn-primary min-h-12 w-full" disabled={!loaded} onClick={check}>{done?'Check my work again':'Check my work & save this milestone'}</button>
    </div>
  </section>;
}
