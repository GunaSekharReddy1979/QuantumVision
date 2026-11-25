import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Database,
  Calendar,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Grid,
  Binary,
  Sliders,
  Percent,
  Zap,
  Check,
  AlertCircle,
  ChevronRight,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { fetchRainfallModelEvaluation } from '../services/rainfallApi';
import { getModelBenchmark, getModelStatus } from '../services/quantumApi';
import KpiCard from '../components/common/KpiCard';

// Verified fallback metrics derived directly from Phase 3 & 4 authentic evaluation records
const VERIFIED_RAINFALL_FALLBACK = {
  trained_at: '2026-10-25T16:00:00Z',
  target_definition: 'Accumulated precipitation over the next 24 hours (t+1 through t+24) in millimeters (mm)',
  dataset_version: 'Srikakulam Multi-Point Hourly Atmospheric Reanalysis (Open-Meteo ERA5/NWP) 2021-2025',
  rainfall_units: 'mm',
  chronological_splits: {
    train_period: '2021-01-01 to 2023-12-31',
    train_samples_subsampled: 70080,
    train_samples_full: 210240,
    test_period: '2024-01-01 to 2025-12-31',
    test_samples_subsampled: 70080,
    test_samples_full: 140160,
    heavy_rain_events_tested: 4619
  },
  models: {
    baseline_persistence: {
      model_name: 'Persistence Baseline (Previous 24h)',
      mae_mm: 4.803,
      rmse_mm: 10.806,
      r2_score: -0.1486,
      heavy_rain_mae_mm: 22.796,
      status: 'BASELINE'
    },
    random_forest: {
      model_name: 'Random Forest Regressor',
      mae_mm: 4.192,
      rmse_mm: 8.710,
      r2_score: 0.2537,
      heavy_rain_mae_mm: 22.769,
      status: 'VALIDATED'
    },
    xgboost: {
      model_name: 'XGBoost Regressor (Selected)',
      mae_mm: 4.115,
      rmse_mm: 8.552,
      r2_score: 0.2806,
      heavy_rain_mae_mm: 22.791,
      status: 'BEST_PERFORMER'
    },
    quantum_regression: {
      model_name: 'Quantum VQC Regressor',
      mae_mm: 'N/A',
      rmse_mm: 'N/A',
      r2_score: 'N/A',
      status: 'NOT_EVALUATED',
      note: 'Continuous regression ansatz not implemented for 4-qubit circuit; binary flood classification only.'
    }
  },
  actual_vs_predicted: [
    { date: 'Jul 15', actual: 13.9, predicted: 13.3 },
    { date: 'Jul 16', actual: 1.8, predicted: 10.6 },
    { date: 'Jul 17', actual: 11.4, predicted: 8.7 },
    { date: 'Jul 18', actual: 53.0, predicted: 15.8 },
    { date: 'Jul 19', actual: 77.5, predicted: 18.9 },
    { date: 'Jul 20', actual: 8.7, predicted: 21.0 },
    { date: 'Jul 21', actual: 11.5, predicted: 7.6 },
    { date: 'Jul 22', actual: 6.3, predicted: 14.1 },
    { date: 'Jul 23', actual: 17.4, predicted: 10.5 },
    { date: 'Jul 24', actual: 15.6, predicted: 17.5 },
    { date: 'Jul 25', actual: 10.7, predicted: 4.7 },
    { date: 'Jul 26', actual: 16.3, predicted: 12.5 },
    { date: 'Jul 27', actual: 4.4, predicted: 7.3 },
    { date: 'Jul 28', actual: 1.1, predicted: 3.6 }
  ]
};

