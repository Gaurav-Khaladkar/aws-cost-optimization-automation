/**
 * AWS Cost Optimization Automation - Client Web Console & Execution Engine
 * Simulates and executes the ebs_stale_snapshosts.py FinOps Governance Logic
 */

// Initial realistic cloud fleet datasets
const SCENARIO_PRESETS = {
  enterprise: [
    {
      snapshotId: "snap-0a81f3b9c47e810a1",
      name: "prod-aurora-postgres-wal-backup",
      volumeId: "vol-08e1b2c459f03d12a",
      volumeStatus: "attached",
      instanceId: "i-094bf418293d08e12",
      instanceState: "running",
      sizeGb: 120,
      createdAt: "2026-09-12T10:14:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-019d3fbc912a78e42",
      name: "dev-temp-redis-cache-snapshot",
      volumeId: "vol-03a1f893e2b904c7d",
      volumeStatus: "detached",
      instanceId: null,
      instanceState: "none",
      sizeGb: 60,
      createdAt: "2026-08-04T14:22:00Z",
      status: "PURGE_UNATTACHED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-07e812d4a98b03c99",
      name: "staging-qa-api-worker-abandoned",
      volumeId: "vol-0994f3c812a0e7b41",
      volumeStatus: "deleted",
      instanceId: null,
      instanceState: "none",
      sizeGb: 250,
      createdAt: "2026-07-19T08:00:00Z",
      status: "PURGE_NO_VOLUME",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-04b39e81249fa021c",
      name: "prod-frontend-assets-cache",
      volumeId: "vol-012ab489fe39a04cd",
      volumeStatus: "attached",
      instanceId: "i-03fa23b901ce489a2",
      instanceState: "running",
      sizeGb: 80,
      createdAt: "2026-10-01T04:30:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-0b92e7410ac39f112",
      name: "ci-test-runner-ephemeral-disk",
      volumeId: null,
      volumeStatus: "none",
      instanceId: null,
      instanceState: "none",
      sizeGb: 100,
      createdAt: "2026-06-11T19:40:00Z",
      status: "PURGE_NO_VOLUME",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-03c48a129ef40b8a6",
      name: "k8s-worker-node-ephemeral-pv",
      volumeId: "vol-044e12c98a0bf3189",
      volumeStatus: "detached",
      instanceId: null,
      instanceState: "none",
      sizeGb: 180,
      createdAt: "2026-08-28T12:00:00Z",
      status: "PURGE_UNATTACHED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-068a1f492b0c3d7e5",
      name: "ml-training-checkpoint-v3",
      volumeId: "vol-077a93b4e12d98f02",
      volumeStatus: "attached",
      instanceId: "i-088c3a91bf23e410a",
      instanceState: "running",
      sizeGb: 500,
      createdAt: "2026-10-10T16:15:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-081cf9941a3e5b021",
      name: "legacy-reporting-service-2023",
      volumeId: "vol-0012e87a3c9b4f5a1",
      volumeStatus: "deleted",
      instanceId: null,
      instanceState: "none",
      sizeGb: 320,
      createdAt: "2025-11-20T09:10:00Z",
      status: "PURGE_NO_VOLUME",
      storageTier: "standard"
    }
  ],
  qa_leakage: [
    {
      snapshotId: "snap-qa-01a",
      name: "qa-teardown-leak-1",
      volumeId: null,
      volumeStatus: "none",
      instanceId: null,
      instanceState: "none",
      sizeGb: 300,
      createdAt: "2026-05-10T00:00:00Z",
      status: "PURGE_NO_VOLUME",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-qa-02b",
      name: "qa-teardown-leak-2",
      volumeId: "vol-qa-orphan-1",
      volumeStatus: "deleted",
      instanceId: null,
      instanceState: "none",
      sizeGb: 450,
      createdAt: "2026-05-11T00:00:00Z",
      status: "PURGE_NO_VOLUME",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-qa-03c",
      name: "qa-unattached-pv-3",
      volumeId: "vol-qa-unattached-1",
      volumeStatus: "detached",
      instanceId: null,
      instanceState: "none",
      sizeGb: 500,
      createdAt: "2026-05-12T00:00:00Z",
      status: "PURGE_UNATTACHED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-qa-04d",
      name: "qa-unattached-pv-4",
      volumeId: "vol-qa-unattached-2",
      volumeStatus: "detached",
      instanceId: null,
      instanceState: "none",
      sizeGb: 350,
      createdAt: "2026-05-13T00:00:00Z",
      status: "PURGE_UNATTACHED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-prod-safe",
      name: "qa-core-bastion-backup",
      volumeId: "vol-qa-active",
      volumeStatus: "attached",
      instanceId: "i-bastion-active",
      instanceState: "running",
      sizeGb: 50,
      createdAt: "2026-10-15T00:00:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    }
  ],
  production_clean: [
    {
      snapshotId: "snap-prod-101",
      name: "prod-db-master-hourly",
      volumeId: "vol-prod-db-1",
      volumeStatus: "attached",
      instanceId: "i-prod-db-01",
      instanceState: "running",
      sizeGb: 600,
      createdAt: "2026-10-17T18:00:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-prod-102",
      name: "prod-elasticsearch-primary",
      volumeId: "vol-prod-es-1",
      volumeStatus: "attached",
      instanceId: "i-prod-es-01",
      instanceState: "running",
      sizeGb: 400,
      createdAt: "2026-10-17T19:00:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    },
    {
      snapshotId: "snap-prod-103",
      name: "prod-app-server-boot",
      volumeId: "vol-prod-app-1",
      volumeStatus: "attached",
      instanceId: "i-prod-app-01",
      instanceState: "running",
      sizeGb: 100,
      createdAt: "2026-10-17T20:00:00Z",
      status: "PROTECTED",
      storageTier: "standard"
    }
  ]
};

// State Store
let state = {
  snapshots: JSON.parse(JSON.stringify(SCENARIO_PRESETS.enterprise)),
  dryRun: true,
  region: "us-east-1",
  activeFilter: "all",
  searchQuery: "",
  isScanning: false,
  logs: []
};

// AWS standard EBS snapshot rate per GB-month
const EBS_RATE_PER_GB_MONTH = 0.05;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderAll();
  initLogTerminal();
  updateRoiCalculator();
});

