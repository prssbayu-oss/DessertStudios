import React from 'react';
import * as DESSERT from '../dessert/Dessert.js';
import { Box, Layers, Code2, BookOpen, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { AppMode } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, onSelectMode }) => {
  return (
    <header
      id="main-navbar"
      className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-5 flex items-center justify-between z-20 shrink-0 text-slate-100"
    >
      {/* Brand & DESSERT Engine Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-950/50">
          {/* DESSERT Polygonal Wireframe Icon */}
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 22h20L12 2z" />
            <path d="M12 2v20" />
            <path d="M2 22l10-10" />
            <path d="M22 22L12 12" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white uppercase tracking-wider">DESSERT 3D ENGINE</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v{DESSERT.REVISION} CLONE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-normal">
            Full Control Cloned Engine &bull; Zero External Dependencies
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <nav id="navbar-mode-nav" className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          id="nav-tab-editor"
          onClick={() => onSelectMode('editor')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === 'editor'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Scene Editor</span>
        </button>

        <button
          id="nav-tab-showcase"
          onClick={() => onSelectMode('showcase')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === 'showcase'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Examples Showcase</span>
        </button>

        <button
          id="nav-tab-playground"
          onClick={() => onSelectMode('playground')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === 'playground'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Shader Sandbox</span>
        </button>

        <button
          id="nav-tab-docs"
          onClick={() => onSelectMode('docs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === 'docs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>API Reference</span>
        </button>
      </nav>

      {/* Offline Status Badge */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tanpa Eksternal (100% Offline)</span>
        </div>
      </div>
    </header>
  );
};
