import os
from pathlib import Path

pages_dir = Path(r"c:\Users\nanir\OneDrive\Desktop\GUNA MAIN PROJECT\QuantumVision\frontend\src\pages")
src_dir = Path(r"c:\Users\nanir\OneDrive\Desktop\GUNA MAIN PROJECT\QuantumVision\frontend\src")

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

missing_imports = []

print("=== CHECKING ALL 11 APPLICATION PAGES ===")
for page in target_pages:
    fp = pages_dir / page
    if not fp.exists():
        print(f"[MISSING FILE] {page}")
        continue
    with open(fp, "r", encoding="utf-8") as f:
        lines = f.readlines()
    page_missing = 0
    for i, line in enumerate(lines):
        line = line.strip()
        if line.startswith("import ") and " from " in line:
            parts = line.split(" from ")
            raw_mod = parts[-1].strip().rstrip(";").strip("\"'")
            if raw_mod.startswith("."):
                resolved = (pages_dir / raw_mod).resolve()
                found = False
                for ext in ["", ".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.jsx"]:
                    test_p = Path(str(resolved) + ext)
                    if test_p.exists():
                        found = True
                        break
                if not found:
                    missing_imports.append((page, i+1, raw_mod))
                    page_missing += 1
    status = "OK" if page_missing == 0 else f"ERRORS ({page_missing} missing)"
    print(f" - {page:<25} : {len(lines):>4} lines | Imports: {status}")

print(f"\nTotal unresolved relative imports: {len(missing_imports)}")
for p, l, m in missing_imports:
    print(f"  [UNRESOLVED] {p}:{l} -> {m}")