function setupEventListeners() {
  // Mode switch
  const modeSwitch = document.getElementById("dryRunSwitch");
  const modeLabel = document.getElementById("modeLabel");
  if (modeSwitch && modeLabel) {
    modeSwitch.addEventListener("change", (e) => {
      state.dryRun = !e.target.checked;
      if (state.dryRun) {
        modeLabel.textContent = "DRY RUN (AUDIT)";
        modeLabel.className = "mode-label dry-run";
        showToast("Switched to DRY RUN Mode. No snapshots will be deleted.", "warning");
      } else {
        modeLabel.textContent = "LIVE REMEDIATION";
        modeLabel.className = "mode-label live-purge";
        showToast("WARNING: LIVE MODE ACTIVE. Purge actions will delete snapshots!", "danger");
      }
    });
  }

  // Region Selector
  const regionSelect = document.getElementById("regionSelect");
  if (regionSelect) {
    regionSelect.addEventListener("change", (e) => {
      state.region = e.target.value;
      appendLog("INFO", `Switched active AWS Region context to ${state.region}`);
      showToast(`Active Region: ${state.region}`, "info");
    });
  }

  // Scan Button
  const btnRunScan = document.getElementById("btnRunScan");
  if (btnRunScan) {
    btnRunScan.addEventListener("click", () => runAuditScan());
  }

  // Purge Button
  const btnExecutePurge = document.getElementById("btnExecutePurge");
  if (btnExecutePurge) {
    btnExecutePurge.addEventListener("click", () => executePurgeAction());
  }

  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      renderTable();
    });
  }

  // Filter chips
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      state.activeFilter = e.target.dataset.filter;
      renderTable();
    });
  });

  // Pipeline step click
  document.querySelectorAll(".pipe-card").forEach(card => {
    card.addEventListener("click", () => {
      const step = card.dataset.step;
      if (step === "1") setFilter("all");
      else if (step === "2") setFilter("protected");
      else if (step === "3") setFilter("orphaned");
      else if (step === "4") runAuditScan();
    });
  });

  // Scenario Buttons
  document.querySelectorAll(".scenario-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".scenario-btn").forEach(b => b.classList.remove("active"));
      const target = e.currentTarget;
      target.classList.add("active");
      const scenarioKey = target.dataset.scenario;
      if (SCENARIO_PRESETS[scenarioKey]) {
        state.snapshots = JSON.parse(JSON.stringify(SCENARIO_PRESETS[scenarioKey]));
        appendLog("INFO", `Loaded cloud scenario preset: [${target.querySelector(".scenario-name").textContent}]`);
        renderAll();
        showToast(`Loaded ${scenarioKey} preset (${state.snapshots.length} snapshots)`, "success");
      }
    });
  });

  // Export buttons
  const btnExportCsv = document.getElementById("btnExportCsv");
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", exportCsvReport);
  }

  const btnExportJson = document.getElementById("btnExportJson");
  if (btnExportJson) {
    btnExportJson.addEventListener("click", exportJsonReport);
  }

  // Clear Logs
  const btnClearLogs = document.getElementById("btnClearLogs");
  if (btnClearLogs) {
    btnClearLogs.addEventListener("click", () => {
      state.logs = [];
      const terminal = document.getElementById("terminalBody");
      if (terminal) terminal.innerHTML = "";
      appendLog("INFO", "Terminal stream cleared.");
    });
  }

  // Modal: Add Custom Snapshot
  const btnOpenModal = document.getElementById("btnOpenModal");
  const modal = document.getElementById("addSnapshotModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const addSnapshotForm = document.getElementById("addSnapshotForm");

  if (btnOpenModal && modal) {
    btnOpenModal.addEventListener("click", () => modal.classList.add("open"));
  }
  if (btnCloseModal && modal) {
    btnCloseModal.addEventListener("click", () => modal.classList.remove("open"));
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }
  if (addSnapshotForm) {
    addSnapshotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addNewCustomSnapshot();
      if (modal) modal.classList.remove("open");
    });
  }

  // ROI Calculator inputs
  const sliderSnapshots = document.getElementById("roiSnapshotCount");
  const sliderAvgSize = document.getElementById("roiAvgSize");
  const selectTier = document.getElementById("roiStorageTier");

  if (sliderSnapshots && sliderAvgSize) {
    sliderSnapshots.addEventListener("input", updateRoiCalculator);
    sliderAvgSize.addEventListener("input", updateRoiCalculator);
  }
  if (selectTier) {
    selectTier.addEventListener("change", updateRoiCalculator);
  }
}

