const fs = require("fs");
const p = "/home/malika/joupify/soc-cert-extension/extension/popup.js";
let s = fs.readFileSync(p, "utf8");

function replaceBlock() {
  const startLog =
    "📌 About to showDeepSpinner and attach deepAnalysisUpdate listener";
  const endLog = "📌 deepAnalysisUpdate listener attached";
  const startLogIdx = s.indexOf(startLog);
  if (startLogIdx === -1) return false;
  const showIdx = s.indexOf("showDeepSpinner();", startLogIdx);
  if (showIdx === -1) return false;
  const attachedIdx = s.indexOf(endLog, showIdx);
  if (attachedIdx === -1) return false;
  const attachedEnd = s.indexOf(");", attachedIdx);
  if (attachedEnd === -1) return false;
  const blockStart = showIdx;
  const blockEnd = attachedEnd + 2;

  const newBlock = `showDeepSpinner();\n\n        // Safety timeout: hide spinner after 30 seconds if no update received\n        deepSpinnerSafetyTimeout = setTimeout(() => {\n          console.log("⏰ Safety timeout: hiding deep analysis spinner");\n          hideDeepSpinner();\n          deepSpinnerSafetyTimeout = null;\n        }, 30000);\n\n        window.addEventListener("deepAnalysisUpdate", async (event) => {\n          console.log(\n            "🔍 Deep analysis update received:",\n            event.detail,\n            new Date().toISOString()\n          );\n          // Cancel safety timeout since we received an update\n          if (deepSpinnerSafetyTimeout) { clearTimeout(deepSpinnerSafetyTimeout); deepSpinnerSafetyTimeout = null; }\n          // Keep spinner visible while enhanced analysis (Gemini) runs\n          try {\n            await updateWithDeepResults(event.detail);\n          } catch (e) {\n            console.log('⚠️ updateWithDeepResults threw:', e);\n          }\n          // Centralized hide: hide spinner only after updateWithDeepResults completes\n          hideDeepSpinner();\n        });\n\n        console.log(\n          "📌 deepAnalysisUpdate listener attached",\n          new Date().toISOString()\n        );`;

  s = s.slice(0, blockStart) + newBlock + s.slice(blockEnd);
  return true;
}

function ensureVar() {
  const marker = "const resourcesGenerator = new SecurityResourcesGenerator();";
  const varDecl = "let deepSpinnerSafetyTimeout = null;";
  if (s.includes(varDecl)) return false;
  const idx = s.indexOf(marker);
  if (idx === -1) return false;
  s =
    s.slice(0, idx + marker.length) +
    "\n// Safety timer ID for the deep analysis spinner (allows cancelling when results arrive)\n" +
    varDecl +
    "\n" +
    s.slice(idx + marker.length);
  return true;
}

function removeInternalHides() {
  const fnStart = s.indexOf("async function updateWithDeepResults(");
  if (fnStart === -1) return false;
  // find end of function by locating the line with 'console.log("✅ Deep analysis section updated")' then keep a bit after
  const marker = 'console.log("✅ Deep analysis section updated");';
  const markerIdx = s.indexOf(marker, fnStart);
  if (markerIdx === -1) return false;
  const fnEndIdx = s.indexOf("\n}", markerIdx);
  if (fnEndIdx === -1) return false;
  const fnBody = s.slice(fnStart, fnEndIdx);
  const newBody = fnBody.replace(
    /\bhideDeepSpinner\(\);/g,
    "// hideDeepSpinner() removed - centralized in deepAnalysisUpdate listener"
  );
  if (newBody !== fnBody) {
    s = s.slice(0, fnStart) + newBody + s.slice(fnEndIdx);
    return true;
  }
  return false;
}

const r1 = replaceBlock();
const r2 = ensureVar();
const r3 = removeInternalHides();

fs.writeFileSync(p, s, "utf8");
console.log("replaceBlock", r1, "ensureVar", r2, "removeInternalHides", r3);
console.log("Done");