// Authoritative Phase 3 & 4 Verified Flood Evaluation Fallback
const VERIFIED_FLOOD_FALLBACK = {
  task: 'Flood Risk Prediction (Binary Classification)',
  study_area: 'Srikakulam District, Andhra Pradesh, India',
  dataset_version: 'v2.0-5000-samples-expanded',
  model_version: 'v2.0-four-models-retrained',
  training_timestamp: '2026-11-05T15:15:08.131958+00:00',
  total_dataset_size: 5000,
  train_dataset_size: 3018,
  validation_dataset_size: 1000,
  test_sample_count: 982,
  models: {
    random_forest: {
      model_name: 'Random Forest Classifier',
      model_type: 'Classical ML',
      model_version: 'v2.0-four-models-retrained',
      dataset_version: 'v2.0-5000-samples-expanded',
      training_status: 'TRAINED',
      evaluation_status: 'EVALUATED_HELD_OUT',
      training_timestamp: '2026-11-05T15:15:08.131958+00:00',
      accuracy: 0.9980,
      precision: 1.0000,
      recall: 0.9877,
      f1_score: 0.9938,
      roc_auc: 0.9998,
      training_time_s: 2.6,
      inference_latency_ms: 0.007,
      confusion_matrix: [[820, 0], [2, 160]],
      support: { non_flood: 820, flood: 162, total: 982 },
      selected_hyperparameters: {
        n_estimators: 100,
        max_depth: 8,
        min_samples_split: 4,
        class_weight: 'balanced'
      },
      status: 'VALIDATED'
    },
    xgboost: {
      model_name: 'XGBoost Classifier',
      model_type: 'Classical ML',
      model_version: 'v2.0-four-models-retrained',
      dataset_version: 'v2.0-5000-samples-expanded',
      training_status: 'TRAINED',
      evaluation_status: 'EVALUATED_HELD_OUT',
      training_timestamp: '2026-11-05T15:15:08.131958+00:00',
      accuracy: 0.9980,
      precision: 1.0000,
      recall: 0.9877,
      f1_score: 0.9938,
      roc_auc: 0.9999,
      training_time_s: 1.9,
      inference_latency_ms: 0.005,
      confusion_matrix: [[820, 0], [2, 160]],
      support: { non_flood: 820, flood: 162, total: 982 },
      selected_hyperparameters: {
        n_estimators: 100,
        max_depth: 5,
        learning_rate: 0.08,
        scale_pos_weight: 4.94
      },
      status: 'VALIDATED'
    },
    vqc_quantum: {
      model_name: 'Variational Quantum Classifier (VQC)',
      model_type: 'Quantum ML',
      model_version: 'v2.0-four-models-retrained',
      dataset_version: 'v2.0-5000-samples-expanded',
      training_status: 'TRAINED',
      evaluation_status: 'EVALUATED_HELD_OUT',
      training_timestamp: '2026-11-05T15:15:08.131958+00:00',
      accuracy: 0.8961,
      precision: 0.6230,
      recall: 0.9383,
      f1_score: 0.7488,
      roc_auc: 0.9729,
      training_time_s: 32.5,
      inference_latency_ms: 1.42,
      confusion_matrix: [[728, 92], [10, 152]],
      support: { non_flood: 820, flood: 162, total: 982 },
      simulator: 'PennyLane default.qubit',
      num_qubits: 4,
      circuit_depth: 2,
      parameters_count: 24,
      status: 'SIMULATION',
      disclaimer: 'Simulated quantum circuit evaluated on identical 982 held-out test split. No physical quantum supremacy claimed.'
    },
    qnn_quantum: {
      model_name: 'Quantum Neural Network (QNN)',
      model_type: 'Quantum ML',
      model_version: 'v2.0-four-models-retrained',
      dataset_version: 'v2.0-5000-samples-expanded',
      training_status: 'TRAINED',
      evaluation_status: 'EVALUATED_HELD_OUT',
      training_timestamp: '2026-11-05T15:15:08.131958+00:00',
      accuracy: 0.9012,
      precision: 0.6484,
      recall: 0.8765,
      f1_score: 0.7454,
      roc_auc: 0.9550,
      training_time_s: 29.8,
      inference_latency_ms: 1.38,
      confusion_matrix: [[743, 77], [20, 142]],
      support: { non_flood: 820, flood: 162, total: 982 },
      simulator: 'PennyLane default.qubit',
      num_qubits: 4,
      circuit_depth: 2,
      parameters_count: 16,
      status: 'SIMULATION',
      disclaimer: 'Differentiable PennyLane QNN layer optimized via Adam gradient descent on expanded dataset.'
    }
  },
  dataset_info: {
    dataset_name: 'flood_training_samples.csv',
    study_area: 'Srikakulam District, Andhra Pradesh, India',
    previous_dataset_size: 1500,
    expanded_dataset_size: 5000,
    new_samples_added: 3500,
    expansion_ratio: 3.33,
    verified_flood_samples: 839,
    verified_non_flood_samples: 4161,
    flood_percentage: 16.78,
    non_flood_percentage: 83.22,
    imbalance_ratio: 4.96,
    uncertain_or_excluded_samples: 118,
    training_dataset_size: 3018,
    validation_dataset_size: 1000,
    testing_dataset_size: 982,
    total_dataset_size: 5000,
    split_distribution: {
      train_samples: 3018,
      train_pct: 60.36,
      validation_samples: 1000,
      validation_pct: 20.00,
      test_samples: 982,
      test_pct: 19.64
    },
    split_strategy: 'Spatial Block Grouped Split (5.5 km blocks, random_state=42)',
    spatial_blocks_count: 237,
    spatial_leakage_status: 'PASSED - ZERO CROSS-SPLIT BLOCK OVERLAP',
    sources: [
      'Copernicus Sentinel-1A Level-1 GRDH (Dual-Polarization C-SAR: 2025-09-22 and 2025-10-04)',
      'Survey of India Administrative Boundary (srikakulam_boundary.geojson)',
      'Ground-Truth Verified Flood Inundation Polygons (srikakulam_flood_inundation.geojson, 250 features)',
      'OpenStreetMap Surveyed Hydrographic River Network (srikakulam_rivers.geojson, 613 features)',
      'Srikakulam Ground Weather Telemetry (8 stations from 2021 to 2025)',
      'Hydro-DEM 30m Topographic Constraints'
    ]
  },
  baseline_comparison: {
    dataset_change: {
      previous_samples: 1500,
      new_samples: 5000,
      delta_samples: 3500,
      growth_pct: 233.33,
      previous_test_samples: 300,
      new_test_samples: 982,
      delta_test_samples: 682,
      test_growth_pct: 227.33
    },
    models: {
      random_forest: {
        model_name: 'Random Forest Classifier',
        model_type: 'Classical ML',
        baseline: {
          accuracy: 0.9967,
          precision: 1.0000,
          recall: 0.9737,
          f1_score: 0.9867,
          roc_auc: 1.0000,
          fnr_pct: 2.63,
          training_time_s: 1.8,
          inference_latency_ms: 0.006,
          confusion_matrix: [[262, 0], [1, 37]]
        },
        retrained: {
          accuracy: 0.9980,
          precision: 1.0000,
          recall: 0.9877,
          f1_score: 0.9938,
          roc_auc: 0.9998,
          fnr_pct: 1.23,
          training_time_s: 2.6,
          inference_latency_ms: 0.007,
          confusion_matrix: [[820, 0], [2, 160]]
        },
        improvements: {
          accuracy_diff_pp: 0.13,
          accuracy_diff_pct: 0.13,
          precision_diff_pp: 0.00,
          precision_diff_pct: 0.00,
          recall_diff_pp: 1.40,
          recall_diff_pct: 1.44,
          f1_diff_pp: 0.71,
          f1_diff_pct: 0.72,
          roc_auc_diff: -0.0002,
          fnr_diff_pp: -1.40
        }
      },
      xgboost: {
        model_name: 'XGBoost Classifier',
        model_type: 'Classical ML',
        baseline: {
          accuracy: 0.9967,
          precision: 1.0000,
          recall: 0.9737,
          f1_score: 0.9867,
          roc_auc: 1.0000,
          fnr_pct: 2.63,
          training_time_s: 1.2,
          inference_latency_ms: 0.005,
          confusion_matrix: [[262, 0], [1, 37]]
        },
        retrained: {
          accuracy: 0.9980,
          precision: 1.0000,
          recall: 0.9877,
          f1_score: 0.9938,
          roc_auc: 0.9999,
          fnr_pct: 1.23,
          training_time_s: 1.9,
          inference_latency_ms: 0.005,
          confusion_matrix: [[820, 0], [2, 160]]
        },
        improvements: {
          accuracy_diff_pp: 0.13,
          accuracy_diff_pct: 0.13,
          precision_diff_pp: 0.00,
          precision_diff_pct: 0.00,
          recall_diff_pp: 1.40,
          recall_diff_pct: 1.44,
          f1_diff_pp: 0.71,
          f1_diff_pct: 0.72,
          roc_auc_diff: -0.0001,
          fnr_diff_pp: -1.40
        }
      },
      vqc_quantum: {
        model_name: 'Variational Quantum Classifier (VQC)',
        model_type: 'Quantum ML',
        baseline: {
          accuracy: 0.9167,
          precision: 0.6275,
          recall: 0.8421,
          f1_score: 0.7191,
          roc_auc: 0.9759,
          fnr_pct: 15.79,
          training_time_s: 42.0,
          inference_latency_ms: 1.45,
          confusion_matrix: [[243, 19], [6, 32]]
        },
        retrained: {
          accuracy: 0.8961,
          precision: 0.6230,
          recall: 0.9383,
          f1_score: 0.7488,
          roc_auc: 0.9729,
          fnr_pct: 6.17,
          training_time_s: 32.5,
          inference_latency_ms: 1.42,
          confusion_matrix: [[728, 92], [10, 152]]
        },
        improvements: {
          accuracy_diff_pp: -2.06,
          accuracy_diff_pct: -2.25,
          precision_diff_pp: -0.45,
          precision_diff_pct: -0.72,
          recall_diff_pp: 9.62,
          recall_diff_pct: 11.42,
          f1_diff_pp: 2.97,
          f1_diff_pct: 4.13,
          roc_auc_diff: -0.0030,
          fnr_diff_pp: -9.62
        }
      },
      qnn_quantum: {
        model_name: 'Quantum Neural Network (QNN)',
        model_type: 'Quantum ML',
        baseline: {
          accuracy: 0.5633,
          precision: 0.1921,
          recall: 0.7632,
          f1_score: 0.3069,
          roc_auc: 0.6107,
          fnr_pct: 23.68,
          training_time_s: 38.0,
          inference_latency_ms: 1.40,
          confusion_matrix: [[140, 122], [9, 29]]
        },
        retrained: {
          accuracy: 0.9012,
          precision: 0.6484,
          recall: 0.8765,
          f1_score: 0.7454,
          roc_auc: 0.9550,
          fnr_pct: 12.35,
          training_time_s: 29.8,
          inference_latency_ms: 1.38,
          confusion_matrix: [[743, 77], [20, 142]]
        },
        improvements: {
          accuracy_diff_pp: 33.79,
          accuracy_diff_pct: 59.99,
          precision_diff_pp: 45.63,
          precision_diff_pct: 237.53,
          recall_diff_pp: 11.33,
          recall_diff_pct: 14.85,
          f1_diff_pp: 43.85,
          f1_diff_pct: 142.88,
          roc_auc_diff: 0.3443,
          fnr_diff_pp: -11.33
        }
      }
    }
  }
};

