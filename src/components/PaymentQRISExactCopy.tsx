import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function PseudoQR({ size = 240, seed = 9137 }: { size?: number; seed?: number }) {
  const cell = 8, cols = Math.floor(size / cell), rows = cols; const cells: number[][] = [];
  for (let r = 0; r < rows; r++) { const row: number[] = []; for (let c = 0; c < cols; c++) { const v = (Math.sin((r*73+c*97+seed)*0.1337)+1)*0.5; row.push(v>0.53?1:0);} cells.push(row);} const q=4;
  for (let r=0;r<rows;r++){for(let c=0;c<cols;c++){if(r<q||c<q||r>=rows-q||c>=cols-q)cells[r][c]=0;}} function F(x:number,y:number){const s=7;for(let r=0;r<s;r++){for(let c=0;c<s;c++){const rr=y+r,cc=x+c;if(rr<0||cc<0||rr>=rows||cc>=cols)continue;const b=r===0||c===0||r===s-1||c===s-1;const cn=r>=2&&r<=4&&c>=2&&c<=4;cells[rr][cc]=b||cn?1:0;}}} F(q,q);F(cols-q-7,q);F(q,rows-q-7);
  const svgSize = cols*cell; const rects: JSX.Element[] = [];
  for (let r=0;r<rows;r++){for(let c=0;c<cols;c++){if(!cells[r][c])continue;rects.push(<rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} />)}} return (<svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} xmlns="http://www.w3.org/2000/svg" className="bg-white"><rect x="0" y="0" width={svgSize} height={svgSize} fill="white"/><g fill="black">{rects}</g></svg>);
}

