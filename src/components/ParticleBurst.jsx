import React, { useEffect, useMemo } from 'react';

const DIRS = ['n','ne','e','se','s','sw','w','nw'];
const COLORS = ['#818cf8','#a78bfa','#34d399','#f472b6','#fbbf24'];

export default function ParticleBurst({ x, y, onDone }) {
  const particles = useMemo(() => Array.from({length:14}, (_,i) => ({
    id:i, dir:DIRS[i%8], dist:40+Math.random()*60, size:4+Math.random()*8,
    color:COLORS[i%5], delay:Math.random()*0.1,
  })), []);
  useEffect(() => { const t = setTimeout(onDone, 800); return () => clearTimeout(t); }, [onDone]);

  return (
    <div className="fixed z-[999] pointer-events-none" style={{left:x,top:y,transform:'translate(-50%,-50%)'}}>
      {particles.map(p => (
        <span key={p.id} className="absolute rounded-full"
          style={{
            width:p.size, height:p.size, background:p.color,
            animationName:'pop-'+p.dir,
            animationDuration:'0.7s',
            animationTimingFunction:'cubic-bezier(0.16,1,0.3,1)',
            animationFillMode:'forwards',
            animationDelay:p.delay+'s',
            '--d': p.dist+'px',
          }} />
      ))}
    </div>
  );
}
