"""
Data formatting, timestamp, and serialization utilities.
"""
from datetime import datetime, timezone
import json

def get_utc_timestamp() -> str:
    """Returns ISO-8601 formatted UTC timestamp."""
    return datetime.now(timezone.utc).isoformat()

def format_percentage(val: float) -> str:
    """Format float into rounded percentage."""
    return f"{val * 100.0:.1f}%"

def format_km(val: float) -> str:
    """Format distance in km."""
    return f"{val:.2f} km"
