import React, { useState } from 'react';
import { AppTab } from './types';
import { SimulationLab } from './components/SimulationLab';
import { AILab } from './components/AILab';
import { Shield, Activity, Cpu, Box, BookOpen, Layers, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return (
          <div className="space-y-8 animate-fade-in">
            <header className="text-center py-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-quantum-400 to-matrix-500 bg-clip-text text-transparent mb-4">
                Quaternionic Key Exchange
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Exploring non-commutative algebraic structures for post-quantum cryptographic security.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-quantum-500 transition-colors">
                <Shield className="w-8 h-8 text-quantum-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Quantum Resistance</h3>
                <p className="text-slate-400 text-sm">
                  Traditional ECDH relies on abelian groups vulnerable to Shor's algorithm. Quaternions form a non-commutative ring, potentially evading these quantum attacks.
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-quantum-500 transition-colors">
                <Layers className="w-8 h-8 text-matrix-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">The Math</h3>
                <p className="text-slate-400 text-sm">
                  Based on the Quaternion Conjugacy Search Problem (QCSP): Given $G$ and $T = AGA^{-1}$, finding $A$ is computationally hard over finite fields.
                </p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-quantum-500 transition-colors">
                <Box className="w-8 h-8 text-pink-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Implementation</h3>
                <p className="text-slate-400 text-sm">
                  Simulate the protocol over $Z_p$, visualize the 4D rotations in 3D space, and analyze performance metrics against classical schemes.
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setActiveTab(AppTab.SIMULATION)}
                className="bg-quantum-600 hover:bg-quantum-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-quantum-500/25 transition-all flex items-center gap-2"
              >
                Start Simulation <Activity size={20} />
              </button>
            </div>
          </div>
        );
      case AppTab.SIMULATION:
        return <SimulationLab />;
      case AppTab.AI_LAB:
        return <AILab />;
      default:
        return <div className="text-white">Not Implemented</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-quantum-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-quantum-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">Q</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-100">Q-Shield</span>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <NavButton 
                  active={activeTab === AppTab.DASHBOARD} 
                  onClick={() => setActiveTab(AppTab.DASHBOARD)}
                  icon={<BookOpen size={16} />}
                  label="Overview"
                />
                <NavButton 
                  active={activeTab === AppTab.SIMULATION} 
                  onClick={() => setActiveTab(AppTab.SIMULATION)}
                  icon={<Cpu size={16} />}
                  label="Protocol Simulator"
                />
                <NavButton 
                  active={activeTab === AppTab.AI_LAB} 
                  onClick={() => setActiveTab(AppTab.AI_LAB)}
                  icon={<Bot size={16} />}
                  label="AI Research Lab"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active 
        ? 'bg-quantum-900/50 text-quantum-400 border border-quantum-500/30' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;