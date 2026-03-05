import os

css_to_add = """
/* Missing Execution Section Classes (V20 Port) */
.axiom-animate-scale-in { animation: scaleIn 0.3s ease-out; }
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.axiom-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.axiom-empty-binder { padding: 40px; text-align: center; color: var(--c-dim); font-size: 13px; border: 1px dashed var(--c-border); border-radius: 6px; }

.axiom-flex-between { display: flex; justify-content: space-between; align-items: center; }
.axiom-flex-end { display: flex; justify-content: flex-end; align-items: center; }
.axiom-flex-row { display: flex; align-items: center; gap: 8px; }
.axiom-flex-sb-center-p5-bb { display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid var(--c-border); }

.axiom-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 999; display: flex; align-items: center; justify-content: center; }
.axiom-modal-content { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 6px; padding: 24px; min-width: 400px; color: var(--c-text); }
.axiom-modal-header { font-size: 18px; color: var(--c-gold); margin-bottom: 16px; font-weight: 600; letter-spacing: 1px; }

.axiom-permit-timeline-item { border-left: 2px solid var(--c-border); padding-left: 14px; position: relative; margin-left: 6px; padding-bottom: 16px; }
.axiom-select-transparent { background: transparent; border: none; color: inherit; font-family: inherit; font-size: inherit; outline: none; cursor: pointer; padding: 2px; }

.axiom-stack-15-pl10 { display: flex; flex-direction: column; gap: 15px; padding-left: 10px; }
.axiom-stack-18-mb { display: flex; flex-direction: column; margin-bottom: 18px; }
.axiom-stack-20-mb { display: flex; flex-direction: column; margin-bottom: 20px; }

.axiom-table-container { width: 100%; overflow-x: auto; }

/* Table specifics - fixes persuasive contrast issue in Execution */
.axiom-td-11-gold-p10-bb { font-size: 11px; color: var(--c-gold); padding: 10px; border-bottom: 1px solid var(--c-border2); }
.axiom-td-12-dim-p8-bb { font-size: 12px; color: var(--c-dim); padding: 8px; border-bottom: 1px solid var(--c-border2); }
.axiom-td-12-gold-mono-p8-bb { font-size: 12px; color: var(--c-gold); font-family: monospace; padding: 8px; border-bottom: 1px solid var(--c-border2); }
.axiom-td-13-p10-bb { font-size: 13px; color: var(--c-text); padding: 10px; border-bottom: 1px solid var(--c-border2); }
.axiom-td-13-p8-bb { font-size: 13px; color: var(--c-text); padding: 8px; border-bottom: 1px solid var(--c-border2); }
.axiom-td-p10-bb { padding: 10px; border-bottom: 1px solid var(--c-border2); color: var(--c-text); }
.axiom-td-p8-bb { padding: 8px; border-bottom: 1px solid var(--c-border2); color: var(--c-text); }
.axiom-td-right-11-dim-p10-bb { text-align: right; font-size: 11px; color: var(--c-dim); padding: 10px; border-bottom: 1px solid var(--c-border2); }
.axiom-td-right-p10-bb { text-align: right; padding: 10px; border-bottom: 1px solid var(--c-border2); color: var(--c-text); }
.axiom-td-right-p8-bb { text-align: right; padding: 8px; border-bottom: 1px solid var(--c-border2); color: var(--c-text); }

.axiom-th-left-10-dim-p8-bb { text-align: left; font-size: 10px; color: var(--c-dim); padding: 8px; border-bottom: 1px solid var(--c-border); letter-spacing: 1px; text-transform: uppercase; }
.axiom-th-left-10-dim-p10-bb { text-align: left; font-size: 10px; color: var(--c-dim); padding: 10px; border-bottom: 1px solid var(--c-border); letter-spacing: 1px; text-transform: uppercase; }
.axiom-th-right-10-dim-p10-bb { text-align: right; font-size: 10px; color: var(--c-dim); padding: 10px; border-bottom: 1px solid var(--c-border); letter-spacing: 1px; text-transform: uppercase; }
.axiom-th-right-10-dim-p8-bb { text-align: right; font-size: 10px; color: var(--c-dim); padding: 8px; border-bottom: 1px solid var(--c-border); letter-spacing: 1px; text-transform: uppercase; }
"""

theme_file = r"C:\Users\bkala\.gemini\antigravity\scratch\axiom\frontend\src\v1\components\ui\theme.css"
with open(theme_file, "a", encoding="utf-8") as f:
    f.write("\n" + css_to_add + "\n")
