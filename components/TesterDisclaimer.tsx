
import React from 'react';
import { UITranslations } from '../types';

interface TesterDisclaimerProps {
  translations: UITranslations;
  onProceed: () => void;
}

const TesterDisclaimer: React.FC<TesterDisclaimerProps> = ({ translations: t, onProceed }) => {
  const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/1AUOtjKK5vU-J5fW1vRqCJ9KPEPA2eCbngGWLdRxPS8U/viewform";
  const INSTAGRAM_URL = "https://www.instagram.com/storia.land/";

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-purple-950 opacity-100"></div>
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full bg-zinc-900/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[4rem] text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-700 max-h-[95vh] overflow-y-auto">
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full group-hover:bg-indigo-500/40 transition-all duration-1000"></div>
          <div className="relative w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
            🏗️
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Tester Preview</h1>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter font-borel pt-2">
              Welcome to Storia
            </h2>
          </div>
          
          <div className="space-y-4 text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
            <p>
              This is an <span className="text-indigo-400 font-bold">early tester link</span> for the Storia platform. We are hard at work bringing full magic to every household.
            </p>
            
            <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-xs text-left space-y-3">
              <p className="font-bold text-zinc-300 uppercase tracking-widest text-[9px]">Unavailable Features:</p>
              <ul className="space-y-2 opacity-80">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                  Creating a permanent account
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                  Saving stories to a cloud library
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                  Signing up for paid subscriptions
                </li>
              </ul>
            </div>

            <div className="bg-indigo-600/10 p-5 rounded-3xl border border-indigo-500/20 text-xs">
              <p className="text-indigo-300 font-bold mb-2">Follow the Journey ✨</p>
              <p className="text-indigo-200/70 mb-4">
                Follow us on Instagram for updates, news, and behind-the-scenes magic.
              </p>
              <div className="flex flex-col gap-3">
                <a 
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.999 0h.001zm-.512 1.442c.859-.04 1.154-.047 3.333-.047 2.179 0 2.474.007 3.333.047.794.037 1.226.171 1.513.282.38.147.652.322.936.606.284.284.459.556.606.936.111.287.245.72.282 1.513.04.859.047 1.154.047 3.333 0 2.179-.007 2.474-.047 3.333-.037.794-.171 1.226-.282 1.513a2.389 2.389 0 0 1-.606.936 2.39 2.39 0 0 1-.936.606c-.287.111-.72.245-1.513.282-.859.04-1.154.047-3.333.047-2.179 0-2.474-.007-3.333-.047-.794-.037-1.226-.171-1.513-.282a2.389 2.389 0 0 1-.936-.606 2.389 2.389 0 0 1-.606-.936c-.111-.287-.245-.72-.282-1.513-.04-.859-.047-1.154-.047-3.333 0-2.179.007-2.474.047-3.333.037-.794.171-1.226.282-1.513.147-.38.322-.652.606-.936.284-.284.556-.459.936-.606.287-.111.72-.245 1.513-.282zM8 3.891a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334zm4.328-1.576a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92z"/>
                  </svg>
                  Follow us @storia.land
                </a>
                <a 
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 border-2 border-indigo-500/30 text-indigo-300 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-600/10 transition-all flex items-center justify-center gap-2 group"
                >
                  Please fill our Feedback Form
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onProceed}
          className="w-full py-5 bg-white text-black font-black text-lg rounded-3xl hover:bg-zinc-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
        >
          Enter the Magic ✨
        </button>

        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
          Build 0.9.4-beta • Internal Preview
        </p>
      </div>
    </div>
  );
};

export default TesterDisclaimer;
