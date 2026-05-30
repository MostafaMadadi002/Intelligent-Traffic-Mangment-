import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Github, Languages, Shield, Smartphone, Monitor, Globe } from 'lucide-react';
import { useLanguage } from '../locales/LanguageContext';

export default function Settings() {
  const { t, language, setLanguage, isRtl } = useLanguage();

  const developerInfo = {
    name: "Mostafa Madadi",
    email: "mostafamadadi.1382@gmail.com",
    phone: "+93784345123",
    github: "https://github.com/MostafaMadadi002"
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col gap-2 py-6 border-b border-white/10">
        <h2 className="text-3xl font-light text-white italic">
           {language === 'fa' ? 'پیکربندی ' : 'System '}
           <span className="font-bold not-italic text-cyan-400">
             {t('settingsTitle')}
           </span>
        </h2>
        <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">
          {language === 'fa' ? 'مدیریت ترجیحات و اطلاعات دسترسی' : 'Manage system preferences and access credentials'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Language Selection */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-24 h-24 bg-cyan-500/10 blur-3xl -mr-12 -mt-12 group-hover:bg-cyan-500/20 transition-colors`} />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Globe className="text-cyan-400" size={20} />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300">{t('language')}</h3>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${language === 'en' ? 'bg-cyan-500/10 border-cyan-500/40 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                  <span className="font-bold">English (US)</span>
                  {language === 'en' && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />}
                </button>
                <button 
                  onClick={() => setLanguage('fa')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${language === 'fa' ? 'bg-cyan-500/10 border-cyan-500/40 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                  <span className="font-bold font-farsi">Farsi (فارسی)</span>
                  {language === 'fa' && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-3xl p-8 border border-white/5 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="text-slate-500" size={20} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('theme')}</h3>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-slate-900 border border-white/10 rounded-xl" />
              <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Developer Info Card */}
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[2rem] p-8 md:p-12 border border-white/10 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12 pb-12 border-b border-white/5">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-cyan-400 shadow-2xl shrink-0">
                  <User size={48} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">{t('developer')}</span>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{developerInfo.name}</h3>
                  <p className="text-slate-500 text-sm font-medium tracking-wide">
                    {language === 'fa' ? 'مهندس نرم‌افزار و معمار سیستم' : 'Software Engineer & System Architect'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest pl-1">{language === 'fa' ? 'ایمیل' : 'Email'}</p>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.07] transition-all">
                    <Mail size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm font-mono text-slate-300 tracking-normal">{developerInfo.email}</span>
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest pl-1">{language === 'fa' ? 'تلفن تماس' : 'Phone'}</p>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.07] transition-all">
                    <Phone size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm font-mono text-slate-300 tracking-normal">{developerInfo.phone}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest pl-1">{language === 'fa' ? 'شناسه گیت‌هاب' : 'GitHub Repository'}</p>
                  <a 
                    href={developerInfo.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Github size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-sm font-mono text-slate-300 tracking-normal">MostafaMadadi002</span>
                    </div>
                    <Globe size={14} className="text-slate-600 group-hover:text-cyan-400" />
                  </a>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-4 p-6 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10">
                <Shield size={20} className="text-amber-500 shrink-0" />
                <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed italic">
                  {language === 'fa' 
                    ? 'دسترسی به این بخش محدود به تکنسین‌های تایید شده با پروتکل مدیریت گره است.'
                    : 'System access is restricted to verified technicians with Node Management Protocol privileges.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
