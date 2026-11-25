# QuantumVision Quantum-Inspired Optimization Subsystem

## Overview
The Quantum subsystem is an **optional, modular optimization engine** implementing Quadratic Unconstrained Binary Optimization (QUBO) formulations and Simulated Annealing for emergency evacuation routing and shelter assignment.

## Subsystem Architecture
```
quantum/
├── README.md
├── __init__.py
├── config.py                  # Annealing parameters (T_init, cooling rate, steps)
├── qubo_formulation.py        # Graph mapping to QUBO penalty matrices
├── simulated_annealing.py     # Classical simulated annealing solver
├── route_optimization.py      # Multi-objective path optimization
├── facility_optimization.py   # Capacity-constrained shelter assignment
└── classical_comparison.py    # Side-by-side comparison with Dijkstra and A*
```

## Methodology & Formulation
Evacuation routing is mapped to an energy minimization problem:
$$\min_{x} x^T Q x$$
where binary variable $x_i = 1$ indicates traversal of edge $i$, and matrix $Q$ penalizes:
- Road length / travel duration
- Hazard proximity (flood inundation depth, storm surge)
- Bottleneck road segments

## Scientific Integrity Principles
- **No Quantum Advantage Claims**: Solutions are calculated via classical heuristic simulation.
- **Hardware Agnostic**: Does not require physical quantum processors (D-Wave / IBM Q).
- **Graceful Fallback**: If quantum simulation is disabled or times out, classical Dijkstra/A* routing continues uninterrupted.