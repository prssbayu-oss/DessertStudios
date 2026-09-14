/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppMode } from './types';
import { Navbar } from './components/Navbar';
import { EditorView } from './components/Editor/EditorView';
import { ShowcaseView } from './components/Showcase/ShowcaseView';
import { PlaygroundView } from './components/Playground/PlaygroundView';
import { DocsView } from './components/Docs/DocsView';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('editor');

  return (
    <div id="dessert-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Main Navigation */}
      <Navbar currentMode={currentMode} onSelectMode={setCurrentMode} />

      {/* Main Mode View */}
      <main className="flex-1 relative overflow-hidden">
        {currentMode === 'editor' && <EditorView />}
        {currentMode === 'showcase' && <ShowcaseView />}
        {currentMode === 'playground' && <PlaygroundView />}
        {currentMode === 'docs' && <DocsView />}
      </main>
    </div>
  );
}

