import os, re
from pathlib import Path

pages_dir = Path(r"c:\Users\nanir\OneDrive\Desktop\GUNA MAIN PROJECT\QuantumVision\frontend\src\pages")

target_pages = [
    "Dashboard.jsx",
    "RainfallForecast.jsx",
    "FloodRiskAssessment.jsx",
    "Alerts.jsx",
    "EvacuationRouting.jsx",
    "Comparisons.jsx",
    "ModelPerformance.jsx",
    "Simulation.jsx",
    "Reports.jsx",
    "DataManagement.jsx",
    "Settings.jsx"
]

print("=== AUDITING API CALLS & FALLBACK SAFETY IN ALL PAGES ===")

for p in target_pages:
    fp = pages_dir / p
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()

    # Find services imported
    service_imports = re.findall(r"from\s+['\"](\.\./services/[^'\"]+)['\"]", content)
    # Find api method calls like fetch*, get*, calculate*
    api_calls = re.findall(r"(fetch[A-Za-z0-9_]+|get[A-Za-z0-9_]+|calculate[A-Za-z0-9_]+|load[A-Za-z0-9_]+)\s*\(", content)
    # Deduplicate
    api_calls = sorted(list(set(api_calls)))
    
    # Check if there is try/catch or .catch in the component
    has_catch = "catch" in content or "try" in content
    
    print(f"\n[{p}]")
    print(f"  Services: {service_imports}")
    print(f"  API Calls Used: {api_calls}")
    print(f"  Error Handling Present: {has_catch}")
