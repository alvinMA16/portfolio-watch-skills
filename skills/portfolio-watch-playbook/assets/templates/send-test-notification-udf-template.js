"use strict";

const env = require("env");
const http = require("net/http");
const secret = require("secret-manager");

const OWNER_USER_ID = "REPLACE_OWNER_USER_ID";
const CRONJOB_ID = REPLACE_CRONJOB_ID;
const API_BASE = "https://api-llm.prd.alva.ai";

function assertOwnerCaller() {
  if (String(env.callerUserId || "") !== OWNER_USER_ID) {
    throw new Error("只有 Playbook 所有者可以发送测试通知。");
  }
}

async function apiFetch(path, options) {
  const apiKey = secret.loadPlaintext("ALVA_API_KEY");
  if (!apiKey) {
    throw new Error("缺少 ALVA_API_KEY，无法发送测试通知。");
  }
  const response = await http.fetch(API_BASE + path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Alva-Api-Key": apiKey,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { text };
    }
  }
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Alva API " + response.status + ": " + (text || "request failed"));
  }
  return data;
}

async function apiFetchWithRetry(path, options, attempts) {
  let lastError = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await apiFetch(path, options);
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await sleep(1000 * (i + 1));
      }
    }
  }
  throw lastError;
}

async function setCronArgs(args) {
  return apiFetchWithRetry("/api/v1/deploy/cronjob/" + CRONJOB_ID, {
    method: "PATCH",
    body: { args },
  }, 3);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRun(workflowRunId) {
  const started = Date.now();
  while (Date.now() - started < 90000) {
    const data = await apiFetch("/api/v1/deploy/cronjob/" + CRONJOB_ID + "/runs?first=10", {});
    const runs = Array.isArray(data && data.runs) ? data.runs : [];
    const match = runs.find((run) => run.workflow_run_id === workflowRunId);
    if (match) {
      if (match.status === "completed") return match;
      if (match.status === "failed") {
        throw new Error(match.error || "测试通知运行失败。");
      }
    }
    await sleep(2500);
  }
  return null;
}

(async () => {
  assertOwnerCaller();
  let workflowRunId = "";
  let result = null;
  let cleanupError = "";
  try {
    await setCronArgs({ testNotification: true });
    const trigger = await apiFetch("/api/v1/deploy/cronjob/" + CRONJOB_ID + "/trigger", {
      method: "POST",
    });
    workflowRunId = String(trigger && trigger.workflow_run_id ? trigger.workflow_run_id : "");
    const run = workflowRunId ? await waitForRun(workflowRunId) : null;
    result = {
      ok: true,
      state: run ? "sent" : "queued",
      workflowRunId,
      runId: run ? run.id : null,
      argsCleared: true,
      message: run ? "测试通知已发出。" : "测试通知已排队，请稍后确认。",
    };
  } finally {
    try {
      await setCronArgs({});
    } catch (error) {
      cleanupError = error && error.message ? error.message : String(error);
    }
  }
  if (result && cleanupError) {
    result.argsCleared = false;
    result.cleanupError = cleanupError;
    result.message += " 测试已触发，但自动清理测试参数失败。";
  }
  return result;
})();
