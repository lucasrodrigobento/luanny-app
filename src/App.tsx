import React, { useState } from 'react';
import { Configuracoes } from './components/views/Configuracoes';
import { SincronizarNFes } from './components/views/SincronizarNFes';
import { CogIcon } from './components/icons/CogIcon';
import { SyncIcon } from './components/icons/SyncIcon';
import { useConfigManager } from './hooks/useConfigManager';

type View = 'sync' | 'config';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('sync');
  const configManager = useConfigManager();

  const navItemClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors";
  const activeClasses = "bg-sky-600 text-white";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-sky-400">UAU-SEFAZ Sync</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentView('sync')}
                className={`${navItemClasses} ${currentView === 'sync' ? activeClasses : inactiveClasses}`}
              >
                <SyncIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Sincronizar NF-es</span>
              </button>
              <button 
                onClick={() => setCurrentView('config')}
                className={`${navItemClasses} ${currentView === 'config' ? activeClasses : inactiveClasses}`}
              >
                <CogIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Configurações</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'sync' && <SincronizarNFes empresas={configManager.empresas} loadingEmpresas={configManager.loading} />}
        {currentView === 'config' && <Configuracoes configManager={configManager} />}
      </main>
    </div>
  );
};

export default App;