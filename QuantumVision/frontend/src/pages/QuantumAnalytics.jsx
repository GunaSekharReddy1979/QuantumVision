import React from 'react';
import { 
  Cpu, 
  Network, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Database,
  Binary,
  Code
} from 'lucide-react';

export default function QuantumAnalytics() {
  const quantumMetrics = {
    vqc: {
      name: 'Variational Quantum Classifier (VQC)',
      qubits: 4,
      parameters: 24,
      accuracy: '97.33%',
      f1: '0.9048',
      auc: '0.9850',
      status: 'SIMULATION',
      layers: 2
    },
    qnn: {
      name: 'Quantum Neural Network (QNN)',
      qubits: 4,
      parameters: 16,
      accuracy: '57.33%',
      f1: '0.3118',
      auc: '0.6261',
      status: 'SIMULATION',
      layers: 2
    },
    classical_rf: {
      name: 'Random Forest (Classical Baseline)',
      accuracy: '99.67%',
      f1: '0.9867',
      auc: '1.0000',
      status: 'VALIDATED'
    },
    classical_xgb: {
      name: 'XGBoost (Classical SOTA)',
      accuracy: '99.67%',
      f1: '0.9867',
      auc: '1.0000',
      status: 'VALIDATED'
    }
  };

  return (
    <div className="flex flex-col space-y-4 text-white pb-6">
      {/* Title */}
      <div className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu size={18} className="text-indigo-400" />
            <h2 className="text-xs font-mono font-bold tracking-widest text-indigo-200 uppercase">
              Quantum Machine Learning
            </h2>
          </div>
          <span className="text-[9px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
            PENNYLANE 0.45
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Variational quantum circuit classification for flood inundation risk prediction evaluated on Srikakulam test observations.
        </p>
      </div>

      {/* Academic Disclosure Alert */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-lg flex items-start space-x-2.5">
        <AlertTriangle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-mono font-bold text-indigo-200 uppercase tracking-wider">
            Academic Simulation Protocol
          </h4>
          <p className="text-[10px] text-indigo-200/80 leading-relaxed">
            All quantum circuits execute on PennyLane's <code className="text-cyan-300 font-mono">default.qubit</code> statevector simulator. Classical models (XGBoost 99.67%) remain superior in speed and accuracy. No physical quantum supremacy is claimed.
          </p>
        </div>
      </div>

      {/* Classical vs Quantum Comparison Table */}
      <div className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
            Empirical Evaluation Benchmark (N=300)
          </h3>
          <span className="text-[9px] font-mono text-slate-400">Identical Test Split</span>
        </div>

        <div className="space-y-2">
          {/* Classical XGBoost */}
          <div className="bg-slate-900/70 p-2.5 rounded border border-emerald-500/30 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-300">{quantumMetrics.classical_xgb.name}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {quantumMetrics.classical_xgb.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-300">
              <div>Acc: <strong className="text-white">{quantumMetrics.classical_xgb.accuracy}</strong></div>
              <div>F1: <strong className="text-white">{quantumMetrics.classical_xgb.f1}</strong></div>
              <div>ROC-AUC: <strong className="text-white">{quantumMetrics.classical_xgb.auc}</strong></div>
            </div>
          </div>

          {/* Quantum VQC */}
          <div className="bg-slate-900/70 p-2.5 rounded border border-indigo-500/40 space-y-1 shadow-[0_0_10px_rgba(99,102,241,0.15)]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-300">{quantumMetrics.vqc.name}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {quantumMetrics.vqc.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-300">
              <div>Acc: <strong className="text-cyan-300">{quantumMetrics.vqc.accuracy}</strong></div>
              <div>F1: <strong className="text-cyan-300">{quantumMetrics.vqc.f1}</strong></div>
              <div>ROC-AUC: <strong className="text-cyan-300">{quantumMetrics.vqc.auc}</strong></div>
            </div>
            <div className="text-[9px] font-mono text-slate-400 pt-0.5">
              4 Qubits | 24 Variational Parameters | AngleEmbedding
            </div>
          </div>

          {/* Quantum QNN */}
          <div className="bg-slate-900/70 p-2.5 rounded border border-white/5 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">{quantumMetrics.qnn.name}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {quantumMetrics.qnn.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-400">
              <div>Acc: {quantumMetrics.qnn.accuracy}</div>
              <div>F1: {quantumMetrics.qnn.f1}</div>
              <div>ROC-AUC: {quantumMetrics.qnn.auc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Architecture Specifications */}
      <div className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-cyan-500/30 space-y-3">
        <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-2">
          <Binary size={15} className="text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-cyan-200 uppercase">
            VQC Ansatz Architecture
          </h3>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="bg-slate-900/80 p-2.5 rounded border border-white/5 space-y-1">
            <span className="text-[10px] text-cyan-400 block uppercase">1. Feature Encoding</span>
            <p className="text-[11px] text-slate-300">
              <code className="text-cyan-200">AngleEmbedding(wires=[0,1,2,3], rotation='Y')</code>
            </p>
            <p className="text-[10px] text-slate-400">
              Maps normalized SAR backscatter, SAR temporal diff, elevation, and rainfall into rotational qubit states.
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded border border-white/5 space-y-1">
            <span className="text-[10px] text-indigo-400 block uppercase">2. Entangling Layers</span>
            <p className="text-[11px] text-slate-300">
              <code className="text-indigo-200">StronglyEntanglingLayers(weights, wires=[0,1,2,3])</code>
            </p>
            <p className="text-[10px] text-slate-400">
              Rotations followed by cyclical CNOT entanglers generating multi-qubit superposition.
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded border border-white/5 space-y-1">
            <span className="text-[10px] text-emerald-400 block uppercase">3. Measurement Operator</span>
            <p className="text-[11px] text-slate-300">
              <code className="text-emerald-200">qml.expval(qml.PauliZ(0))</code>
            </p>
            <p className="text-[10px] text-slate-400">
              Expectation value of Pauli-Z on wire 0 mapped through sigmoid activation to flood probability [0, 1].
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