function setFilter(filterType) {
  state.activeFilter = filterType;
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.filter === filterType);
  });
  renderTable();
}

function initLogTerminal() {
  appendLog("INFO", "AWS FinOps CloudWatch Client initialized.");
  appendLog("INFO", `Authenticated AWS Identity: arn:aws:iam::12456789012:role/FinOpsSnapshotOptimizer`);
  appendLog("INFO", `Target Region: ${state.region} | EventBridge Schedule: cron(0 1 * * ? *)`);
  appendLog("INFO", "System ready. Click 'Run Scan Audit' to initiate analysis.");
}

// Render Master
function renderAll() {
  updateMetrics();
  renderTable();
}

// Calculate and render top metrics
function updateMetrics() {
  const total = state.snapshots.length;
  let totalGb = 0;
  let orphanedCount = 0;
  let orphanedGb = 0;
  let protectedCount = 0;

  state.snapshots.forEach(s => {
    totalGb += s.sizeGb;
    if (s.status.startsWith("PURGE")) {
      orphanedCount++;
      orphanedGb += s.sizeGb;
    } else {
      protectedCount++;
    }
  });

  const monthlyWaste = orphanedGb * EBS_RATE_PER_GB_MONTH;
  const annualSavings = monthlyWaste * 12;

  // DOM elements
  const elScannedCount = document.getElementById("metricScannedCount");
  const elScannedSub = document.getElementById("metricScannedSub");
  const elOrphanedCount = document.getElementById("metricOrphanedCount");
  const elOrphanedSub = document.getElementById("metricOrphanedSub");
  const elMonthlyWaste = document.getElementById("metricMonthlyWaste");
  const elAnnualSavings = document.getElementById("metricAnnualSavings");
  const elProtectedCount = document.getElementById("metricProtectedCount");

  if (elScannedCount) elScannedCount.textContent = total;
  if (elScannedSub) elScannedSub.textContent = `${totalGb} GB Total Volume`;

  if (elOrphanedCount) elOrphanedCount.textContent = orphanedCount;
  if (elOrphanedSub) elOrphanedSub.textContent = `${orphanedGb} GB Orphaned Data`;

  if (elMonthlyWaste) elMonthlyWaste.textContent = `$${monthlyWaste.toFixed(2)}`;
  if (elAnnualSavings) elAnnualSavings.textContent = `$${annualSavings.toFixed(2)}`;

  if (elProtectedCount) elProtectedCount.textContent = protectedCount;
}