function FlipCountdown({ seconds, onExpire }: { seconds: number; onExpire?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(()=>setLeft(seconds),[seconds]);
  useEffect(()=>{ if(left<=0){onExpire?.();return;} const t=setInterval(()=>setLeft(s=>s>0?s-1:0),1000); return ()=>clearInterval(t); },[left]);
  const hh = Math.floor(left/3600).toString().padStart(2,"0"), mm=Math.floor((left%3600)/60).toString().padStart(2,"0"), ss=Math.floor(left%60).toString().padStart(2,"0");
  const Unit=({value}:{value:string})=> (
    <div className="relative w-10 select-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={value} initial={{rotateX:90,opacity:0}} animate={{rotateX:0,opacity:1}} exit={{rotateX:-90,opacity:0}} transition={{type:"spring",stiffness:400,damping:28}} className="origin-bottom backface-hidden rounded-md px-1 text-center text-lg font-semibold tabular-nums">{value}</motion.div>
      </AnimatePresence>
    </div>
  );
  return <div className="flex items-center gap-1 text-slate-800"><Unit value={hh}/> : <Unit value={mm}/> : <Unit value={ss}/></div>;
}

function QRISCard({ merchantName, seed = 9137, label = "QRIS" }: { merchantName: string; seed?: number; label?: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const handleDownload = async () => {
    if (!qrRef.current) return; const svg = qrRef.current.querySelector("svg"); if (!svg) return;
    const serializer=new XMLSerializer(); const svgStr=serializer.serializeToString(svg); const svgBlob=new Blob([svgStr],{type:"image/svg+xml;charset=utf-8"});
    const url=URL.createObjectURL(svgBlob); const img=new Image(); img.onload=()=>{ const canvas=document.createElement("canvas"); canvas.width=img.width; canvas.height=img.height; const ctx=canvas.getContext("2d"); if(!ctx) return; ctx.fillStyle="#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); canvas.toBlob((blob)=>{ if(!blob) return; const pngUrl=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=pngUrl; a.download=`${label.toLowerCase()}.png`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(pngUrl); URL.revokeObjectURL(url);});}; img.onerror=()=>URL.revokeObjectURL(url); img.src=url;
  };
  return (
    <motion.div initial={{opacity:0,y:20,scale:0.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.45,ease:"easeOut"}} className="p-4 border border-slate-200 rounded-2xl shadow-sm bg-white">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="mx-auto max-w-[320px]">
          <div className="flex items-center justify-between text-slate-600 text-[11px] sm:text-xs"><span className="font-semibold tracking-wide">{label} <span className="font-normal">QR Code Standar Pembayaran Nasional</span></span><span className="font-semibold">GPN</span></div>
          <motion.div initial={{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1,duration:0.35}} className="mt-3 border-2 border-rose-200 rounded-xl overflow-hidden relative">
            <motion.div className="absolute -left-3 top-1/2 -translate-y-1/2 h-0 w-0 border-y-8 border-y-transparent border-r-8 border-r-rose-400" initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:0.25}}/>
            <motion.div className="absolute -right-3 bottom-2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-rose-400" initial={{opacity:0,x:6}} animate={{opacity:1,x:0}} transition={{delay:0.25}}/>
            <div className="bg-white px-5 pt-6 pb-4 text-center">
              <div className="text-slate-700 font-medium">{merchantName}</div>
              <div ref={qrRef} className="mt-3 flex items-center justify-center">
                <motion.div initial={{scale:0.94,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:260,damping:20}} className="bg-white p-2 rounded-lg shadow-inner">
                  <PseudoQR size={256} seed={seed}/>
                </motion.div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500">Dicetak oleh: <span className="font-medium">GoPay</span></div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={handleDownload} className="h-11 rounded-xl border border-slate-300 bg-white font-semibold hover:bg-slate-50 active:scale-[0.99] transition relative overflow-hidden">
          <span className="relative z-10">Download QRIS</span>
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition" style={{background:"radial-gradient(200px 200px at var(--x,50%) var(--y,50%), rgba(0,0,0,0.05), transparent 60%)"}} onMouseMove={(e)=>{const t=e.currentTarget as HTMLElement;const r=t.getBoundingClientRect();t.style.setProperty("--x",`${e.clientX-r.left}px`);t.style.setProperty("--y",`${e.clientY-r.top}px`);}}/>
        </button>
        <button onClick={()=>{const toast=document.createElement("div");toast.textContent="Checking payment status…";toast.className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow";document.body.appendChild(toast);setTimeout(()=>{toast.textContent="Belum masuk. Coba lagi nanti.";setTimeout(()=>toast.remove(),1400);},900);}} className="h-11 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-95 active:scale-[0.99] transition">Check status</button>
      </div>
    </motion.div>
  );
}

export default function PaymentQRISExactCopy(){
  const amount=53700, orderId="#7093-1760584309", merchantName="Evermos"; const [expired,setExpired]=useState(false); const initialSeconds=3*60*60;
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <motion.div initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.35}} className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 h-14"><button className="p-2 -ml-2 rounded-full hover:bg-slate-100" aria-label="Back" onClick={()=>history.back()}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button><div className="text-xl font-semibold">Gopay</div></div>
      </motion.div>
      <main className="max-w-md mx-auto px-4 pb-24">
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.35,delay:0.05}} className="mt-4 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-4 text-slate-800 font-semibold">PEMBAYARAN PHISING</div>
          <div className="p-5 space-y-1">
            <div className="flex items-center gap-2"><motion.div initial={{scale:0.96,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:280,damping:18}} className="text-3xl font-bold">{formatRupiah(amount)}</motion.div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
            <div className="text-sm text-slate-500 flex items-center gap-2"><span>Order ID {orderId}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M13 5l7 7-7 7M5 5h8v8H5z"/></svg></div>
            <div className="mt-3 relative"><div className="text-sm text-slate-700 flex items-center gap-2"><span className="font-medium">Pay within</span>{!expired?(<span className="font-semibold"><FlipCountdown seconds={initialSeconds} onExpire={()=>setExpiredTrue()}/></span>):(<span className="font-semibold text-red-600">Expired</span>)}</div><div className="mt-2 h-[2px] w-full overflow-hidden rounded bg-slate-100 relative"><div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"/></div><style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style></div>
          </div>
        </motion.div>
        <div className="mt-6 text-xl font-semibold">GoPay/GoPay Later</div>
        <div className="mt-3"><QRISCard merchantName={merchantName} seed={9137} label="QRIS"/></div>
        <div className="mt-6 text-center text-slate-400 font-semibold select-none">Leave this page</div>
      </main>
    </div>
  );
  function setExpiredTrue(){ setExpired(true); }
}
