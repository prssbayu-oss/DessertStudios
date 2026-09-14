import React, { useState } from 'react';
import { DOCS_DATA } from '../../data/docsData';
import { Search, BookOpen, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { DocItem } from '../../types';

interface DocsViewProps {
  onLoadSnippetInEditor?: (code: string) => void;
}

export const DocsView: React.FC<DocsViewProps> = () => {
  const [selectedId, setSelectedId] = useState<string>(DOCS_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['All', 'Core', 'Geometries', 'Materials', 'Lights', 'Cameras', 'Math', 'Controls'];

  const filteredDocs = DOCS_DATA.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeDoc = DOCS_DATA.find((d) => d.id === selectedId) || DOCS_DATA[0];

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="docs-container" className="flex h-[calc(100vh-64px)] bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <div id="docs-sidebar" className="w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">Three.js API Reference</h2>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="docs-search-input"
              type="text"
              placeholder="Search classes, methods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`docs-cat-${cat.toLowerCase()}`}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Documentation Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredDocs.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                id={`doc-item-${item.id}`}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{item.title}</span>
                <span className="text-[10px] text-slate-500 font-normal px-1.5 py-0.5 rounded bg-slate-800">
                  {item.category}
                </span>
              </button>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching Three.js API records found.
            </div>
          )}
        </div>
      </div>

      {/* Main Documentation Content (Right) */}
      <div id="docs-content" className="flex-1 overflow-y-auto p-8 max-w-4xl">
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              {activeDoc.category}
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{activeDoc.title}</h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeDoc.summary}</p>
          </div>
        </div>

        {/* Code Snippet Card */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Usage Example</span>
            </h3>
            <button
              id="docs-copy-snippet"
              onClick={() => handleCopyCode(activeDoc.codeSnippet)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed">
            <pre>{activeDoc.codeSnippet}</pre>
          </div>
        </div>

        {/* Constructor / Parameters Table */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Properties & Parameters
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <th className="py-2.5 px-4 font-semibold">Name</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeDoc.parameters.map((param) => (
                  <tr key={param.name} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-mono font-medium text-indigo-300">{param.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{param.type}</td>
                    <td className="py-2.5 px-4 text-slate-300">{param.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methods Table */}
        {activeDoc.methods && activeDoc.methods.length > 0 && (
          <div className="mt-8 mb-12">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Methods
            </h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                    <th className="py-2.5 px-4 font-semibold">Method Signature</th>
                    <th className="py-2.5 px-4 font-semibold">Returns</th>
                    <th className="py-2.5 px-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeDoc.methods.map((method) => (
                    <tr key={method.name} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-mono font-medium text-emerald-400">{method.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-400">{method.returns}</td>
                      <td className="py-2.5 px-4 text-slate-300">{method.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
