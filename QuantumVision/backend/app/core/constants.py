"""
QuantumVision Core Constants and System Enumerations.
"""
from enum import Enum

class DisasterType(str, Enum):
    FIRE = "fire"
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    CYCLONE = "cyclone"
    LANDSLIDE = "landslide"
    TSUNAMI = "tsunami"
    SMOKE = "smoke"
    HAIL = "hail"

class SeverityLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"
    EXTREME = "extreme"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    INVESTIGATING = "investigating"
    EVACUATING = "evacuating"

class UserRole(str, Enum):
    ADMIN = "admin"
    RESPONDER = "responder"
    ANALYST = "analyst"
    CITIZEN = "citizen"

class QuantumBackendType(str, Enum):
    AER_SIMULATOR = "aer_simulator"
    STATEVECTOR_SIMULATOR = "statevector_simulator"
    PENNYLANE_DEFAULT = "default.qubit"
    PENNYLANE_LIGHTNING = "lightning.qubit"
    IBM_HARDWARE = "ibm_hardware"
    SIMULATED_NOISY = "simulated_noisy"

class NavigationAlgorithm(str, Enum):
    ASTAR = "astar"
    DIJKSTRA = "dijkstra"
    DYNAMIC_REROUTING = "dynamic_rerouting"
    QUANTUM_OPTIMIZED = "quantum_optimized"

class SimulationEngineType(str, Enum):
    CELLULAR_AUTOMATA = "cellular_automata"
    FARSITE_ROTHERMEL = "farsite_rothermel"
    HYDRODYNAMIC_2D = "hydrodynamic_2d"
    SEISMIC_ATTENUATION = "seismic_attenuation"
    HOLLAND_CYCLONE = "holland_cyclone"
    DIGITAL_TWIN = "digital_twin"

# System Constants
DEFAULT_COORDINATES = {"lat": 37.7749, "lon": -122.4194}  # Default demo center
MAX_HAZARD_RADIUS_KM = 50.0
DEFAULT_QUBIT_COUNT = 4
DEFAULT_QUANTUM_SHOTS = 1024