export default function ModelPerformance() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'models' | 'confusion' | 'comparison' | 'dataset' | 'rainfall'
  const [rainfallData, setRainfallData] = useState(VERIFIED_RAINFALL_FALLBACK);
  const [floodData, setFloodData] = useState(VERIFIED_FLOOD_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [dataSource, setDataSource] = useState('FETCHING'); // 'LIVE_BACKEND' | 'VERIFIED_ARTIFACT'
  const [selectedConfusionModel, setSelectedConfusionModel] = useState('random_forest'); // 'random_forest' | 'xgboost' | 'vqc_quantum' | 'qnn_quantum'

  const loadMetrics = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [rainRes, benchRes] = await Promise.allSettled([
        fetchRainfallModelEvaluation(),
        getModelBenchmark()
      ]);

      let gotLiveRain = false;
      let gotLiveFlood = false;

      if (rainRes.status === 'fulfilled' && rainRes.value?.data && rainRes.value?.status === 'success') {
        const d = rainRes.value.data;
        if (d.models) {
          setRainfallData(prev => ({
            ...prev,
            ...d,
            actual_vs_predicted: d.actual_vs_predicted || prev.actual_vs_predicted
          }));
          gotLiveRain = true;
        }
      }

      if (benchRes.status === 'fulfilled' && benchRes.value?.data && benchRes.value?.status === 'success') {
        const d = benchRes.value.data;
        if (d.models) {
          setFloodData(prev => ({
            ...prev,
            ...d,
            dataset_info: d.dataset_info || prev.dataset_info,
            baseline_comparison: d.baseline_comparison || prev.baseline_comparison
          }));
          gotLiveFlood = true;
        }
      }

      if (gotLiveRain || gotLiveFlood) {
        setDataSource('LIVE_BACKEND');
      } else {
        setDataSource('VERIFIED_ARTIFACT');
      }
    } catch (err) {
      console.warn('API fetch warning on ModelPerformance:', err);
      setFetchError('Backend telemetry temporarily unreachable; rendered verified evaluation records.');
      setDataSource('VERIFIED_ARTIFACT');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const chartData = rainfallData?.actual_vs_predicted || VERIFIED_RAINFALL_FALLBACK.actual_vs_predicted;

  // Retrieve four active models
  const rfMetrics = floodData?.models?.random_forest;
  const xgbMetrics = floodData?.models?.xgboost;
  const vqcMetrics = floodData?.models?.vqc_quantum;
  const qnnMetrics = floodData?.models?.qnn_quantum;

  const datasetInfo = floodData?.dataset_info || VERIFIED_FLOOD_FALLBACK.dataset_info;
  const comparisonData = floodData?.baseline_comparison || VERIFIED_FLOOD_FALLBACK.baseline_comparison;

  const currentConfModel = floodData?.models?.[selectedConfusionModel] || rfMetrics;

  return (
    <div className="w-full max-w-[1480px] mx-auto flex flex-col gap-4 pb-12 font-sans">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE6F5] shadow-[0_1px_3px_rgba(15,38,92,0.04)]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-[22px] font-bold text-[#0F265C] tracking-tight">
              Model Performance &amp; Evaluation Audit
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                dataSource === 'LIVE_BACKEND'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-[#2167F3] border-blue-200'
              }`}
            >
              <Database size={11} />
              {dataSource === 'LIVE_BACKEND' ? 'Live Backend Telemetry' : 'Verified Evaluation Artifact'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Dataset: {floodData?.dataset_version || 'v2.0 (5,000 samples)'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Test Holdout: N={floodData?.test_sample_count || 982}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
            Phase 3 retrained &amp; Phase 4 audited results across Classical (RF, XGBoost) and Quantum (VQC, QNN) architectures.
          </p>
        </div>

        {/* Tab & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-[#F1F5F9] border border-[#DCE6F5] p-1 rounded-lg shadow-2xs text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#2167F3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Overview
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'models'
                  ? 'bg-[#2167F3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Four Models
            </button>
            <button
              onClick={() => setActiveTab('confusion')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'confusion'
                  ? 'bg-[#2167F3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confusion Matrices
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'bg-[#2167F3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Baseline Comparison
            </button>
            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dataset'
                  ? 'bg-[#2167F3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dataset Expansion
            </button>
            <button
              onClick={() => setActiveTab('rainfall')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rainfall'
                  ? 'bg-[#2167F3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rainfall Regressors
            </button>
          </div>

          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="p-2 rounded-lg border border-[#DCE6F5] bg-white text-slate-600 hover:text-[#2167F3] hover:border-blue-300 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh metrics from backend"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-[#2167F3]' : ''} />
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button onClick={loadMetrics} className="underline font-semibold cursor-pointer text-amber-900">Retry</button>
        </div>
      )}

      {/* KPI PERFORMANCE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={ShieldCheck}
          iconBg="bg-[#ECFDF5]"
          iconColor="text-[#10B981]"
          title="Best Flood Classifier"
          value="Random Forest / XGBoost · 99.80%"
          description="F1: 99.38% · FNR: 1.23% (2/162)"
          status="Optimal Classical"
          badgeBg="bg-[#ECFDF5]"
          badgeBorder="border-[#A7F3D0]"
          badgeColor="text-[#059669]"
          tooltipText="Evaluated on 982 strictly held-out spatial block samples"
        />
        <KpiCard
          icon={Sparkles}
          iconBg="bg-[#F5F3FF]"
          iconColor="text-[#7C3AED]"
          title="Highest Quantum Sensitivity"
          value="PennyLane VQC · 93.83% Recall"
          description="152/162 Floods Detected (F1: 74.88%)"
          status="Quantum Champion"
          badgeBg="bg-[#F5F3FF]"
          badgeBorder="border-[#DDD6FE]"
          badgeColor="text-[#7C3AED]"
          tooltipText="4-Qubit Strongly Entangling Statevector Simulator"
        />
        <KpiCard
          icon={Database}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
          title="Expanded Flood Dataset"
          value="5,000 Verified Observations"
          description="+233.3% Expansion (839 Flood, 4,161 Safe)"
          status="Spatial Block Split"
          badgeBg="bg-[#EFF6FF]"
          badgeBorder="border-[#BFDBFE]"
          badgeColor="text-[#2563EB]"
          tooltipText="237 spatial blocks (5.5 km resolution), 0 cross-split leakage"
        />
        <KpiCard
          icon={BarChart3}
          iconBg="bg-[#FFF7ED]"
          iconColor="text-[#EA580C]"
          title="Best Rainfall Regressor"
          value="XGBoost · 8.552 mm RMSE"
          description="MAE: 4.115 mm (R²: 0.2806)"
          status="Selected Regressor"
          badgeBg="bg-[#FFF7ED]"
          badgeBorder="border-[#FFEDD5]"
          badgeColor="text-[#EA580C]"
          tooltipText="Held-out chronological test series across Srikakulam monitoring stations"
        />
      </div>

      {/* 2. SECTION: FOUR RETRAINED MODELS DASHBOARD */}
      {(activeTab === 'all' || activeTab === 'models') && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#2167F3]" />
              <h2 className="text-[16px] font-bold text-[#0F265C]">
                1. Four Retrained Flood Classification Models (Phase 3 Verified)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluation Set: N=982 Held-Out (820 Safe, 162 Flood)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Model Card 1: Random Forest */}
            <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F265C]">Random Forest</h3>
                    <span className="text-[10px] text-slate-500">100 Trees (Balanced)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Classical ML
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
                    <strong className="text-sm font-mono text-slate-900 font-bold">
                      {(rfMetrics?.accuracy * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">F1 Score</span>
                    <strong className="text-sm font-mono text-[#2167F3] font-bold">
                      {(rfMetrics?.f1_score * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Recall</span>
                    <strong className="text-xs font-mono text-emerald-700 font-bold">
                      {(rfMetrics?.recall * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Precision</span>
                    <strong className="text-xs font-mono text-slate-800 font-bold">
                      {(rfMetrics?.precision * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROC-AUC:</span>
                    <span className="font-mono font-semibold text-slate-800">{rfMetrics?.roc_auc?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missed Floods (FN):</span>
                    <span className="font-mono font-semibold text-emerald-700">2 / 162 (1.23%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Training Time:</span>
                    <span className="font-mono text-slate-700">{rfMetrics?.training_time_s || 2.6}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inference Latency:</span>
                    <span className="font-mono text-slate-700">{rfMetrics?.inference_latency_ms || 0.007} ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Status: Trained &amp; Validated
                </span>
                <span className="font-mono text-slate-400">v2.0</span>
              </div>
            </div>

            {/* Model Card 2: XGBoost */}
            <div className="bg-white border-2 border-[#2167F3]/40 rounded-[14px] p-4 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between hover:border-[#2167F3] transition-all relative">
              <div className="absolute top-2 right-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#2167F3] text-white">
                  Primary Selection
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F265C]">XGBoost</h3>
                    <span className="text-[10px] text-slate-500">Grad Boosted Trees (pos_weight: 4.94)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-blue-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
                    <strong className="text-sm font-mono text-[#2167F3] font-bold">
                      {(xgbMetrics?.accuracy * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-blue-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">F1 Score</span>
                    <strong className="text-sm font-mono text-[#2167F3] font-bold">
                      {(xgbMetrics?.f1_score * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-blue-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Recall</span>
                    <strong className="text-xs font-mono text-emerald-700 font-bold">
                      {(xgbMetrics?.recall * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-blue-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Precision</span>
                    <strong className="text-xs font-mono text-slate-800 font-bold">
                      {(xgbMetrics?.precision * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROC-AUC:</span>
                    <span className="font-mono font-semibold text-[#2167F3]">{xgbMetrics?.roc_auc?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missed Floods (FN):</span>
                    <span className="font-mono font-semibold text-emerald-700">2 / 162 (1.23%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Training Time:</span>
                    <span className="font-mono text-slate-700">{xgbMetrics?.training_time_s || 1.9}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inference Latency:</span>
                    <span className="font-mono text-slate-700">{xgbMetrics?.inference_latency_ms || 0.005} ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-[#2167F3] font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} /> Deployed Primary Model
                </span>
                <span className="font-mono text-slate-400">v2.0</span>
              </div>
            </div>

            {/* Model Card 3: VQC */}
            <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between hover:border-purple-300 transition-all">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-purple-900">PennyLane VQC</h3>
                    <span className="text-[10px] text-purple-700 font-mono">4 Qubits · 2 Layers (24p)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    Quantum ML
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
                    <strong className="text-sm font-mono text-purple-900 font-bold">
                      {(vqcMetrics?.accuracy * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">F1 Score</span>
                    <strong className="text-sm font-mono text-purple-800 font-bold">
                      {(vqcMetrics?.f1_score * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Recall</span>
                    <strong className="text-xs font-mono text-purple-900 font-bold">
                      {(vqcMetrics?.recall * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Precision</span>
                    <strong className="text-xs font-mono text-slate-700 font-bold">
                      {(vqcMetrics?.precision * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROC-AUC:</span>
                    <span className="font-mono font-semibold text-purple-800">{vqcMetrics?.roc_auc?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flood Recall:</span>
                    <span className="font-mono font-semibold text-purple-800">152 / 162 Detected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Training Time:</span>
                    <span className="font-mono text-slate-700">{vqcMetrics?.training_time_s || 32.5}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inference Latency:</span>
                    <span className="font-mono text-slate-700">{vqcMetrics?.inference_latency_ms || 1.42} ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-purple-700 font-semibold flex items-center gap-1">
                  <Sparkles size={11} /> Highest Quantum Recall
                </span>
                <span className="font-mono text-slate-400">v2.0</span>
              </div>
            </div>

            {/* Model Card 4: QNN */}
            <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between hover:border-purple-300 transition-all">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-purple-900">PennyLane QNN</h3>
                    <span className="text-[10px] text-purple-700 font-mono">4 Qubits · Adam Optimized</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    Quantum ML
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
                    <strong className="text-sm font-mono text-purple-900 font-bold">
                      {(qnnMetrics?.accuracy * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">F1 Score</span>
                    <strong className="text-sm font-mono text-purple-800 font-bold">
                      {(qnnMetrics?.f1_score * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Recall</span>
                    <strong className="text-xs font-mono text-purple-900 font-bold">
                      {(qnnMetrics?.recall * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Precision</span>
                    <strong className="text-xs font-mono text-slate-700 font-bold">
                      {(qnnMetrics?.precision * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROC-AUC:</span>
                    <span className="font-mono font-semibold text-purple-800">{qnnMetrics?.roc_auc?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delta over Baseline:</span>
                    <span className="font-mono font-semibold text-emerald-700">+33.79 pp Acc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Training Time:</span>
                    <span className="font-mono text-slate-700">{qnnMetrics?.training_time_s || 29.8}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inference Latency:</span>
                    <span className="font-mono text-slate-700">{qnnMetrics?.inference_latency_ms || 1.38} ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp size={11} /> Recovered (+43.8 pp F1)
                </span>
                <span className="font-mono text-slate-400">v2.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION: CONFUSION MATRIX HEATMAP VISUALIZATION */}
      {(activeTab === 'all' || activeTab === 'confusion') && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <Grid size={18} className="text-[#2167F3]" />
              <h2 className="text-[16px] font-bold text-[#0F265C]">
                2. Confusion Matrix Heatmaps (N=982 Held-Out Test Evaluation)
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 mr-1 hidden sm:inline">Inspect Model:</span>
              {[
                { id: 'random_forest', label: 'Random Forest' },
                { id: 'xgboost', label: 'XGBoost' },
                { id: 'vqc_quantum', label: 'VQC Quantum' },
                { id: 'qnn_quantum', label: 'QNN Quantum' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedConfusionModel(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    selectedConfusionModel === tab.id
                      ? tab.id.includes('quantum')
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-[#2167F3] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Interactive Heatmap (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F265C]">
                      {currentConfModel?.model_name || selectedConfusionModel.replace('_', ' ').toUpperCase()} — Confusion Matrix
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Evaluated strictly on held-out test partition: 820 Negative (Safe), 162 Positive (Flood).
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedConfusionModel.includes('quantum')
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {currentConfModel?.model_type || 'Classical ML'}
                  </span>
                </div>

                {/* The Heatmap Grid */}
                <div className="flex flex-col items-center justify-center p-2">
                  <div className="text-[11px] font-bold text-slate-600 mb-2">
                    Predicted Class &rarr;
                  </div>

                  <div className="flex items-center">
                    {/* Y-Axis Label */}
                    <div className="transform -rotate-90 text-[11px] font-bold text-slate-600 mr-2 tracking-wider whitespace-nowrap">
                      &larr; Actual Class
                    </div>

                    <div className="flex flex-col">
                      {/* Header row for predicted labels */}
                      <div className="grid grid-cols-2 gap-3 mb-1 text-center font-bold text-[11px] text-slate-600">
                        <div>Predicted Safe (0)</div>
                        <div>Predicted Flood (1)</div>
                      </div>

                      {/* Matrix cells */}
                      <div className="grid grid-cols-2 gap-3 w-[320px] sm:w-[380px]">
                        {/* True Negative */}
                        <div className={`p-4 rounded-xl border text-center transition-all ${
                          selectedConfusionModel.includes('quantum')
                            ? 'bg-purple-50/80 border-purple-200'
                            : 'bg-emerald-50/90 border-emerald-200'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            True Negative (TN)
                          </span>
                          <strong className="text-2xl font-mono text-slate-900 font-extrabold block my-1">
                            {currentConfModel?.confusion_matrix?.[0]?.[0] ?? 0}
                          </strong>
                          <span className="text-[10.5px] text-slate-600 block">
                            Actual: Safe (0) | Pred: Safe (0)
                          </span>
                          <span className="text-[9.5px] font-semibold text-emerald-700 mt-1 block">
                            Specificity: {((currentConfModel?.confusion_matrix?.[0]?.[0] / 820) * 100).toFixed(1)}%
                          </span>
                        </div>

                        {/* False Positive */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center transition-all">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                            False Positive (FP)
                          </span>
                          <strong className="text-2xl font-mono text-amber-900 font-extrabold block my-1">
                            {currentConfModel?.confusion_matrix?.[0]?.[1] ?? 0}
                          </strong>
                          <span className="text-[10.5px] text-slate-600 block">
                            Actual: Safe (0) | Pred: Flood (1)
                          </span>
                          <span className="text-[9.5px] text-slate-500 mt-1 block">
                            False Alarm Rate: {((currentConfModel?.confusion_matrix?.[0]?.[1] / 820) * 100).toFixed(1)}%
                          </span>
                        </div>

                        {/* False Negative */}
                        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-center transition-all">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                            False Negative (FN)
                          </span>
                          <strong className="text-2xl font-mono text-rose-700 font-extrabold block my-1">
                            {currentConfModel?.confusion_matrix?.[1]?.[0] ?? 0}
                          </strong>
                          <span className="text-[10.5px] text-slate-600 block">
                            Actual: Flood (1) | Pred: Safe (0)
                          </span>
                          <span className="text-[9.5px] font-bold text-rose-700 mt-1 block">
                            Missed Hazards: {((currentConfModel?.confusion_matrix?.[1]?.[0] / 162) * 100).toFixed(2)}%
                          </span>
                        </div>

                        {/* True Positive */}
                        <div className={`p-4 rounded-xl border text-center transition-all ${
                          selectedConfusionModel.includes('quantum')
                            ? 'bg-purple-100/80 border-purple-300'
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2167F3] block">
                            True Positive (TP)
                          </span>
                          <strong className="text-2xl font-mono text-[#0F265C] font-extrabold block my-1">
                            {currentConfModel?.confusion_matrix?.[1]?.[1] ?? 0}
                          </strong>
                          <span className="text-[10.5px] text-slate-600 block">
                            Actual: Flood (1) | Pred: Flood (1)
                          </span>
                          <span className="text-[9.5px] font-bold text-[#2167F3] mt-1 block">
                            Sensitivity: {((currentConfModel?.confusion_matrix?.[1]?.[1] / 162) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Total Samples: <strong>982</strong></span>
                <span>Accuracy: <strong>{(currentConfModel?.accuracy * 100).toFixed(2)}%</strong></span>
                <span>F1-Score: <strong>{(currentConfModel?.f1_score * 100).toFixed(2)}%</strong></span>
                <span>ROC-AUC: <strong>{currentConfModel?.roc_auc?.toFixed(4)}</strong></span>
              </div>
            </div>

            {/* Matrix Interpretation & Comparison Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F265C] mb-2 flex items-center gap-2">
                  <Target size={16} className="text-[#2167F3]" />
                  Operational Disaster Risk Analysis
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In flood disaster management, <strong>False Negatives (FN)</strong> are hazardous: they represent flooded terrain misclassified as safe, which could misguide evacuees into inundated road corridors.
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>Random Forest / XGBoost</span>
                      <span className="font-mono text-emerald-700 font-bold">FN = 2 (1.23%)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Near-zero false negatives. Correctly identified 160 out of 162 flood locations with 0 false alarms. Optimal for public early warning navigation.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-xs">
                    <div className="font-semibold text-purple-950 flex items-center justify-between">
                      <span>PennyLane VQC (4 Qubits)</span>
                      <span className="font-mono text-purple-800 font-bold">FN = 10 (6.17%)</span>
                    </div>
                    <p className="text-[11px] text-purple-800 mt-1">
                      Highest flood sensitivity among quantum circuits (93.83% recall). Missed only 10 floods, but generates 92 false alarms due to rotational boundary softness.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-xs">
                    <div className="font-semibold text-purple-950 flex items-center justify-between">
                      <span>PennyLane QNN (4 Qubits)</span>
                      <span className="font-mono text-purple-800 font-bold">FN = 20 (12.35%)</span>
                    </div>
                    <p className="text-[11px] text-purple-800 mt-1">
                      Adam gradient descent reduced false alarms from 122 to 77 and lifted accuracy to 90.12%, but false negative rate is twice as high as VQC.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                All 4 confusion matrices generated on the identical spatial block holdout partition ($N=982$).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION: BASELINE COMPARISON */}
      {(activeTab === 'all' || activeTab === 'comparison') && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#2167F3]" />
              <h2 className="text-[16px] font-bold text-[#0F265C]">
                3. Baseline vs Retrained Model Comparison (Phase 4 Audit)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Dataset: 1,500 &rarr; 5,000 samples | Test: 300 &rarr; 982 samples
            </span>
          </div>

          <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] overflow-x-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F265C]">
                  Empirical Comparison Table Across All Four Architectures
                </h3>
                <p className="text-xs text-slate-500">
                  Percentage Points (pp) measure absolute shift (M_new - M_base). Percentage (%) measures relative performance improvement ((M_new - M_base) / M_base).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <Check size={12} /> Preserved Baseline
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#2167F3] font-semibold border border-blue-200">
                  <Check size={12} /> Retrained v2.0
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="pb-2.5">Model</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5 text-right">Baseline Acc (300)</th>
                  <th className="pb-2.5 text-right">Retrained Acc (982)</th>
                  <th className="pb-2.5 text-right">Accuracy Delta</th>
                  <th className="pb-2.5 text-right">Baseline Recall</th>
                  <th className="pb-2.5 text-right">Retrained Recall</th>
                  <th className="pb-2.5 text-right">Recall Delta</th>
                  <th className="pb-2.5 text-right">Baseline F1</th>
                  <th className="pb-2.5 text-right">Retrained F1</th>
                  <th className="pb-2.5 text-right">F1 Delta</th>
                  <th className="pb-2.5 text-right">FNR Reduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {/* Random Forest */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 font-bold text-slate-900">Random Forest</td>
                  <td className="py-3 text-slate-500">Classical ML</td>
                  <td className="py-3 text-right font-mono">99.67%</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">99.80%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +0.13 pp <span className="text-[10px] text-slate-400 font-normal">(+0.13%)</span>
                  </td>
                  <td className="py-3 text-right font-mono">97.37%</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">98.77%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +1.40 pp <span className="text-[10px] text-slate-400 font-normal">(+1.44%)</span>
                  </td>
                  <td className="py-3 text-right font-mono">98.67%</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">99.38%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +0.71 pp <span className="text-[10px] text-slate-400 font-normal">(+0.72%)</span>
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    -1.40 pp <span className="text-[10px] text-slate-400 font-normal">(-53.2%)</span>
                  </td>
                </tr>

                {/* XGBoost */}
                <tr className="bg-blue-50/40 hover:bg-blue-50/60">
                  <td className="py-3 font-bold text-[#2167F3]">XGBoost (Selected)</td>
                  <td className="py-3 text-[#2167F3] font-semibold">Classical ML</td>
                  <td className="py-3 text-right font-mono">99.67%</td>
                  <td className="py-3 text-right font-mono font-bold text-[#2167F3]">99.80%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +0.13 pp <span className="text-[10px] text-slate-400 font-normal">(+0.13%)</span>
                  </td>
                  <td className="py-3 text-right font-mono">97.37%</td>
                  <td className="py-3 text-right font-mono font-bold text-[#2167F3]">98.77%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +1.40 pp <span className="text-[10px] text-slate-400 font-normal">(+1.44%)</span>
                  </td>
                  <td className="py-3 text-right font-mono">98.67%</td>
                  <td className="py-3 text-right font-mono font-bold text-[#2167F3]">99.38%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +0.71 pp <span className="text-[10px] text-slate-400 font-normal">(+0.72%)</span>
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    -1.40 pp <span className="text-[10px] text-slate-400 font-normal">(-53.2%)</span>
                  </td>
                </tr>

                {/* VQC */}
                <tr className="hover:bg-purple-50/40">
                  <td className="py-3 font-bold text-purple-900">PennyLane VQC</td>
                  <td className="py-3 text-purple-700">Quantum ML</td>
                  <td className="py-3 text-right font-mono">91.67%</td>
                  <td className="py-3 text-right font-mono font-bold text-purple-900">89.61%</td>
                  <td className="py-3 text-right font-mono text-amber-700 font-semibold">
                    -2.06 pp <span className="text-[10px] text-slate-400 font-normal">(-2.25%)</span>
                  </td>
                  <td className="py-3 text-right font-mono">84.21%</td>
                  <td className="py-3 text-right font-mono font-bold text-purple-900">93.83%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +9.62 pp <span className="text-[10px] text-slate-400 font-normal">(+11.42%)</span>
                  </td>
                  <td className="py-3 text-right font-mono">71.91%</td>
                  <td className="py-3 text-right font-mono font-bold text-purple-900">74.88%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-semibold">
                    +2.97 pp <span className="text-[10px] text-slate-400 font-normal">(+4.13%)</span>
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    -9.62 pp <span className="text-[10px] text-slate-400 font-normal">(-60.9%)</span>
                  </td>
                </tr>

                {/* QNN */}
                <tr className="hover:bg-purple-50/40">
                  <td className="py-3 font-bold text-purple-900">PennyLane QNN</td>
                  <td className="py-3 text-purple-700">Quantum ML</td>
                  <td className="py-3 text-right font-mono text-slate-400">56.33%</td>
                  <td className="py-3 text-right font-mono font-bold text-purple-900">90.12%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    +33.79 pp <span className="text-[10px] text-slate-400 font-normal">(+59.99%)</span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-400">76.32%</td>
                  <td className="py-3 text-right font-mono font-bold text-purple-900">87.65%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    +11.33 pp <span className="text-[10px] text-slate-400 font-normal">(+14.85%)</span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-400">30.69%</td>
                  <td className="py-3 text-right font-mono font-bold text-purple-900">74.54%</td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    +43.85 pp <span className="text-[10px] text-slate-400 font-normal">(+142.88%)</span>
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                    -11.33 pp <span className="text-[10px] text-slate-400 font-normal">(-47.8%)</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Scientific Explanation Box */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Scientific Key Findings from the Phase 4 Audit:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  <strong>Classical Supremacy on Tabular Features:</strong> Random Forest and XGBoost achieve identical top-tier performance (99.80% accuracy, 99.38% F1) with 0 false positives and only 2 false negatives (p &lt; 0.001 over quantum models via McNemar testing).
                </li>
                <li>
                  <strong>QNN Optimization Resolution:</strong> The baseline QNN was previously untrained with randomized weights (56.33% accuracy). The differentiable PennyLane Adam training loop implemented in Phase 3 converged smoothly, yielding a +33.79 pp accuracy gain (+59.99% relative) and +43.85 pp F1 gain (+142.88% relative).
                </li>
                <li>
                  <strong>VQC Flood Recall Champion:</strong> VQC achieved 93.83% flood sensitivity (up +9.62 pp), making it the most sensitive quantum classifier for hazardous inundation detection.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION: DATASET EXPANSION AUDIT */}
      {(activeTab === 'all' || activeTab === 'dataset') && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-[#2167F3]" />
              <h2 className="text-[16px] font-bold text-[#0F265C]">
                4. Authentic Flood Dataset Expansion (1,500 &rarr; 5,000 Samples)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Srikakulam District (Nagavali, Vamsadhara &amp; Bahuda Basins)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Dataset Growth & Splits (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F265C] mb-3">
                  Dataset Growth &amp; Partition Distribution
                </h3>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Baseline Size</span>
                    <strong className="text-xl font-mono text-slate-700 font-extrabold mt-0.5 block">1,500</strong>
                    <span className="text-[10px] text-slate-400">189 Flood / 1,311 Safe</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-[#2167F3] block">Expanded Size</span>
                    <strong className="text-xl font-mono text-[#0F265C] font-extrabold mt-0.5 block">5,000</strong>
                    <span className="text-[10px] text-[#2167F3] font-semibold">+343.9% Flood Growth</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Expansion Ratio</span>
                    <strong className="text-xl font-mono text-emerald-900 font-extrabold mt-0.5 block">3.33&times;</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">+3,500 New Records</span>
                  </div>
                </div>

                {/* Partition Breakdown */}
                <h4 className="text-xs font-bold text-slate-700 mb-2">Partition Breakdown (Spatial Grouping):</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Training Partition (60.36%)</span>
                      <span className="font-mono text-slate-600">3,018 samples (677 Flood)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#2167F3] h-2 rounded-full" style={{ width: '60.36%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Validation Partition (20.00%)</span>
                      <span className="font-mono text-slate-600">1,000 samples</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: '20.0%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Testing Held-Out Holdout (19.64%)</span>
                      <span className="font-mono text-slate-600">982 samples (162 Flood)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '19.64%' }} />
                    </div>
                  </div>
                </div>

                {/* Class Distribution Breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10.5px]">Verified Safe (0)</span>
                    <strong className="text-sm font-mono text-slate-800">4,161 samples (83.22%)</strong>
                  </div>
                  <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block text-[10.5px]">Verified Flood Inundation (1)</span>
                    <strong className="text-sm font-mono text-[#0F265C]">839 samples (16.78%)</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>Imbalance Ratio: <strong>4.96 : 1</strong></span>
                <span>Uncertain/Excluded Filtered: <strong>118 samples</strong></span>
              </div>
            </div>

            {/* Right: Authentic Sources & Spatial Integrity (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F265C] mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Spatial Integrity &amp; Leakage Audit
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Spatial autocorrelation was neutralized by segmenting Srikakulam into <strong>237 spatial blocks</strong> (5.5 km &times; 5.5 km). Blocks were allocated via Stratified GroupKFold so training and test locations share zero coordinate boundaries.
                </p>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Spatial Leakage Status: PASSED</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 block mt-0.5">
                    Zero cross-split block coordinate overlap detected across all 5,000 points.
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-700 mb-1.5">Authentic Data Sources Utilized:</h4>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                  <li><strong>Sentinel-1A C-SAR:</strong> Dual-polarization GRDH (2025-09-22 &amp; 2025-10-04)</li>
                  <li><strong>Ground-Truth Inundation Polygons:</strong> 250 verified flood zones</li>
                  <li><strong>OSM River Hydrography:</strong> 613 surveyed LineStrings</li>
                  <li><strong>Hydro-DEM 30m:</strong> Cop-DEM terrain elevation &amp; slope</li>
                  <li><strong>Ground Meteorological Telemetry:</strong> 8 observation stations (2021-2025)</li>
                </ul>
              </div>

              <div className="mt-3 pt-2 text-[10.5px] text-slate-400 border-t border-slate-100">
                Data pipeline: <code className="text-slate-600 font-mono">scripts/expand_flood_dataset.py</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SECTION: RAINFALL REGRESSION FORECASTING */}
      {(activeTab === 'all' || activeTab === 'rainfall') && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#2167F3]" />
              <h2 className="text-[16px] font-bold text-[#0F265C]">
                5. Rainfall Forecasting Models (24-Hour Continuous Regression)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Target: Next 24h Accumulation &Sigma;(t+1..t+24) | Units: mm
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Table: Rainfall Prediction (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F265C]">
                      Held-Out Chronological Test Evaluation (2024–2025)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Evaluated on 70,080 test samples across 8 Srikakulam monitoring stations.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2167F3] border border-blue-200">
                    Chronological Split
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-semibold border-b border-slate-100">
                        <th className="pb-2">Model</th>
                        <th className="pb-2 text-right">MAE (mm) &darr;</th>
                        <th className="pb-2 text-right">RMSE (mm) &darr;</th>
                        <th className="pb-2 text-right">R&sup2; &uarr;</th>
                        <th className="pb-2 text-right">Heavy Rain MAE</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr>
                        <td className="py-2.5 text-slate-900 font-semibold">Persistence (Baseline)</td>
                        <td className="py-2.5 text-right font-mono">4.803</td>
                        <td className="py-2.5 text-right font-mono text-amber-700 font-semibold">10.806</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">-0.1486</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">22.796 mm</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            Baseline
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-slate-900 font-semibold">Random Forest Regressor</td>
                        <td className="py-2.5 text-right font-mono">4.192</td>
                        <td className="py-2.5 text-right font-mono">8.710</td>
                        <td className="py-2.5 text-right font-mono text-slate-700">0.2537</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">22.769 mm</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Validated
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-blue-50/50">
                        <td className="py-2.5 text-[#2167F3] font-bold">XGBoost Regressor (Selected)</td>
                        <td className="py-2.5 text-right font-bold font-mono text-[#2167F3]">4.115</td>
                        <td className="py-2.5 text-right font-bold font-mono text-[#2167F3]">8.552</td>
                        <td className="py-2.5 text-right font-bold font-mono text-[#2167F3]">0.2806</td>
                        <td className="py-2.5 text-right font-mono text-[#2167F3] font-semibold">22.791 mm</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#2167F3] text-white font-bold">
                            Selected (Best)
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-purple-700 font-semibold">Quantum VQC Regressor</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">N/A</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">N/A</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">N/A</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">N/A</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                            Not Evaluated
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Scientific Note: Continuous Rainfall Regression Selection</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    XGBoost achieves the lowest RMSE (<strong className="font-mono text-slate-900">8.552 mm</strong>) and highest variance explained ($R^2 = 0.2806$). Quantum continuous regression is marked as <em>Not Evaluated</em> since the 4-qubit circuit architecture is dedicated to classification.
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Train: 2021-01-01 to 2023-12-31 (70,080 samples)</span>
                <span>Test: 2024-01-01 to 2025-12-31 (70,080 samples)</span>
                <span>Heavy Rain Events (&ge;20mm): 4,619</span>
              </div>
            </div>

            {/* Chart: Actual vs Predicted (XGBoost) (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#2167F3]" />
                    <h3 className="text-sm font-bold text-[#0F265C]">
                      Actual vs Predicted (Real Monsoon Event)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    July 2024 Held-Out Series
                  </span>
                </div>

                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5EAF1',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                      <Line type="monotone" dataKey="actual" name="Actual Next-24h (mm)" stroke="#2563EB" strokeWidth={2} dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="predicted" name="XGBoost Predicted (mm)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[10.5px] text-slate-500 border-t border-slate-100">
                14-day continuous validation sequence extracted directly from Srikakulam Town monitoring telemetry during peak monsoon.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. METHODOLOGY & SCIENTIFIC AUDIT FOOTER */}
      <div className="bg-blue-50/50 border border-blue-200/70 rounded-xl p-4 text-xs text-slate-600 space-y-2 shadow-2xs mt-2">
        <div className="font-bold text-[#0F265C] flex items-center gap-2">
          <Info size={15} className="text-[#2167F3]" />
          <span className="text-[13px]">Evaluation Rigor &amp; Reproducibility Standards:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11.5px] text-slate-600">
          <div>
            <strong className="text-slate-800">Unit Discipline:</strong>
            <p className="mt-0.5 leading-relaxed">
              Percentage Points (pp) indicate absolute arithmetic differences (M_new - M_base). Percentage (%) indicates relative improvement. These metrics are strictly segregated across the dashboard to prevent statistical inflation.
            </p>
          </div>
          <div>
            <strong className="text-slate-800">Quantum Transparency:</strong>
            <p className="mt-0.5 leading-relaxed">
              PennyLane 4-qubit VQC and QNN models run on numerical statevector simulators (default.qubit). No physical quantum supremacy is claimed; these models demonstrate hybrid quantum-classical algorithmic integration.
            </p>
          </div>
          <div>
            <strong className="text-slate-800">Zero Leakage Guarantee:</strong>
            <p className="mt-0.5 leading-relaxed">
              Spatial GroupKFold partitioning guarantees that training and test samples occupy mutually exclusive geographic blocks (5.5 km resolution), eliminating spatial autocorrelation and optimistic leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
