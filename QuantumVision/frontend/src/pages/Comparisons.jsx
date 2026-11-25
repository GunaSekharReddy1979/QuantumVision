import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ShieldCheck,
  Cpu,
  GitFork,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line
} from 'recharts';
import KpiCard from '../components/common/KpiCard';
import { fetchRainfallModelEvaluation } from '../services/rainfallApi';
import { formatDateTimeIST } from '../utils/formatters';

export default function Comparisons() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [modelEval, setModelEval] = useState(null);
  const [statusTimestamp, setStatusTimestamp] = useState(() => formatDateTimeIST(new Date()));

  useEffect(() => {
    fetchRainfallModelEvaluation()
      .then((res) => {
        if (res?.data) {
          setModelEval(res.data);
          setStatusTimestamp(formatDateTimeIST(new Date()));
        }
      })
      .catch((err) => console.warn('Benchmark evaluation fetch notice:', err));
  }, []);

  // Empirical classification benchmark comparison data from held-out test evaluation
  const benchmarkData = [
    {
      metric: 'Accuracy',
      xgboost: 99.67,
      random_forest: 99.67,
      vqc: 91.67,
      qnn: 56.33
    },
    {
      metric: 'Precision',
      xgboost: 100.0,
      random_forest: 100.0,
      vqc: 62.75,
      qnn: 19.21
    },
    {
      metric: 'Recall',
      xgboost: 97.37,
      random_forest: 97.37,
      vqc: 84.21,
      qnn: 76.32
    },
    {
      metric: 'F1-Score',
      xgboost: 98.67,
      random_forest: 98.67,
      vqc: 71.91,
      qnn: 30.69
    },
    {
      metric: 'ROC-AUC',
      xgboost: 100.0,
      random_forest: 100.0,
      vqc: 97.59,
      qnn: 61.07
    }
  ];

  // Routing QUBO vs Dijkstra optimization data matching WhatsApp Image 2026-10-31 at 19.33.34.jpeg
  const routingOptimizationData = [
    {
      name: 'Classical Dijkstra',
      energy: 18.4,
      hazardExposure: 82.5
    },
    {
      name: 'Simulated Annealing QUBO',
      energy: 14.82,
      hazardExposure: 35.0
    }
  ];

  return (
    <div className="w-full max-w-[1480px] mx-auto flex flex-col gap-4 pb-8 font-sans">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-2xs border border-[#BFDBFE] mt-0.5">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ANALYTICS &bull; MODEL EVALUATION
            </div>
            <h1 className="text-xl sm:text-[22px] font-bold text-[#0F265C] tracking-tight">
              Classical ML vs. Quantum Model Benchmarks
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
              Empirical comparison between classical tree ensembles (XGBoost, Random Forest) and 4-qubit simulated quantum variational circuits (PennyLane VQC, QNN) on Srikakulam hazard data.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="h-[36px] px-3.5 rounded-lg bg-white border border-[#DCE6F5] text-slate-700 hover:text-[#2563EB] hover:border-[#BFDBFE] font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
        >
          <ArrowLeft size={14} />
          <span>Back to dashboard</span>
        </button>
      </div>

      {/* 2. STATUS BANNER */}
      <div className="bg-white border border-[#DCE6F5] rounded-[14px] px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-[0_1px_3px_rgba(15,38,92,0.04)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
          <span>Showing verified benchmark fallback values; live model evaluation is unavailable.</span>
        </div>
      </div>

      {/* 3. FOUR SUMMARY METRIC CARDS (Matches WhatsApp Image 2026-10-31 at 19.33.37.jpeg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={ShieldCheck}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
          title="Best Classical Model"
          value="XGBoost Classifier"
          description="Accuracy 99.67% · ROC-AUC 1.0000"
          tooltipText="Trained on held-out test records"
        />
        <KpiCard
          icon={Cpu}
          iconBg="bg-[#F5F3FF]"
          iconColor="text-[#7C3AED]"
          title="Best Quantum Model"
          value="PennyLane VQC · 4 Qubits"
          description="Accuracy 91.67% · ROC-AUC 0.9759"
          tooltipText="AngleEmbedding + StronglyEntanglingLayers"
        />
        <KpiCard
          icon={GitFork}
          iconBg="bg-[#ECFDF5]"
          iconColor="text-[#10B981]"
          title="QUBO Route Energy"
          value="19.46% lower energy"
          description="14.82 QUBO vs 18.40 Dijkstra"
          tooltipText="Calculated over 171,080 Srikakulam road segments"
        />
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-[#FFF7ED]"
          iconColor="text-[#EA580C]"
          title="Regression Winner"
          value="XGBoost · 24h Rainfall"
          description="RMSE 8.654 mm vs 10.806 mm baseline"
          tooltipText="Continuous 24-hour rainfall forecasting model"
        />
      </div>

      {/* 4. NAVIGATION TABS */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-xl p-1 flex items-center gap-1 text-xs font-semibold self-start shadow-2xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Models
        </button>
        <button
          onClick={() => setActiveTab('classical')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'classical'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Classical ML
        </button>
        <button
          onClick={() => setActiveTab('quantum')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'quantum'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quantum ML
        </button>
        <button
          onClick={() => setActiveTab('routing')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'routing'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Routing &amp; Regression
        </button>
      </div>

      {/* 5. CLASSIFICATION BENCHMARK CHART CARD */}
      <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all flex flex-col gap-3">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-1">
          <h2 className="text-[14px] font-semibold text-[#0F265C]">
            Classification benchmark
          </h2>
          <p className="text-[11.5px] text-slate-400 mt-0.5">
            Test-set scores (%) &bull; ROC-AUC scaled to 100
          </p>
        </div>

        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#DCE6F5',
                  borderRadius: '8px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(15,38,92,0.06)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="xgboost" name="XGBoost (Classical)" fill="#2563EB" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="random_forest" name="Random Forest" fill="#8B5CF6" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="vqc" name="PennyLane VQC (4 Qubits)" fill="#A855F7" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="qnn" name="PennyLane QNN" fill="#06B6D4" radius={[3, 3, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. CLASSIFICATION ERROR PROFILE (CONFUSION MATRICES - Matches WhatsApp Image 2026-10-31 at 19.33.34.jpeg) */}
      <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all flex flex-col gap-3">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-1">
          <h2 className="text-[14px] font-semibold text-[#0F265C]">
            Classification error profile
          </h2>
          <p className="text-[11.5px] text-slate-400 mt-0.5">
            Confusion matrices on the same 300-sample test split
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
          {/* Matrix 1: XGBoost */}
          <div className="border border-[#DCE6F5] rounded-xl p-4 flex flex-col gap-2.5 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
              <span className="text-xs font-bold text-slate-800">XGBoost Classifier</span>
            </div>
            <span className="text-[11px] text-slate-400">300 test samples &bull; actual vs predicted</span>

            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-1">
              <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#A7F3D0]">
                <div className="text-[10px] uppercase font-bold text-emerald-800">TN</div>
                <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">262</div>
                <div className="text-[10px] text-emerald-700">True Negative</div>
              </div>
              <div className="p-3 bg-[#FEF3C7] rounded-lg border border-[#FDE68A]">
                <div className="text-[10px] uppercase font-bold text-amber-800">FP</div>
                <div className="text-xl font-bold font-mono text-amber-950 mt-0.5">0</div>
                <div className="text-[10px] text-amber-700">False Positive</div>
              </div>
              <div className="p-3 bg-[#FFE4E6] rounded-lg border border-[#FECDD3]">
                <div className="text-[10px] uppercase font-bold text-rose-800">FN</div>
                <div className="text-xl font-bold font-mono text-rose-950 mt-0.5">1</div>
                <div className="text-[10px] text-rose-700">False Negative</div>
              </div>
              <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#A7F3D0]">
                <div className="text-[10px] uppercase font-bold text-emerald-800">TP</div>
                <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">37</div>
                <div className="text-[10px] text-emerald-700">True Positive</div>
              </div>
            </div>
          </div>

          {/* Matrix 2: PennyLane VQC */}
          <div className="border border-[#DCE6F5] rounded-xl p-4 flex flex-col gap-2.5 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span>
              <span className="text-xs font-bold text-slate-800">PennyLane VQC &bull; 4 Qubits</span>
            </div>
            <span className="text-[11px] text-slate-400">300 test samples &bull; actual vs predicted</span>

            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-1">
              <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#A7F3D0]">
                <div className="text-[10px] uppercase font-bold text-emerald-800">TN</div>
                <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">243</div>
                <div className="text-[10px] text-emerald-700">True Negative</div>
              </div>
              <div className="p-3 bg-[#FEF3C7] rounded-lg border border-[#FDE68A]">
                <div className="text-[10px] uppercase font-bold text-amber-800">FP</div>
                <div className="text-xl font-bold font-mono text-amber-950 mt-0.5">19</div>
                <div className="text-[10px] text-amber-700">False Positive</div>
              </div>
              <div className="p-3 bg-[#FFE4E6] rounded-lg border border-[#FECDD3]">
                <div className="text-[10px] uppercase font-bold text-rose-800">FN</div>
                <div className="text-xl font-bold font-mono text-rose-950 mt-0.5">6</div>
                <div className="text-[10px] text-rose-700">False Negative</div>
              </div>
              <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#A7F3D0]">
                <div className="text-[10px] uppercase font-bold text-emerald-800">TP</div>
                <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">32</div>
                <div className="text-[10px] text-emerald-700">True Positive</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. EVACUATION PATH OPTIMIZATION (QUBO VS DIJKSTRA) */}
      <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all flex flex-col gap-3">
        <div className="border-b border-[#F1F5F9] pb-2.5 mb-1">
          <h2 className="text-[14px] font-semibold text-[#0F265C]">
            Evacuation path optimization
          </h2>
          <p className="text-[11.5px] text-slate-400 mt-0.5">
            Path energy and relative flood-hazard exposure
          </p>
        </div>

        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={routingOptimizationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis yAxisId="left" domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} label={{ value: 'Path energy', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748B' } }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 10, fill: '#EA580C' }} axisLine={false} tickLine={false} label={{ value: 'Relative hazard exposure index', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#EA580C' } }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#DCE6F5',
                  borderRadius: '8px',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(15,38,92,0.06)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="left" dataKey="energy" name="Path energy" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={42} />
              <Line yAxisId="right" type="monotone" dataKey="hazardExposure" name="Relative hazard exposure (illustrative)" stroke="#EA580C" strokeWidth={2.5} dot={{ r: 4, fill: '#FFFFFF', stroke: '#EA580C', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 mt-2">
          Simulated Annealing QUBO reduces path hazard exposure energy by <strong>19.46%</strong> over standard Dijkstra routing by incorporating predicted inundation risk matrices into the edge penalty formulation.
        </div>
      </div>
    </div>
  );
}
