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

  // ─── INTERACTIVE TRACERS & SIMULATORS ───
  setupBinarySearchTracer();
  setupStackSimulator();
  setupSortingTracer();
  setupLoopDecisionWizard();
  setupLoopVisualizer();
});

/* ─── 1. LOOP DECISION WIZARD ─── */
function setupLoopDecisionWizard() {
  const container = document.getElementById("loop-wizard");
  if (!container) return;

  const scenarios = [
    {
      title: "Iterating through an array, string, or range where length is known",
      loop: "for item in collection:",
      helper: "Standard for loop",
      code: "for num in nums:\n    print(num)",
      when: "When you simply need to visit every item in order once."
    },
    {
      title: "Need BOTH index and item value while iterating",
      loop: "for idx, item in enumerate(collection):",
      helper: "enumerate()",
      code: "for i, char in enumerate(s):\n    if char == 'a': print(f'Found a at index {i}')",
      when: "When array position/index is required for calculations or returning results (e.g. Two Sum)."
    },
    {
      title: "Iterating through TWO OR MORE arrays in parallel",
      loop: "for a, b in zip(list1, list2):",
      helper: "zip()",
      code: "names = ['Alice', 'Bob']\nscores = [95, 88]\nfor name, score in zip(names, scores):\n    print(name, score)",
      when: "When combining related data stored in separate lists of equal length."
    },
    {
      title: "Unknown number of iterations OR dynamic boundary adjustment (Two Pointers)",
      loop: "while left < right:  OR  while condition:",
      helper: "while loop",
      code: "left, right = 0, len(nums) - 1\nwhile left < right:\n    if nums[left] + nums[right] == target: return [left, right]\n    elif nums[left] + nums[right] < target: left += 1\n    else: right -= 1",
      when: "Binary Search, Two Pointers, Linked List Traversal, Digit Extraction, Sentinel Input."
    },
    {
      title: "Grid, 2D Matrix, or Pairwise Comparison",
      loop: "for r in range(rows):\n    for c in range(cols):",
      helper: "Nested for loops",
      code: "for r in range(len(grid)):\n    for c in range(len(grid[0])):\n        print(grid[r][c])",
      when: "2D Matrix Traversal, Grid Search, Bubble Sort, Finding All Pair Comparisons."
    }
  ];

  let selectedIdx = 0;

  function render() {
    const s = scenarios[selectedIdx];
    let html = `
      <div style="margin-bottom:20px;text-align:center">
        <label style="font-weight:700;margin-right:10px;font-size:.95rem">Select Problem Scenario:</label>
        <select id="wizard-select" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border);font-family:var(--font-body);font-size:.9rem;background:#fff;max-width:100%">
          ${scenarios.map((sc, i) => `<option value="${i}" ${i === selectedIdx ? 'selected' : ''}>${i+1}. ${sc.title}</option>`).join('')}
        </select>
      </div>

      <div class="visual" style="background:#fff;border:2px solid var(--border-hover);text-align:left;padding:28px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
          <span class="section-label" style="margin:0">RECOMMENDED PATTERN</span>
          <span style="font-family:var(--font-mono);font-size:.82rem;background:var(--accent-lighter);color:var(--accent);padding:4px 12px;border-radius:20px;font-weight:700">${s.helper}</span>
        </div>

        <div style="font-family:var(--font-mono);font-size:1.15rem;font-weight:800;color:var(--purple);background:#f5f3ff;padding:12px 18px;border-radius:8px;border-left:4px solid var(--purple);margin-bottom:16px">
          ${s.loop.replace(/\n/g, '<br>')}
        </div>

        <p style="font-size:.95rem;color:var(--text-secondary);margin-bottom:16px">
          <strong>💡 Where to use:</strong> ${s.when}
        </p>

        <div class="code-block" style="margin:0"><div class="code-header"><div class="code-dots"><span></span><span></span><span></span></div><span class="code-filename">starter_template.py</span></div>
          <pre><code>${s.code}</code></pre>
        </div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById("wizard-select").addEventListener("change", (e) => {
      selectedIdx = parseInt(e.target.value, 10);
      render();
    });
  }

  render();
}

/* ─── 2. INTERACTIVE LOOP VISUALIZER & STEP TRACER ─── */
function setupLoopVisualizer() {
  const container = document.getElementById("loop-visualizer");
  if (!container) return;

  const presets = {
    sum: {
      name: "1. Summing Array Elements (for loop)",
      arr: [10, 20, 30, 40],
      code: "total = 0\nfor x in nums:\n    total += x",
      steps: [
        { idx: 0, val: 10, total: 10, msg: "Iteration 1: Add 10 to total (total = 10)" },
        { idx: 1, val: 20, total: 30, msg: "Iteration 2: Add 20 to total (total = 30)" },
        { idx: 2, val: 30, total: 60, msg: "Iteration 3: Add 30 to total (total = 60)" },
        { idx: 3, val: 40, total: 100, msg: "Iteration 4: Add 40 to total (total = 100)" }
      ]
    },
    twopointer: {
      name: "2. Two-Pointer Reverse (while loop)",
      arr: [1, 2, 3, 4],
      code: "left, right = 0, 3\nwhile left < right:\n    arr[left], arr[right] = arr[right], arr[left]\n    left += 1; right -= 1",
      steps: [
        { left: 0, right: 3, arr: [4, 2, 3, 1], msg: "Step 1: Swap arr[0] (1) & arr[3] (4). Move left → 1, right → 2." },
        { left: 1, right: 2, arr: [4, 3, 2, 1], msg: "Step 2: Swap arr[1] (2) & arr[2] (3). Move left → 2, right → 1." },
        { left: 2, right: 1, arr: [4, 3, 2, 1], done: true, msg: "Step 3: left (2) >= right (1) → Condition 'left < right' is FALSE. Loop ends!" }
      ]
    },
    digits: {
      name: "3. Extracting Digits from Number (while num > 0)",
      num: 358,
      code: "num = 358\nwhile num > 0:\n    digit = num % 10\n    num = num // 10",
      steps: [
        { digit: 8, num: 35, msg: "Step 1: 358 % 10 = 8 (extracted last digit). num becomes 358 // 10 = 35." },
        { digit: 5, num: 3, msg: "Step 2: 35 % 10 = 5 (extracted digit). num becomes 35 // 10 = 3." },
        { digit: 3, num: 0, msg: "Step 3: 3 % 10 = 3 (extracted digit). num becomes 3 // 10 = 0." },
        { digit: "-", num: 0, done: true, msg: "Step 4: num is 0 → Condition 'num > 0' is FALSE. Loop ends!" }
      ]
    }
  };

  let activePreset = "sum";
  let stepIdx = 0;

  function render() {
    const p = presets[activePreset];
    const step = p.steps[stepIdx] || p.steps[0];

    let html = `
      <div style="margin-bottom:16px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <select id="preset-select" style="padding:8px 16px;border-radius:8px;border:1px solid var(--border);font-family:var(--font-body);font-size:.9rem;background:#fff">
          ${Object.keys(presets).map(k => `<option value="${k}" ${k === activePreset ? 'selected' : ''}>${presets[k].name}</option>`).join('')}
        </select>
        <button id="lv-prev" class="code-copy" ${stepIdx === 0 ? 'disabled' : ''}>← Prev</button>
        <span style="font-family:var(--font-mono);font-size:.85rem;align-self:center">Step ${stepIdx + 1} of ${p.steps.length}</span>
        <button id="lv-next" class="code-copy" style="background:var(--accent);color:#fff" ${stepIdx >= p.steps.length - 1 ? 'disabled' : ''}>Next →</button>
        <button id="lv-reset" class="code-copy">Reset</button>
      </div>

      <div class="visual" style="background:#fff;border:1px solid var(--border);padding:24px">
        ${activePreset === 'sum' ? `
          <div style="display:flex;gap:8px;justify-content:center;margin:16px 0">
            ${p.arr.map((val, i) => `
              <div style="min-width:48px;height:48px;display:flex;align-items:center;justify-content:center;border:2px solid ${i === step.idx ? 'var(--accent)' : 'var(--border)'};background:${i === step.idx ? '#eef2ff' : '#fff'};color:${i === step.idx ? 'var(--accent)' : 'var(--text-primary)'};font-family:var(--font-mono);font-weight:700;border-radius:8px;transform:${i === step.idx ? 'scale(1.1)' : 'scale(1)'}">
                ${val}
              </div>
            `).join('')}
          </div>
          <div style="font-family:var(--font-mono);font-size:1rem;color:var(--emerald);font-weight:700;margin-bottom:12px">total = ${step.total}</div>
        ` : ''}

        ${activePreset === 'twopointer' ? `
          <div style="display:flex;gap:8px;justify-content:center;margin:16px 0">
            ${step.arr.map((val, i) => `
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                <div style="font-size:.7rem;font-weight:700;color:${i === step.left ? 'var(--rose)' : i === step.right ? 'var(--blue)' : 'transparent'}">
                  ${i === step.left ? 'LEFT' : i === step.right ? 'RIGHT' : '•'}
                </div>
                <div style="min-width:48px;height:48px;display:flex;align-items:center;justify-content:center;border:2px solid ${i === step.left || i === step.right ? 'var(--purple)' : 'var(--border)'};background:${i === step.left || i === step.right ? '#ede9fe' : '#fff'};color:var(--text-primary);font-family:var(--font-mono);font-weight:700;border-radius:8px">
                  ${val}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${activePreset === 'digits' ? `
          <div style="display:flex;gap:24px;justify-content:center;align-items:center;margin:16px 0;font-family:var(--font-mono);font-size:1.1rem">
            <div style="background:#eef2ff;padding:12px 20px;border-radius:8px;border:1px solid #c7d2fe;color:var(--accent)">num: <strong>${step.num}</strong></div>
            <div style="background:#ecfdf5;padding:12px 20px;border-radius:8px;border:1px solid #86efac;color:var(--emerald)">Extracted Digit: <strong>${step.digit}</strong></div>
          </div>
        ` : ''}

        <div class="output-block" style="text-align:left;background:${step.done ? '#ecfdf5' : '#eef2ff'};border-color:${step.done ? '#86efac' : '#c7d2fe'};color:${step.done ? '#166534' : '#3730a3'}">
          ${step.msg}
        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById("preset-select").addEventListener("change", (e) => {
      activePreset = e.target.value;
      stepIdx = 0;
      render();
    });
    document.getElementById("lv-prev")?.addEventListener("click", () => { if (stepIdx > 0) { stepIdx--; render(); } });
    document.getElementById("lv-next")?.addEventListener("click", () => { if (stepIdx < p.steps.length - 1) { stepIdx++; render(); } });
    document.getElementById("lv-reset")?.addEventListener("click", () => { stepIdx = 0; render(); });
  }

  render();
}

/* ─── Binary Search Tracer ─── */
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

            if (idx === stepData.mid) {
              bg = stepData.found ? "#dcfce7" : "#fef3c7";
              border = stepData.found ? "#22c55e" : "#f59e0b";
              color = stepData.found ? "#15803d" : "#b45309";
              scale = "1.1";
            } else if (idx < stepData.low || idx > stepData.high) {
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