// Render Table
function renderTable() {
  const tbody = document.getElementById("snapshotTableBody");
  if (!tbody) return;

  const filtered = state.snapshots.filter(s => {
    // Search filter
    const matchesSearch = !state.searchQuery ||
      s.snapshotId.toLowerCase().includes(state.searchQuery) ||
      (s.name && s.name.toLowerCase().includes(state.searchQuery)) ||
      (s.volumeId && s.volumeId.toLowerCase().includes(state.searchQuery)) ||
      (s.instanceId && s.instanceId.toLowerCase().includes(state.searchQuery));

    if (!matchesSearch) return false;

    // Category filter
    if (state.activeFilter === "all") return true;
    if (state.activeFilter === "orphaned") return s.status.startsWith("PURGE");
    if (state.activeFilter === "protected") return s.status === "PROTECTED";
    if (state.activeFilter === "novolume") return s.status === "PURGE_NO_VOLUME";
    if (state.activeFilter === "unattached") return s.status === "PURGE_UNATTACHED";

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No EBS snapshots match the current filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isPurge = s.status.startsWith("PURGE");
    const cost = (s.sizeGb * EBS_RATE_PER_GB_MONTH).toFixed(2);
    
    let verdictBadge = "";
    if (s.status === "PURGE_NO_VOLUME") {
      verdictBadge = `<span class="badge-status purge">🔴 Purge: Volume Missing</span>`;
    } else if (s.status === "PURGE_UNATTACHED") {
      verdictBadge = `<span class="badge-status purge">🟠 Purge: Unattached Vol</span>`;
    } else {
      verdictBadge = `<span class="badge-status protected">🟢 Protected: In-Use</span>`;
    }

    let volStateHtml = "";
    if (!s.volumeId) {
      volStateHtml = `<span style="color: #ef4444; font-weight: 600;">No Volume</span>`;
    } else if (s.volumeStatus === "deleted") {
      volStateHtml = `<span style="color: #ef4444;">${s.volumeId} (Deleted)</span>`;
    } else if (s.volumeStatus === "detached") {
      volStateHtml = `<span style="color: #f59e0b;">${s.volumeId} (Detached)</span>`;
    } else {
      volStateHtml = `<span style="color: #10b981;">${s.volumeId} (Attached)</span>`;
    }

    let instanceStateHtml = "";
    if (s.instanceId && s.instanceState === "running") {
      instanceStateHtml = `<span style="color: #10b981;">${s.instanceId} (running)</span>`;
    } else {
      instanceStateHtml = `<span style="color: var(--text-muted);">None</span>`;
    }

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #fff;">${s.name || "unnamed"}</div>
          <div class="mono-tag" style="margin-top: 3px;">${s.snapshotId}</div>
        </td>
        <td><strong>${s.sizeGb} GB</strong></td>
        <td>${volStateHtml}</td>
        <td>${instanceStateHtml}</td>
        <td><span style="font-family: var(--font-mono);">$${cost}/mo</span></td>
        <td>${verdictBadge}</td>
        <td>
          ${isPurge ? `
            <button class="btn btn-sm btn-danger" onclick="deleteSingleSnapshot('${s.snapshotId}')">
              Purge
            </button>
          ` : `
            <button class="btn btn-sm btn-ghost" disabled style="opacity: 0.5;">
              Protected
            </button>
          `}
        </td>
      </tr>
    `;
  }).join("");
}

// Log Terminal Appender
function appendLog(level, message) {
  const terminal = document.getElementById("terminalBody");
  if (!terminal) return;

  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");

  let levelClass = "log-info";
  if (level === "DRY RUN") levelClass = "log-dry";
  else if (level === "DELETED") levelClass = "log-deleted";
  else if (level === "SUMMARY") levelClass = "log-summary";
  else if (level === "ERROR") levelClass = "log-error";

  const logLine = document.createElement("div");
  logLine.className = "log-line";
  logLine.innerHTML = `
    <span class="log-time">${timeStr}</span>
    <span class="${levelClass}">[${level}]</span>
    <span>${escapeHtml(message)}</span>
  `;

  terminal.appendChild(logLine);
  terminal.scrollTop = terminal.scrollHeight;
  state.logs.push(`[${timeStr}] [${level}] ${message}`);
}

function escapeHtml(string) {
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Simulation of ebs_stale_snapshosts.py lambda_handler
async function runAuditScan() {
  if (state.isScanning) return;
  state.isScanning = true;

  const btn = document.getElementById("btnRunScan");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `⏳ Scanning AWS API...`;
  }

  appendLog("INFO", `Starting EBS Stale Snapshot Cost Optimization Audit (DryRun=${state.dryRun})...`);
  
  await sleep(400);
  appendLog("INFO", `ec2.describe_snapshots(OwnerIds=['self']) -> Returned ${state.snapshots.length} total snapshots.`);

  await sleep(350);
  const runningInstances = state.snapshots.filter(s => s.instanceState === "running");
  appendLog("INFO", `ec2.describe_instances(Filters=[{'Name':'instance-state-name', 'Values':['running']}]) -> ${runningInstances.length} active running EC2 instances detected.`);

  let deletedCount = 0;
  let preservedCount = 0;

  for (const s of state.snapshots) {
    await sleep(150);
    const snapId = s.snapshotId;
    const volId = s.volumeId;

    if (!volId) {
      if (state.dryRun) {
        appendLog("DRY RUN", `Snapshot ${snapId} has no source volume. Would delete.`);
      } else {
        appendLog("DELETED", `EBS snapshot ${snapId} as it was not attached to any volume.`);
      }
      deletedCount++;
    } else {
      if (s.volumeStatus === "deleted") {
        if (state.dryRun) {
          appendLog("DRY RUN", `Snapshot ${snapId} associated volume ${volId} not found (InvalidVolume.NotFound). Would delete.`);
        } else {
          appendLog("DELETED", `EBS snapshot ${snapId} as its associated volume was not found.`);
        }
        deletedCount++;
      } else if (s.volumeStatus === "detached") {
        if (state.dryRun) {
          appendLog("DRY RUN", `Snapshot ${snapId} volume ${volId} has no attachments. Would delete.`);
        } else {
          appendLog("DELETED", `EBS snapshot ${snapId} as it was taken from a volume not attached to any running instance.`);
        }
        deletedCount++;
      } else {
        preservedCount++;
      }
    }
  }

  const summary = {
    status: "SUCCESS",
    snapshots_scanned: state.snapshots.length,
    snapshots_purged: deletedCount,
    snapshots_preserved: preservedCount,
    dry_run: state.dryRun
  };

  await sleep(200);
  appendLog("SUMMARY", JSON.stringify(summary));

  if (!state.dryRun && deletedCount > 0) {
    // Actually remove purged from state
    state.snapshots = state.snapshots.filter(s => !s.status.startsWith("PURGE"));
    renderAll();
  }

  state.isScanning = false;
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `⚡ Run Scan Audit`;
  }

  showToast(`Scan complete: ${deletedCount} purge candidates, ${preservedCount} preserved`, state.dryRun ? "warning" : "success");
}

async function executePurgeAction() {
  if (state.dryRun) {
    showToast("Currently in DRY RUN mode! Toggle to 'LIVE REMEDIATION' above to execute deletion.", "warning");
    return;
  }

  const orphans = state.snapshots.filter(s => s.status.startsWith("PURGE"));
  if (orphans.length === 0) {
    showToast("No orphaned snapshots found to purge. Cloud environment is clean!", "success");
    return;
  }

  if (!confirm(`Are you sure you want to permanently delete ${orphans.length} orphaned EBS snapshots?`)) {
    return;
  }

  await runAuditScan();
}

function deleteSingleSnapshot(snapshotId) {
  const index = state.snapshots.findIndex(s => s.snapshotId === snapshotId);
  if (index === -1) return;

  const snap = state.snapshots[index];
  if (state.dryRun) {
    appendLog("DRY RUN", `[Single Purge Request] Snapshot ${snap.snapshotId} (${snap.sizeGb} GB). DryRun=true, skipping actual deletion.`);
    showToast(`[Dry Run] Snapshot ${snap.snapshotId} would be deleted.`, "warning");
  } else {
    appendLog("DELETED", `ec2:DeleteSnapshot(${snap.snapshotId}) executed successfully.`);
    state.snapshots.splice(index, 1);
    renderAll();
    showToast(`Snapshot ${snap.snapshotId} permanently deleted.`, "danger");
  }
}

// Add Custom Snapshot
function addNewCustomSnapshot() {
  const nameInput = document.getElementById("newSnapName");
  const sizeInput = document.getElementById("newSnapSize");
  const volStateSelect = document.getElementById("newSnapVolState");

  const name = nameInput.value.trim() || "custom-workload-snapshot";
  const sizeGb = parseInt(sizeInput.value) || 100;
  const volChoice = volStateSelect.value;

  const randId = Math.random().toString(16).substring(2, 10);
  const snapId = `snap-0${randId}`;
  const volId = volChoice === "none" ? null : `vol-0${randId}b`;

  let status = "PROTECTED";
  let volStatus = "attached";
  let instanceId = `i-0${randId}`;
  let instanceState = "running";

  if (volChoice === "none") {
    status = "PURGE_NO_VOLUME";
    volStatus = "none";
    instanceId = null;
    instanceState = "none";
  } else if (volChoice === "deleted") {
    status = "PURGE_NO_VOLUME";
    volStatus = "deleted";
    instanceId = null;
    instanceState = "none";
  } else if (volChoice === "unattached") {
    status = "PURGE_UNATTACHED";
    volStatus = "detached";
    instanceId = null;
    instanceState = "none";
  }

  const newSnap = {
    snapshotId: snapId,
    name: name,
    volumeId: volId,
    volumeStatus: volStatus,
    instanceId: instanceId,
    instanceState: instanceState,
    sizeGb: sizeGb,
    createdAt: new Date().toISOString(),
    status: status,
    storageTier: "standard"
  };

  state.snapshots.unshift(newSnap);
  appendLog("INFO", `Injected new test snapshot [${snapId}] into inventory. State: ${status}`);
  renderAll();
  showToast(`Added test snapshot ${snapId} (${sizeGb} GB)`, "success");
}

// ROI Calculator
function updateRoiCalculator() {
  const countInput = document.getElementById("roiSnapshotCount");
  const sizeInput = document.getElementById("roiAvgSize");
  const countDisplay = document.getElementById("roiSnapshotCountVal");
  const sizeDisplay = document.getElementById("roiAvgSizeVal");
  const resMonth = document.getElementById("roiMonthlyVal");
  const resYear = document.getElementById("roiAnnualVal");

  if (!countInput || !sizeInput) return;

  const count = parseInt(countInput.value) || 50;
  const sizeGb = parseInt(sizeInput.value) || 100;

  if (countDisplay) countDisplay.textContent = `${count} snapshots`;
  if (sizeDisplay) sizeDisplay.textContent = `${sizeGb} GB`;

  const totalGb = count * sizeGb;
  const monthly = totalGb * EBS_RATE_PER_GB_MONTH;
  const annual = monthly * 12;

  if (resMonth) resMonth.textContent = `$${monthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mo`;
  if (resYear) resYear.textContent = `$${annual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr`;
}

// Export CSV
function exportCsvReport() {
  const headers = ["SnapshotId", "WorkloadName", "SizeGB", "VolumeId", "VolumeStatus", "InstanceState", "MonthlyCostUSD", "Verdict"];
  const rows = state.snapshots.map(s => [
    s.snapshotId,
    `"${s.name}"`,
    s.sizeGb,
    s.volumeId || "NONE",
    s.volumeStatus,
    s.instanceState,
    (s.sizeGb * EBS_RATE_PER_GB_MONTH).toFixed(2),
    s.status
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadFile("aws-ebs-finops-audit.csv", "text/csv", csvContent);
  showToast("Exported CSV FinOps Audit Report.", "success");
}

// Export JSON
function exportJsonReport() {
  const payload = {
    exportedAt: new Date().toISOString(),
    region: state.region,
    totalSnapshots: state.snapshots.length,
    snapshots: state.snapshots
  };
  downloadFile("aws-ebs-finops-inventory.json", "application/json", JSON.stringify(payload, null, 2));
  showToast("Exported JSON Inventory Report.", "success");
}

function downloadFile(filename, type, data) {
  const blob = new Blob([data], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
