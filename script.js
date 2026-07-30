/* ══════════════════════════════════════════════════
   PyDSA — Interactive Tracing & Animations
   ══════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  // ─── Navbar scroll ───
  const nav = document.querySelector(".navbar");
  const btt = document.getElementById("btt");
  window.addEventListener("scroll", () => {
    if (nav) nav.classList.toggle("scrolled", scrollY > 50);
    if (btt) btt.classList.toggle("show", scrollY > 400);
  });

  // ─── Mobile toggle ───
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      const s = toggle.querySelectorAll("span");
      if (links.classList.contains("open")) {
        s[0].style.transform = "rotate(45deg) translate(5px,5px)";
        s[1].style.opacity = "0";
        s[2].style.transform = "rotate(-45deg) translate(5px,-5px)";
      } else {
        s[0].style.transform = "";
        s[1].style.opacity = "";
        s[2].style.transform = "";
      }
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.querySelectorAll("span").forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
    }));
  }

  // ─── Back to top ───
  if (btt) btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ─── Scroll reveal ───
  const els = document.querySelectorAll(".topic-card, .topic-tile");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });
  els.forEach(el => obs.observe(el));

  // ─── Algo tabs ───
  document.querySelectorAll(".algo-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const parent = tab.closest(".topic-card") || document;
      parent.querySelectorAll(".algo-tab").forEach(t => t.classList.remove("active"));
      parent.querySelectorAll(".algo-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      const tgt = document.getElementById("tab-" + tab.dataset.tab);
      if (tgt) tgt.classList.add("active");
    });
  });

  // ─── Copy code buttons ───
  document.querySelectorAll(".code-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const pre = btn.closest(".code-block").querySelector("pre");
      if (!pre) return;
      navigator.clipboard.writeText(pre.textContent).then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1500);
      });
    });
  });

  // ─── Home page counter animation ───
  const statNums = document.querySelectorAll(".stat-num");
  if (statNums.length) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statNums.forEach(el => {
            const target = +el.dataset.target;
            const dur = 1200, start = performance.now();
            (function step(now) {
              const p = Math.min((now - start) / dur, 1);
              el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
              if (p < 1) requestAnimationFrame(step);
              else el.textContent = target + "+";
            })(start);
          });
          counterObs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    const statsBox = document.querySelector(".stats-row");
    if (statsBox) counterObs.observe(statsBox);
  }

  // ─── INTERACTIVE ALGORITHM TRACERS ───

  // 1. Binary Search Tracer
  setupBinarySearchTracer();

  // 2. Interactive Stack Simulator
  setupStackSimulator();

  // 3. Sorting Step Tracer
  setupSortingTracer();
});

/* ─── Binary Search Interactive Tracer ─── */
function setupBinarySearchTracer() {
  const container = document.getElementById("bs-tracer");
  if (!container) return;

  const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  let target = 23;
  let steps = [];
  let currentStep = 0;

  function generateSteps() {
    steps = [];
    let low = 0, high = arr.length - 1;
    let stepNum = 1;

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      let val = arr[mid];
      let msg = "";
      if (val === target) {
        msg = `Step ${stepNum}: mid=${mid} (value ${val}) MATCHES target ${target}! Target found.`;
        steps.push({ low, high, mid, found: true, msg });
        break;
      } else if (val < target) {
        msg = `Step ${stepNum}: mid=${mid} (value ${val}) < target ${target}. Move low to mid+1 (${mid + 1}).`;
        steps.push({ low, high, mid, found: false, msg });
        low = mid + 1;
      } else {
        msg = `Step ${stepNum}: mid=${mid} (value ${val}) > target ${target}. Move high to mid-1 (${mid - 1}).`;
        steps.push({ low, high, mid, found: false, msg });
        high = mid - 1;
      }
      stepNum++;
    }
  }

  function render() {
    generateSteps();
    const stepData = steps[currentStep] || steps[steps.length - 1];

    let html = `
      <div style="margin-bottom:16px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap">
        <label><strong>Target Value:</strong></label>
        <select id="bs-target-select" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);font-family:var(--font-mono);font-size:.9rem">
          ${arr.map(x => `<option value="${x}" ${x === target ? 'selected' : ''}>${x}</option>`).join('')}
          <option value="99" ${target === 99 ? 'selected' : ''}>99 (Not In Array)</option>
        </select>
        <button id="bs-prev" class="code-copy" style="padding:6px 14px" ${currentStep === 0 ? 'disabled' : ''}>← Prev</button>
        <button id="bs-next" class="code-copy" style="padding:6px 14px;background:var(--accent);color:#fff" ${currentStep >= steps.length - 1 ? 'disabled' : ''}>Next →</button>
        <button id="bs-reset" class="code-copy" style="padding:6px 14px">Reset</button>
      </div>

      <div class="visual" style="background:#fff;border:1px solid var(--border)">
        <div style="font-family:var(--font-mono);font-size:.85rem;margin-bottom:12px;color:var(--text-secondary)">
          Step ${currentStep + 1} of ${steps.length} | low: <span style="color:var(--rose);font-weight:700">${stepData.low}</span> | high: <span style="color:var(--blue);font-weight:700">${stepData.high}</span> | mid: <span style="color:var(--emerald);font-weight:700">${stepData.mid}</span>
        </div>

        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:16px 0">
          ${arr.map((val, idx) => {
            let bg = "#f8fafc", border = "var(--border)", color = "var(--text-secondary)", scale = "1";
            let badge = "";

            if (idx === stepData.mid) {
              bg = stepData.found ? "#dcfce7" : "#fef3c7";
              border = stepData.found ? "#22c55e" : "#f59e0b";
              color = stepData.found ? "#15803d" : "#b45309";
              scale = "1.1";
              badge = stepData.found ? "MATCH" : "MID";
            } else if (idx < stepData.low || idx > stepData.high) {
              opacity = "0.35";
              bg = "#f1f5f9";
            }

            return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                <div style="font-size:.7rem;font-weight:700;color:${idx === stepData.low ? 'var(--rose)' : idx === stepData.high ? 'var(--blue)' : 'var(--text-muted)'}">
                  ${idx === stepData.low ? 'LOW' : idx === stepData.high ? 'HIGH' : ''}
                </div>
                <div style="min-width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:2px solid ${border};background:${bg};color:${color};font-family:var(--font-mono);font-weight:700;border-radius:8px;transform:scale(${scale});transition:all .2s">
                  ${val}
                </div>
                <div style="font-size:.7rem;color:var(--text-muted);font-family:var(--font-mono)">[${idx}]</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="output-block" style="text-align:left;margin-top:16px;background:${stepData.found ? '#f0fdf4' : '#eef2ff'};border-color:${stepData.found ? '#86efac' : '#c7d2fe'};color:${stepData.found ? '#166534' : '#3730a3'}">
          ${stepData.msg}
        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById("bs-target-select").addEventListener("change", (e) => {
      target = parseInt(e.target.value, 10);
      currentStep = 0;
      render();
    });
    document.getElementById("bs-prev")?.addEventListener("click", () => { if (currentStep > 0) { currentStep--; render(); } });
    document.getElementById("bs-next")?.addEventListener("click", () => { if (currentStep < steps.length - 1) { currentStep++; render(); } });
    document.getElementById("bs-reset")?.addEventListener("click", () => { currentStep = 0; render(); });
  }

  render();
}

/* ─── Stack Simulator ─── */
function setupStackSimulator() {
  const container = document.getElementById("stack-sim");
  if (!container) return;

  let stack = [10, 20, 30];

  function render() {
    let html = `
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px">
        <input type="text" id="stack-input" placeholder="Value" value="${Math.floor(Math.random()*90)+10}" style="width:80px;padding:6px 10px;border-radius:6px;border:1px solid var(--border);font-family:var(--font-mono);text-align:center">
        <button id="stack-push" class="code-copy" style="background:var(--accent);color:#fff">Push</button>
        <button id="stack-pop" class="code-copy" style="background:var(--rose);color:#fff">Pop</button>
        <button id="stack-clear" class="code-copy">Clear</button>
      </div>

      <div class="visual" style="min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end">
        <div class="visual-title">Stack Memory (LIFO)</div>
        <div style="display:flex;flex-direction:column-reverse;gap:6px;width:180px;margin-top:10px">
          ${stack.length === 0 ? '<div style="color:var(--text-muted);font-style:italic">Stack is Empty</div>' : ''}
          ${stack.map((val, idx) => `
            <div style="padding:10px;background:${idx === stack.length - 1 ? '#ede9fe' : '#eef2ff'};border:2px solid ${idx === stack.length - 1 ? 'var(--purple)' : '#c7d2fe'};border-radius:8px;font-family:var(--font-mono);font-weight:700;color:${idx === stack.length - 1 ? 'var(--purple)' : 'var(--accent)'};display:flex;justify-content:space-between;align-items:center;animation:slideDown .2s">
              <span>${val}</span>
              <span style="font-size:.7rem;opacity:.7">${idx === stack.length - 1 ? '← TOP' : `[${idx}]`}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById("stack-push")?.addEventListener("click", () => {
      const val = document.getElementById("stack-input").value || "40";
      stack.push(val);
      render();
    });
    document.getElementById("stack-pop")?.addEventListener("click", () => {
      if (stack.length > 0) stack.pop();
      render();
    });
    document.getElementById("stack-clear")?.addEventListener("click", () => {
      stack = [];
      render();
    });
  }

  render();
}

/* ─── Sorting Step Tracer ─── */
function setupSortingTracer() {
  const container = document.getElementById("sorting-tracer");
  if (!container) return;

  const initialArr = [64, 34, 25, 12, 22, 11];
  let trace = [];
  let currentStep = 0;

  function generateBubbleTrace() {
    trace = [];
    let arr = [...initialArr];
    let n = arr.length;
    trace.push({ arr: [...arr], i: -1, j: -1, msg: "Initial unsorted array" });

    for (let i = 0; i < n; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          trace.push({ arr: [...arr], i, j, j2: j+1, swap: true, msg: `Compare arr[${j}] (${arr[j]}) & arr[${j+1}] (${arr[j+1]}): ${arr[j]} > ${arr[j+1]} → SWAP!` });
          let temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
          swapped = true;
        } else {
          trace.push({ arr: [...arr], i, j, j2: j+1, swap: false, msg: `Compare arr[${j}] (${arr[j]}) & arr[${j+1}] (${arr[j+1]}): ${arr[j]} ≤ ${arr[j+1]} → OK!` });
        }
      }
      if (!swapped) break;
    }
    trace.push({ arr: [...arr], i: -1, j: -1, done: true, msg: "🎉 Array fully sorted!" });
  }

  generateBubbleTrace();

  function render() {
    const step = trace[currentStep] || trace[0];

    let html = `
      <div style="margin-bottom:16px;display:flex;gap:10px;justify-content:center">
        <button id="sort-prev" class="code-copy" ${currentStep === 0 ? 'disabled' : ''}>← Prev Step</button>
        <span style="font-family:var(--font-mono);font-size:.85rem;align-self:center">Step ${currentStep + 1} of ${trace.length}</span>
        <button id="sort-next" class="code-copy" style="background:var(--accent);color:#fff" ${currentStep >= trace.length - 1 ? 'disabled' : ''}>Next Step →</button>
        <button id="sort-reset" class="code-copy">Reset</button>
      </div>

      <div class="visual" style="background:#fff;border:1px solid var(--border)">
        <div class="visual-title">Bubble Sort Trace — Live Execution</div>
        <div style="display:flex;gap:10px;justify-content:center;margin:20px 0;flex-wrap:wrap">
          ${step.arr.map((val, idx) => {
            let bg = "#eef2ff", border = "#c7d2fe", color = "var(--accent)";
            if (idx === step.j || idx === step.j2) {
              bg = step.swap ? "#fff1f2" : "#fef3c7";
              border = step.swap ? "#fecdd3" : "#fde68a";
              color = step.swap ? "var(--rose)" : "var(--amber)";
            } else if (step.done) {
              bg = "#ecfdf5"; border = "#86efac"; color = "var(--emerald)";
            }
            return `
              <div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;background:${bg};border:2px solid ${border};color:${color};font-family:var(--font-mono);font-weight:800;font-size:1.1rem;border-radius:10px;transition:all .2s">
                ${val}
              </div>
            `;
          }).join('')}
        </div>
        <div class="output-block" style="text-align:left">
          ${step.msg}
        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById("sort-prev")?.addEventListener("click", () => { if (currentStep > 0) { currentStep--; render(); } });
    document.getElementById("sort-next")?.addEventListener("click", () => { if (currentStep < trace.length - 1) { currentStep++; render(); } });
    document.getElementById("sort-reset")?.addEventListener("click", () => { currentStep = 0; render(); });
  }

  render();
}
