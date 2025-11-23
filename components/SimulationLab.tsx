import React, { useState, useEffect } from 'react';
import { Quaternion, SimulationState } from '../types';
import * as QMath from '../utils/quaternionMath';
import { Visualizer3D } from './Visualizer3D';
import { Calculator, Lock, Unlock, RefreshCw, ArrowRightLeft, ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL_STATE: SimulationState = {
  modulus: 13, // Small prime for demo
  baseP: { w: 1, x: 2, y: 3, z: 4 },
  aliceSecret: { w: 2, x: 1, y: 0, z: 1 },
  bobSecret: { w: 1, x: 3, y: 1, z: 0 },
  alicePublic: null,
  bobPublic: null,
  sharedSecretA: null,
  sharedSecretB: null
};

export const SimulationLab: React.FC = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [log, setLog] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const generateKeys = () => {
    const mod = state.modulus;
    const base = QMath.randomQuaternion(mod);
    
    // Ensure secrets are invertible for conjugation
    let aliceSec = QMath.randomQuaternion(mod);
    while (!QMath.invQ(aliceSec, mod)) aliceSec = QMath.randomQuaternion(mod);
    
    let bobSec = QMath.randomQuaternion(mod);
    while (!QMath.invQ(bobSec, mod)) bobSec = QMath.randomQuaternion(mod);

    setState(prev => ({
      ...prev,
      baseP: base,
      aliceSecret: aliceSec,
      bobSecret: bobSec,
      alicePublic: null,
      bobPublic: null,
      sharedSecretA: null,
      sharedSecretB: null
    }));
    addLog("Generated new parameters and private keys.");
  };

  const performExchange = () => {
    const { baseP, aliceSecret, bobSecret, modulus } = state;
    
    // Calculate Public Values: T = S * G * S^-1
    const aliceInv = QMath.invQ(aliceSecret, modulus);
    const bobInv = QMath.invQ(bobSecret, modulus);

    if (!aliceInv || !bobInv) {
      addLog("Error: Generated non-invertible secrets. Regenerating...");
      generateKeys();
      return;
    }

    // Alice sends T_A = A G A^-1
    const alicePub = QMath.mulQ(QMath.mulQ(aliceSecret, baseP, modulus), aliceInv, modulus);
    
    // Bob sends T_B = B G B^-1
    const bobPub = QMath.mulQ(QMath.mulQ(bobSecret, baseP, modulus), bobInv, modulus);

    setState(prev => ({
      ...prev,
      alicePublic: alicePub,
      bobPublic: bobPub
    }));
    addLog("Public values computed and exchanged via Conjugation.");
  };

  const computeSharedSecret = () => {
    // Note: Standard conjugation A G A^-1 doesn't directly key exchange like Diffie Hellman.
    // This is a demonstration of the COMPUTATIONAL HARDNESS (finding A given T_A and G).
    // In a real protocol like Anshel-Anshel-Goldfeld, they exchange commutators.
    // For this simulation, we will verify the Commutativity of the Transport if they knew each other's secrets, 
    // OR we simulate a successful shared derivation if the protocol was complete.
    // 
    // Let's simulate a simplified agreement:
    // Shared = A * T_B * A^-1 = A (B G B^-1) A^-1 = (AB) G (AB)^-1
    // Shared = B * T_A * B^-1 = B (A G A^-1) B^-1 = (BA) G (BA)^-1
    // Since AB != BA (Non-commutative), these are DIFFERENT.
    // This highlights the challenge!
    
    const { aliceSecret, bobSecret, alicePublic, bobPublic, modulus } = state;
    if (!alicePublic || !bobPublic) return;

    const aliceInv = QMath.invQ(aliceSecret, modulus);
    const bobInv = QMath.invQ(bobSecret, modulus);

    if(!aliceInv || !bobInv) return;

    // Alice computes K_A using Bob's public
    const kA = QMath.mulQ(QMath.mulQ(aliceSecret, bobPublic, modulus), aliceInv, modulus);
    
    // Bob computes K_B using Alice's public
    const kB = QMath.mulQ(QMath.mulQ(bobSecret, alicePublic, modulus), bobInv, modulus);

    setState(prev => ({
      ...prev,
      sharedSecretA: kA,
      sharedSecretB: kB
    }));
    addLog("Shared values computed.");
    addLog(`Check: Are they equal? ${JSON.stringify(kA) === JSON.stringify(kB) ? "YES" : "NO (Expected for non-commutative)"}`);
  };

  // Check equality
  const secretsMatch = state.sharedSecretA && state.sharedSecretB && 
    state.sharedSecretA.w === state.sharedSecretB.w &&
    state.sharedSecretA.x === state.sharedSecretB.x &&
    state.sharedSecretA.y === state.sharedSecretB.y &&
    state.sharedSecretA.z === state.sharedSecretB.z;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-quantum-100 flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-quantum-500" />
          Protocol Parameters
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Modulus (Finite Ring Size)</label>
            <select 
              value={state.modulus}
              onChange={(e) => setState({...state, modulus: parseInt(e.target.value)})}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
            >
              <option value="13">13 (Toy)</option>
              <option value="251">251 (Small)</option>
              <option value="1009">1009 (Medium)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Public Base (G)</div>
            <div className="font-mono text-quantum-500">{QMath.formatQ(state.baseP)}</div>
          </div>

          <button 
            onClick={generateKeys}
            className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate Secrets
          </button>
        </div>

        {/* Protocol Explanation */}
        <div className="mt-6 border-t border-slate-700 pt-4">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors group"
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <Info className="w-4 h-4 text-quantum-500 group-hover:text-quantum-400" />
              Protocol Explanation
            </span>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showExplanation && (
            <div className="mt-3 text-xs text-slate-400 space-y-3 bg-slate-900/50 p-3 rounded border border-slate-700/50">
              <div>
                <strong className="text-quantum-400 block mb-1">Core Problem (QCSP)</strong>
                <p>
                  Recovering a secret quaternion $S$ from a public base $G$ and transformed value $T = S G S^{-1}$ is the <strong>Conjugacy Search Problem</strong>. It is computationally infeasible in large non-commutative rings.
                </p>
              </div>

              <div>
                <strong className="text-purple-400 block mb-1">vs. Diffie-Hellman (DLP)</strong>
                <p>
                   DH relies on $g^a = y$ (Discrete Log). Quantum computers (via Shor's algorithm) can solve DLP efficiently because the group is commutative. QCSP resists this because quaternions are <strong>non-commutative</strong> ($ij \neq ji$).
                </p>
              </div>

              <div>
                <strong className="text-amber-400 block mb-1">The Trade-off</strong>
                <p>
                  Non-commutativity protects against quantum attacks but breaks the simple agreement {'$g^{ab} = g^{ba}$'}. See the "Result Analysis" below to observe this mismatch in action.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-slate-700 pt-6">
          <h3 className="font-bold text-quantum-100 mb-4">Actions</h3>
          <div className="space-y-3">
             <button 
                onClick={performExchange}
                disabled={!!state.alicePublic}
                className="w-full py-3 px-4 bg-quantum-600 hover:bg-quantum-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Exchange Public Values
              </button>
             
              <button 
                onClick={computeSharedSecret}
                disabled={!state.alicePublic || !!state.sharedSecretA}
                className="w-full py-3 px-4 bg-matrix-900 hover:bg-matrix-500 border border-matrix-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Derive Shared Secret
              </button>
          </div>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Network Diagram */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start mb-6">
             <div className="text-center w-1/3">
                <div className="w-12 h-12 bg-pink-900/50 rounded-full flex items-center justify-center mx-auto mb-2 border border-pink-500 text-pink-500 font-bold text-xl">A</div>
                <h3 className="font-bold text-slate-200">Alice</h3>
                <div className="text-xs text-slate-500 mt-1">Secret A</div>
                <div className="font-mono text-xs text-pink-400 mt-1 bg-black/20 p-1 rounded">
                  {QMath.formatQ(state.aliceSecret)}
                </div>
             </div>
             
             <div className="flex-1 px-4 flex flex-col items-center justify-center pt-4">
                <div className="w-full h-px bg-slate-600 relative">
                  {state.alicePublic && (
                     <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 bg-slate-900 px-2 text-xs text-slate-400">
                        P_A →
                     </div>
                  )}
                  {state.bobPublic && (
                     <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 bg-slate-900 px-2 text-xs text-slate-400">
                        ← P_B
                     </div>
                  )}
                </div>
             </div>

             <div className="text-center w-1/3">
                <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500 text-blue-500 font-bold text-xl">B</div>
                <h3 className="font-bold text-slate-200">Bob</h3>
                <div className="text-xs text-slate-500 mt-1">Secret B</div>
                <div className="font-mono text-xs text-blue-400 mt-1 bg-black/20 p-1 rounded">
                  {QMath.formatQ(state.bobSecret)}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Public Value (Alice)</h4>
                {state.alicePublic ? (
                   <div className="font-mono text-sm text-green-400 break-all">{QMath.formatQ(state.alicePublic)}</div>
                ) : <span className="text-slate-600 text-sm">Waiting...</span>}
             </div>
             <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Public Value (Bob)</h4>
                {state.bobPublic ? (
                   <div className="font-mono text-sm text-green-400 break-all">{QMath.formatQ(state.bobPublic)}</div>
                ) : <span className="text-slate-600 text-sm">Waiting...</span>}
             </div>
          </div>

           {/* Results Section */}
           {state.sharedSecretA && state.sharedSecretB && (
            <div className={`mt-6 p-4 rounded-lg border ${secretsMatch ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-sm font-semibold text-slate-300">Result Analysis</h4>
                 <div className={`px-3 py-1 rounded-full text-xs font-bold border ${secretsMatch ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-red-500/20 text-red-400 border-red-500'}`}>
                    {secretsMatch ? "SECRETS MATCH" : "MISMATCH (Non-Commutative)"}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 <div className="bg-slate-900/80 p-3 rounded border border-slate-700">
                    <span className="text-xs text-pink-400 font-bold block mb-1">Alice's Shared Secret</span>
                    <div className="text-xs text-slate-500 mb-1">Calculated: A · P_B · A⁻¹</div>
                    <code className="text-sm text-white font-mono block break-all">{QMath.formatQ(state.sharedSecretA)}</code>
                 </div>

                 {/* Inequality Indicator */}
                 <div className="hidden md:flex justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${secretsMatch ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                       {secretsMatch ? "=" : "≠"}
                    </div>
                 </div>

                 <div className="bg-slate-900/80 p-3 rounded border border-slate-700">
                    <span className="text-xs text-blue-400 font-bold block mb-1">Bob's Shared Secret</span>
                    <div className="text-xs text-slate-500 mb-1">Calculated: B · P_A · B⁻¹</div>
                    <code className="text-sm text-white font-mono block break-all">{QMath.formatQ(state.sharedSecretB)}</code>
                 </div>
              </div>
              
              <div className="mt-4 flex items-start gap-3 bg-slate-900 p-3 rounded border border-slate-800">
                 <AlertTriangle className={`w-5 h-5 shrink-0 ${secretsMatch ? 'text-emerald-500' : 'text-amber-500'}`} />
                 <p className="text-xs text-slate-400 leading-relaxed">
                    {!secretsMatch ? (
                       <>
                         <strong>Why did this fail?</strong> This demonstrates the fundamental property of non-commutativity in Quaternions. 
                         Unlike classical Diffie-Hellman where {"$g^{ab} = g^{ba}$"}, in quaternion algebra $A(BGB^{-1})A^{-1} \neq B(AGA^{-1})B^{-1}$. 
                         This property is exactly what protects against quantum attacks like Shor's algorithm, but it necessitates more complex protocols (like Anshel-Anshel-Goldfeld) to establish agreement.
                       </>
                    ) : (
                       "Secrets match! (This is statistically rare with random inputs in this scheme unless commutativity was forced)."
                    )}
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Visualizer Embed */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase">3D Geometric Interpretation (Real space)</h3>
          <p className="text-xs text-slate-500 mb-4">
            {state.sharedSecretA ? "Visualizing the divergence between Alice and Bob's computed secrets." : "Visualizing the rotation of the base vector G by Alice's secret A (normalized to unit sphere)."}
          </p>
          <Visualizer3D 
            base={state.baseP} 
            transformed={state.alicePublic || undefined}
            sharedA={state.sharedSecretA || undefined}
            sharedB={state.sharedSecretB || undefined}
          />
        </div>

      </div>

       {/* Log Panel */}
       <div className="col-span-1 lg:col-span-3 bg-black/30 p-4 rounded-lg font-mono text-xs max-h-40 overflow-y-auto border border-slate-800">
          {log.map((l, i) => (
            <div key={i} className="text-slate-400 mb-1">{l}</div>
          ))}
       </div>
    </div>
  );
};