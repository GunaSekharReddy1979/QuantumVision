from pathlib import Path

path = Path('frontend/src/map/FloodLayer.jsx')
content = path.read_text(encoding='utf-8')

# Replace the tooltip
start_str = "            const tooltipContent = `"
end_str = "            });"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

new_tooltip_block = """            const severityBadge =
              severity === 'CRITICAL'
                ? 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;'
                : severity === 'HIGH'
                ? 'background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE;'
                : 'background:#F0FDF4; color:#15803D; border:1px solid #BBF7D0;';

            const tooltipContent = `
              <div style="background:#FFFFFF; color:#0F265C; padding:8px 11px; border-radius:8px; font-family:Inter, sans-serif; font-size:11px; border:1px solid #DCE7F6; box-shadow:0 4px 14px rgba(15,38,92,0.12); min-width:190px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #F1F5F9; padding-bottom:4px;">
                  <span style="color:#0284C7; font-weight:700; font-size:9.5px; text-transform:uppercase; letter-spacing:0.5px;">SAR Inundation Zone</span>
                  <span style="${severityBadge} font-weight:700; font-size:9px; padding:1px 6px; border-radius:4px;">${severity}</span>
                </div>
                <div style="font-weight:700; color:#0F265C; font-size:11.5px; margin-bottom:4px; line-height:1.2;">${zoneName}</div>
                <div style="color:#64748B; font-size:10.5px; line-height:1.4;">Est. Water Depth: <strong style="color:#0F265C;">${depth} m</strong></div>
                <div style="color:#64748B; font-size:10.5px; line-height:1.4;">SAR Backscatter: <strong style="color:#0284C7;">${props.vv_backscatter_db ?? -22.5} dB</strong></div>
                <div style="margin-top:6px; font-size:9.5px; font-weight:600; color:#2167F3; text-align:center; padding-top:4px; border-top:1px dashed #E2E8F0;">Click zone to inspect evacuation risk</div>
              </div>
            `;

            layer.bindTooltip(tooltipContent, {
              direction: 'top',
              className: 'light-tooltip',
              sticky: true,
            });"""

updated_content = content[:start_idx] + new_tooltip_block + content[end_idx:]
path.write_text(updated_content, encoding='utf-8')
print("Updated FloodLayer.jsx tooltip cleanly.")
