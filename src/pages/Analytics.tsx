import { useEffect, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Download, Calendar, TrendingUp, Clock, AlertCircle, BrainCircuit } from 'lucide-react';
import api from '../lib/api';
import PredictiveTrendChart from '../components/PredictiveTrendChart';
import { useLanguage } from '../locales/LanguageContext';

export default function Analytics() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('volume');

  useEffect(() => {
    let isMounted = true;
    api.get('/analytics')
      .then(res => {
        if (isMounted) setData(res.data || []);
      })
      .catch(err => {
        console.warn('[Analytics] Data fetch failed:', err);
        // Fallback mock data
        setData(Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 800) + 100 })));
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-white/10">
        <div>
          <h2 className="text-3xl font-light text-white italic">
            {language === 'fa' ? 'بینش‌های ' : 'Historical '}
            <span className="font-bold not-italic text-cyan-400">
              {language === 'fa' ? 'عصبی تاریخی' : 'Neural Insights'}
            </span>
          </h2>
          <p className="text-slate-500 text-sm">
            {language === 'fa' ? 'تری‌متری ترافیک طولی و مدل‌سازی پیش‌گویانه تراکم.' : 'Longitudinal traffic telemetry and predictive congestion modelling.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 glass text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-xl">
            <Calendar size={16} />
            {language === 'fa' ? '۱ خرداد ۱۴۰۵' : 'May 22, 2026'}
          </button>
          <a href="/api/reports/daily" download className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Download size={16} />
            {t('exportReport')}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: language === 'fa' ? 'اوج سیستم' : 'System Peak', value: '18:00', sub: language === 'fa' ? 'بازه ۲۴ ساعته' : '24HR Window', icon: Clock, color: 'cyan' },
          { label: language === 'fa' ? 'تغییر جریان' : 'Flow Delta', value: '+12.4%', sub: language === 'fa' ? 'میانگین هفتگی' : 'Weekly Avg', icon: TrendingUp, color: 'emerald' },
          { label: language === 'fa' ? 'میانگین تاخیر' : 'Mean Latency', value: '12m', sub: language === 'fa' ? 'ترانزیت شهری' : 'City Transit', icon: AlertCircle, color: 'amber' }
        ].map((item, i) => (
          <div key={item.label} className="glass p-6 rounded-3xl hover:bg-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-2.5 bg-${item.color}-500/10 rounded-xl text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white font-mono tracking-normal">{item.value}</p>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-10 relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.05),transparent_70%)]" />
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {language === 'fa' ? 'حجم کل ترانزیت' : 'Total Transit Volume'}
            </h3>
            <p className="text-sm text-slate-500">
              {language === 'fa' ? 'مجموع تردد وسایل نقلیه از طریق حسگرهای تله‌متری' : 'Aggregate vehicle throughput via telemetry sensors'}
            </p>
          </div>
          <div className="glass-dark p-1 rounded-xl flex gap-1 border border-white/10">
            {[
              { id: 'volume', label: language === 'fa' ? 'حجم' : 'Volume' },
              { id: 'density', label: language === 'fa' ? 'تراکم' : 'Density' },
              { id: 'load', label: language === 'fa' ? 'بار' : 'Load' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                  activeTab === tab.id ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.isArray(data) ? data : []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                tickFormatter={(val) => `${val}:00`}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8 border border-white/5">
          <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] mb-8 font-mono">
            {language === 'fa' ? 'واریانس بار در لحظه' : 'Real-time Load Variance'}
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(Array.isArray(data) ? data : []).slice(8, 16)}>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} hide />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                    {(Array.isArray(data) ? data : []).slice(8, 16).map((entry, index) => entry && (
                      <Cell key={`cell-${index}`} fill={(entry.count || 0) > 500 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(6, 182, 212, 0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-8 flex gap-6 text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" /> {language === 'fa' ? 'جریان عادی' : 'Normal Flow'}</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> {language === 'fa' ? 'اشباع بالا' : 'High Saturation'}</div>
          </div>
        </div>

        <div className="glass-dark rounded-3xl p-8 text-white relative flex flex-col justify-between border border-white/5 overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mt-32 -mr-32 group-hover:bg-indigo-500/10 transition-all" />
           <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <BrainCircuit className="text-indigo-400" size={24} />
                  {language === 'fa' ? 'مدل‌سازی پیش‌گویانه' : 'Predictive Modelling'}
                </h3>
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {language === 'fa' ? 'هوش مصنوعی فعال' : 'AI Active'}
                </span>
              </div>
              <PredictiveTrendChart />
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                {language === 'fa' 
                  ? 'برآورد آماری ۲۴ ساعت آینده نشان‌دهنده ۱۵٪ افزایش بار در کریدور ترانزیت جنوبی است. ماتریکس‌های سیگنال تطبیقی از پیش آماده شده‌اند.'
                  : 'Next 24H Statistical projection indicates a 15% load surge in the southern transit corridor. Adaptive signal matrices have been pre-staged.'}
              </p>
           </div>
           <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 glass" />)}
                <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-lg tracking-normal">+4</div>
              </div>
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">
                {language === 'fa' ? 'همگام‌سازی عصبی فعال' : 'Neural Sync Enabled'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
