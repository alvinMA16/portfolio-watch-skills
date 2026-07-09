"use strict";

const http = require("net/http");
const env = require("env");
const secret = require("secret-manager");
const { Feed, feedPath, makeDoc, num, str } = require("@alva/feed");

// Replace every REPLACE_* value before deploying this template.
const CONFIG = {
  feedName: "REPLACE_FEED_NAME",
  playbookUrl: "REPLACE_PLAYBOOK_URL",
  primaryBenchmark: "SPY",
  benchmarks: ["SPY", "QQQ"],
  sensitivity: "balanced",
  lookbackDays: 260,
  duplicateCooldownDays: 7,
  redPortfolioImpactPct: 1.5,
  initialSubscriptionConfirmation: true,
  portfolio: [
    { symbol: "REPLACE_SYMBOL", weight: 1 },
  ],
};

const ARRAYS_BASE = "https://data-tools.prd.space.id";

const feed = new Feed({
  path: feedPath(CONFIG.feedName),
  name: "Portfolio Watch",
  description:
    "Portfolio watch feed with attention-ranked signals, alert audit rows, and push notification sidecar.",
});

feed.def("portfolio", {
  summary: makeDoc("Portfolio Watch Summary", "Latest portfolio watch snapshot", [
    str("universe"),
    str("weighting"),
    str("benchmark"),
    str("benchmarks"),
    str("asOf"),
    num("tickerCount"),
    num("portfolioIndex"),
    num("return1d"),
    num("return1w"),
    num("return1m"),
    num("attentionCount"),
    num("highSignalCount"),
    num("redSignalCount"),
    num("yellowSignalCount"),
    str("riskState"),
    str("bigStatusColor"),
    str("bigStatusLabel"),
    str("bigStatusBody"),
    str("portfolioScope"),
    str("missingSymbols"),
    str("missingBenchmarks"),
  ]),
  equity: makeDoc("Portfolio Equity", "Normalized portfolio and benchmark path", [
    num("portfolioIndex"),
    num("benchmarkIndex"),
    num("constituentCount"),
  ]),
});

feed.def("watch", {
  assets: makeDoc("Watch Assets", "Ticker-level portfolio watch metrics", [
    str("symbol"),
    str("name"),
    str("sector"),
    str("industry"),
    str("asOf"),
    num("watchWeightPct"),
    num("close"),
    num("volume"),
    num("return1d"),
    num("return1w"),
    num("return1m"),
    num("benchmarkReturn1d"),
    num("relativeReturn1d"),
    num("medianAbsReturn60d"),
    num("volumeRatio20d"),
    num("moveVsNormal"),
    num("rangeRatio20d"),
    num("rsi14"),
    num("ma20"),
    num("ma60"),
    num("ma20DistancePct"),
    num("ma60DistancePct"),
    num("peRatio"),
    num("marketCap"),
    num("attentionScore"),
    num("technicalScore"),
    str("primaryTechnicalDriver"),
    str("technicalSummary"),
    str("priceState"),
    str("volumeState"),
    str("trendState"),
    str("volatilityState"),
    str("reviewColor"),
    str("reviewLabel"),
    str("reviewReason"),
    str("portfolioScope"),
    str("confirmationStatus"),
    str("severity"),
    str("state"),
  ]),
});

feed.def("history", {
  prices: makeDoc("Daily Prices", "Daily close and normalized close by ticker", [
    str("symbol"),
    num("close"),
    num("normalized"),
    num("volume"),
  ]),
});

feed.def("chart", {
  series: makeDoc("Chart Series", "Unified normalized portfolio, holding, and benchmark paths", [
    str("seriesType"),
    str("symbol"),
    str("label"),
    num("normalized"),
    num("close"),
    num("weightPct"),
  ]),
});

feed.def("signals", {
  events: makeDoc("Attention Signals", "Ranked signal candidates", [
    str("signalId"),
    str("symbol"),
    str("severity"),
    num("score"),
    str("title"),
    str("reason"),
    str("evidence"),
    str("technicalSummary"),
    str("triggerType"),
    str("primaryTechnicalDriver"),
    str("priceState"),
    str("volumeState"),
    str("trendState"),
    str("volatilityState"),
    str("reviewColor"),
    str("reviewLabel"),
    str("reviewReason"),
    str("portfolioScope"),
    str("confirmationStatus"),
    str("evidencePresent"),
    str("evidenceMissing"),
    num("portfolioImpactPct"),
    num("metricValue"),
    num("baseline"),
    str("asOf"),
    str("dedupKey"),
    str("deepLinkAnchor"),
  ]),
});

feed.def("alerts", {
  events: makeDoc("Alert Events", "High-severity alert candidates and quiet audit rows", [
    str("signalId"),
    str("symbol"),
    str("severity"),
    str("title"),
    str("body"),
    num("portfolioImpactPct"),
    str("triggerType"),
    str("asOf"),
    str("dedupKey"),
    str("deepLinkAnchor"),
    str("deliveryState"),
  ]),
  decision: makeDoc("Alert Decision", "Plain-language notification decision for the current run", [
    str("notificationState"),
    str("decisionTitle"),
    str("decisionBody"),
    str("bigStatusColor"),
    str("bigStatusLabel"),
    str("bigStatusBody"),
    str("portfolioScope"),
    str("notificationAudit"),
    str("topSignalId"),
    str("topSymbol"),
    str("topSeverity"),
    str("quietReason"),
    str("nextAction"),
    str("nextTrigger"),
    num("score"),
    num("threshold"),
    num("portfolioImpactPct"),
    str("asOf"),
    str("deepLinkAnchor"),
    num("cooldownDays"),
  ]),
});

feed.def("notify", {
  message: makeDoc("Notification", "Push notification sidecar", [
    str("title"),
    str("body"),
  ]),
});

feed.def("capability", {
  status: makeDoc("Watch Capability", "What this Portfolio Watch build checks and does not check", [
    str("checkedItems"),
    str("notCheckedItems"),
    str("decisionLimit"),
  ]),
});

function assertConfigured() {
  if (!CONFIG.feedName || CONFIG.feedName.indexOf("REPLACE_") >= 0) {
    throw new Error("Configure CONFIG.feedName before running");
  }
  if (!Array.isArray(CONFIG.portfolio) || !CONFIG.portfolio.length) {
    throw new Error("CONFIG.portfolio must contain at least one symbol");
  }
  CONFIG.portfolio.forEach((row) => {
    if (!row.symbol || row.symbol.indexOf("REPLACE_") >= 0) {
      throw new Error("Replace placeholder portfolio symbols before running");
    }
  });
}

function queryString(params) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])))
    .join("&");
}

async function arraysGet(path, params) {
  const jwt = secret.loadPlaintext("ARRAYS_JWT");
  if (!jwt) throw new Error("Missing ARRAYS_JWT");

  const url = ARRAYS_BASE + path + "?" + queryString(params);
  const resp = await http.fetch(url, {
    headers: { Authorization: "Bearer " + jwt },
  });
  const text = await resp.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (error) {
    throw new Error("Arrays JSON parse failed for " + path + ": " + text.slice(0, 200));
  }
  if (!resp.ok) {
    throw new Error("Arrays request failed for " + path + " status=" + resp.status + " body=" + text.slice(0, 300));
  }
  if (!body || !Array.isArray(body.data)) {
    throw new Error("Arrays response missing data[] for " + path);
  }
  return body.data;
}

function normalizePortfolio() {
  const rows = CONFIG.portfolio.map((row) => ({
    symbol: String(row.symbol || "").trim().toUpperCase(),
    rawWeight: typeof row.weight === "number" && Number.isFinite(row.weight) && row.weight > 0 ? row.weight : null,
  }));
  const hasAllWeights = rows.every((row) => row.rawWeight !== null);
  const total = hasAllWeights ? rows.reduce((sum, row) => sum + row.rawWeight, 0) : rows.length;
  return rows.map((row) => ({
    symbol: row.symbol,
    weight: hasAllWeights ? row.rawWeight / total : 1 / rows.length,
  }));
}

function round(value, decimals) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const scale = Math.pow(10, decimals);
  return Math.round(value * scale) / scale;
}

function pctChange(now, then) {
  if (typeof now !== "number" || typeof then !== "number" || !Number.isFinite(now) || !Number.isFinite(then) || then === 0) {
    return null;
  }
  return ((now / then) - 1) * 100;
}

function average(values) {
  const clean = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function median(values) {
  const clean = values.filter((value) => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
}

function clamp01(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function pickPrior(bars, tradingDaysBack) {
  const idx = bars.length - 1 - tradingDaysBack;
  return idx >= 0 ? bars[idx] : null;
}

function latestValue(metricRows) {
  if (!metricRows.length || !Array.isArray(metricRows[0].values)) return null;
  for (let i = 0; i < metricRows[0].values.length; i += 1) {
    const value = metricRows[0].values[i].value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

async function getMetric(symbol, indicator, startSec, endSec) {
  const rows = await arraysGet("/api/v1/stocks/market-metrics", {
    symbol,
    indicator,
    interval: "1d",
    start_time: startSec,
    end_time: endSec,
  });
  return latestValue(rows);
}

function dailyReturns(bars, maxCount) {
  const out = [];
  for (let i = Math.max(1, bars.length - maxCount); i < bars.length; i += 1) {
    const value = pctChange(bars[i].price_close, bars[i - 1].price_close);
    if (value !== null) out.push(value);
  }
  return out;
}

function medianVolume(bars, maxCount) {
  const recent = bars.slice(Math.max(0, bars.length - maxCount)).map((bar) => bar.volume_traded || 0);
  return median(recent);
}

function barRangePct(bar) {
  const high = bar && typeof bar.price_high === "number" ? bar.price_high : null;
  const low = bar && typeof bar.price_low === "number" ? bar.price_low : null;
  const close = bar && typeof bar.price_close === "number" ? bar.price_close : null;
  if (high === null || low === null || close === null || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close) || close <= 0 || high < low) {
    return null;
  }
  return ((high - low) / close) * 100;
}

function dailyRanges(bars, maxCount) {
  const sample = bars.slice(Math.max(0, bars.length - maxCount));
  const out = [];
  sample.forEach((bar) => {
    const value = barRangePct(bar);
    if (value !== null) out.push(value);
  });
  return out;
}

function signedPctText(value, decimals) {
  const rounded = round(value, decimals);
  if (rounded === null) return "--";
  return (rounded >= 0 ? "+" : "") + String(rounded) + "%";
}

function ratioText(value, decimals) {
  const rounded = round(value, decimals);
  if (rounded === null) return "--";
  return String(rounded) + "x";
}

function sensitivityThresholds() {
  if (CONFIG.sensitivity === "aggressive") return { high: 60, medium: 40 };
  if (CONFIG.sensitivity === "conservative") return { high: 80, medium: 55 };
  return { high: 70, medium: 45 };
}

function severityFor(score) {
  const thresholds = sensitivityThresholds();
  if (score >= thresholds.high) return "high";
  if (score >= thresholds.medium) return "medium";
  return "low";
}

function primaryTrigger(parts) {
  const sorted = parts.slice().sort((a, b) => b.score - a.score);
  return sorted.length ? sorted[0] : { type: "context", label: "No material signal", value: null, baseline: null, score: 0 };
}

function primaryTechnicalDriver(parts) {
  const sorted = parts.slice().sort((a, b) => b.score - a.score);
  return sorted.length ? sorted[0].driver : "price";
}

function priceStateLabel(return1d, moveSurprise, relativeSurprise) {
  const direction = return1d === null || return1d >= 0 ? "up" : "down";
  if (moveSurprise >= 0.85 || relativeSurprise >= 0.85) return direction === "down" ? "abnormal down" : "abnormal up";
  if (moveSurprise >= 0.55 || relativeSurprise >= 0.55) return direction === "down" ? "weak" : "firm";
  return "normal";
}

function volumeStateLabel(volumeRatio20d) {
  if (volumeRatio20d === null) return "volume unknown";
  if (volumeRatio20d >= 2.5) return "volume spike";
  if (volumeRatio20d >= 1.5) return "volume elevated";
  return "normal volume";
}

function trendStateLabel(ma20DistancePct, ma60DistancePct, stretch) {
  if (ma20DistancePct === null && ma60DistancePct === null) return "trend unknown";
  if (stretch >= 0.75) return "stretched";
  if ((ma20DistancePct || 0) >= 2 && (ma60DistancePct === null || ma60DistancePct >= 0)) return "trend firm";
  if ((ma20DistancePct || 0) <= -2 && (ma60DistancePct === null || ma60DistancePct <= 0)) return "trend weak";
  return "trend stable";
}

function volatilityStateLabel(moveVsNormal, rangeRatio20d) {
  const level = Math.max(moveVsNormal || 0, rangeRatio20d || 0);
  if (!level) return "volatility unknown";
  if (level >= 2) return "volatility expanded";
  if (level >= 1.3) return "volatility elevated";
  return "normal volatility";
}

function statusLabel(color) {
  if (color === "red") return "请立即关注";
  if (color === "yellow") return "留意一下";
  return "无需关注";
}

function statusBody(color) {
  if (color === "red") return "有重大变化，建议现在查看。";
  if (color === "yellow") return "有变化值得看看，但还不到需要立刻处理。";
  return "当前没有值得你查看的变化。";
}

function reviewPriority(color) {
  if (color === "red") return 3;
  if (color === "yellow") return 2;
  return 1;
}

function driverLabel(driver) {
  if (driver === "volume") return "成交量";
  if (driver === "trend") return "趋势";
  if (driver === "volatility") return "波动率";
  return "价格";
}

function reviewColorFor(scored) {
  if (scored.severity === "high" && scored.portfolioImpactPct >= CONFIG.redPortfolioImpactPct) return "red";
  if (scored.severity === "high" || scored.severity === "medium") return "yellow";
  return "green";
}

function confirmationStatus(scored) {
  if (scored.volumeState === "volume spike" || scored.volumeState === "volume elevated") {
    return "成交量有放大，但仍未接入新闻、财报或预期变化确认。";
  }
  return "成交量没有明显放大，且本版本未接入新闻、财报或预期变化确认。";
}

function buildReviewReason(symbol, color, returns, scored) {
  if (color === "red") {
    return symbol + " 出现较大异常，且对组合影响较明显，建议现在查看。";
  }
  if (color === "yellow") {
    return symbol + " 今天" + driverLabel(scored.primaryTechnicalDriver) + "有变化值得看看，但还不到需要立刻处理。";
  }
  return symbol + " 当前没有值得你查看的变化。";
}

function buildEvidencePresent(returns, scored, technicalInputs) {
  return [
    "1D " + signedPctText(returns.return1d, 2),
    "组合影响 " + signedPctText(scored.portfolioImpactPct, 2),
    "成交量 " + ratioText(technicalInputs.volumeRatio20d, 2) + " 20日中位数",
    "波动 " + ratioText(technicalInputs.moveVsNormal, 2) + " 平常水平",
  ].join("；");
}

function buildEvidenceMissing() {
  return "本版本未接入新闻、财报、分析师预期或公司催化剂，所以不会把单纯技术异动说成持仓逻辑变化。";
}

function buildTechnicalSummary(symbol, returns, scored, technicalInputs) {
  const posture = scored.severity === "low" ? "technical picture is calm" : "technical picture needs a look";
  return symbol + " " + posture + ": price " + scored.priceState + " at " + signedPctText(returns.return1d, 2) +
    " today; volume " + ratioText(technicalInputs.volumeRatio20d, 2) + " the 20-day median; trend " +
    scored.trendState + " (MA20 " + signedPctText(technicalInputs.ma20DistancePct, 2) + ", MA60 " +
    signedPctText(technicalInputs.ma60DistancePct, 2) + "); volatility " + scored.volatilityState +
    " (" + ratioText(technicalInputs.moveVsNormal, 2) + " normal move, " +
    ratioText(technicalInputs.rangeRatio20d, 2) + " normal range).";
}

function scoreAsset(input) {
  const return1d = input.returns.return1d;
  const absReturn = return1d === null ? 0 : Math.abs(return1d);
  const moveBaseline = input.medianAbsReturn60d || 2;
  const moveSurprise = clamp01(absReturn / Math.max(1, 1.75 * moveBaseline));
  const relativeSurprise = input.relativeReturn1d === null ? 0 : clamp01(Math.abs(input.relativeReturn1d) / Math.max(1, 1.75 * moveBaseline));
  const volumeSurprise = input.volumeRatio20d === null || input.volumeRatio20d <= 1 ? 0 : clamp01(Math.log(input.volumeRatio20d) / Math.log(3));
  const ma20Pressure = input.ma20DistancePct === null ? 0 : clamp01(Math.abs(input.ma20DistancePct) / 8);
  const ma60Pressure = input.ma60DistancePct === null ? 0 : clamp01(Math.abs(input.ma60DistancePct) / 12);
  const trendPressure = clamp01(0.65 * ma20Pressure + 0.35 * ma60Pressure);
  const stretch =
    typeof input.metrics.rsi14 === "number" && input.metrics.rsi14 > 70
      ? clamp01((input.metrics.rsi14 - 70) / 15)
      : typeof input.metrics.rsi14 === "number" && input.metrics.rsi14 < 35
        ? clamp01((35 - input.metrics.rsi14) / 15)
        : 0;
  const rangeSurprise = input.rangeRatio20d === null || input.rangeRatio20d <= 1 ? 0 : clamp01(Math.log(input.rangeRatio20d) / Math.log(2.5));
  const moveVsNormalScore = input.moveVsNormal === null || input.moveVsNormal <= 1 ? 0 : clamp01((input.moveVsNormal - 1) / 1.75);
  const priceScore = clamp01(0.7 * moveSurprise + 0.3 * relativeSurprise);
  const trendScore = clamp01(0.65 * trendPressure + 0.35 * stretch);
  const volatilityScore = clamp01(0.65 * moveVsNormalScore + 0.35 * rangeSurprise);
  const abnormality =
    0.45 * priceScore +
    0.15 * volumeSurprise +
    0.20 * trendScore +
    0.20 * volatilityScore;
  const portfolioImpactPct = input.weight * absReturn;
  const impactSurprise = clamp01(portfolioImpactPct / 2);
  const relevance = clamp01(0.75 * impactSurprise + 0.25 * input.weightImportance);
  const explainability = abnormality > 0.25 || relevance > 0.35 ? 1 : 0.5;
  const score = Math.round(100 * (0.5 * abnormality + 0.35 * relevance + 0.15 * explainability));
  const technicalScore = Math.round(100 * clamp01(0.45 * priceScore + 0.2 * volumeSurprise + 0.2 * trendScore + 0.15 * volatilityScore));
  const severity = severityFor(score);

  const parts = [
    { type: "price-move", label: "Price move versus recent noise", value: absReturn, baseline: moveBaseline, score: priceScore },
    { type: "relative-move", label: "Relative move versus benchmark", value: input.relativeReturn1d, baseline: 0, score: relativeSurprise },
    { type: "volume-spike", label: "Volume versus 20-day median", value: input.volumeRatio20d, baseline: 1, score: volumeSurprise },
    { type: "trend-pressure", label: "Trend pressure versus MA20/MA60", value: input.ma20DistancePct, baseline: 0, score: trendScore },
    { type: "volatility-expansion", label: "Volatility versus normal range", value: input.rangeRatio20d, baseline: 1, score: volatilityScore },
    { type: "rsi-stretch", label: "RSI stretch", value: input.metrics.rsi14, baseline: 70, score: stretch },
  ];
  const technicalParts = [
    { driver: "price", score: priceScore },
    { driver: "volume", score: volumeSurprise },
    { driver: "trend", score: trendScore },
    { driver: "volatility", score: volatilityScore },
  ];
  const trigger = primaryTrigger(parts);
  const driver = primaryTechnicalDriver(technicalParts);

  let state = "normal";
  if (severity === "high") state = "alert";
  else if (severity === "medium") state = "watch";

  return {
    score,
    severity,
    state,
    abnormality,
    relevance,
    portfolioImpactPct,
    trigger,
    technicalScore,
    primaryTechnicalDriver: driver,
    priceState: priceStateLabel(return1d, moveSurprise, relativeSurprise),
    volumeState: volumeStateLabel(input.volumeRatio20d),
    trendState: trendStateLabel(input.ma20DistancePct, input.ma60DistancePct, stretch),
    volatilityState: volatilityStateLabel(input.moveVsNormal, input.rangeRatio20d),
  };
}

async function buildBars(symbol, startSec, endSec) {
  const rows = await arraysGet("/api/v1/stocks/kline", {
    symbol,
    start_time: startSec,
    end_time: endSec,
    interval: "1d",
    limit: CONFIG.lookbackDays + 40,
  });
  const bars = rows
    .filter((bar) => typeof bar.price_close === "number" && Number.isFinite(bar.price_close))
    .slice()
    .sort((a, b) => a.time_open - b.time_open);
  if (bars.length < 30) throw new Error(symbol + " returned fewer than 30 daily bars");
  return bars;
}

async function buildSymbol(row, benchmarkReturns, startSec, endSec, nowMs, maxWeight) {
  const bars = await buildBars(row.symbol, startSec, endSec);
  const detailRows = await arraysGet("/api/v1/stocks/company/detail", { symbol: row.symbol });
  if (!detailRows.length) throw new Error(row.symbol + " company detail empty");
  const detail = detailRows[0];

  const metricStart = endSec - 420 * 86400;
  const metrics = {
    rsi14: await getMetric(row.symbol, "RSI_14", metricStart, endSec),
    ma20: await getMetric(row.symbol, "MA_20", metricStart, endSec),
    ma60: await getMetric(row.symbol, "MA_60", metricStart, endSec),
    peRatio: await getMetric(row.symbol, "PE_RATIO", metricStart, endSec),
    marketCap: await getMetric(row.symbol, "MARKET_CAP", metricStart, endSec),
  };

  const latest = bars[bars.length - 1];
  const returns = {
    return1d: pctChange(latest.price_close, pickPrior(bars, 1)?.price_close),
    return1w: pctChange(latest.price_close, pickPrior(bars, 5)?.price_close),
    return1m: pctChange(latest.price_close, pickPrior(bars, 21)?.price_close),
  };
  const medianAbsReturn60d = median(dailyReturns(bars, 60).map((value) => Math.abs(value)));
  const volMedian20 = medianVolume(bars, 20);
  const volumeRatio20d = volMedian20 ? (latest.volume_traded || 0) / volMedian20 : null;
  const rangeMedian20 = median(dailyRanges(bars.slice(0, -1), 20));
  const latestRangePct = barRangePct(latest);
  const rangeRatio20d = rangeMedian20 && latestRangePct !== null ? latestRangePct / rangeMedian20 : null;
  const moveVsNormal = medianAbsReturn60d ? Math.abs(returns.return1d || 0) / Math.max(0.1, medianAbsReturn60d) : null;
  const benchmarkReturn1d = benchmarkReturns ? benchmarkReturns.return1d : null;
  const relativeReturn1d = returns.return1d === null || benchmarkReturn1d === null ? null : returns.return1d - benchmarkReturn1d;
  const ma20DistancePct = pctChange(latest.price_close, metrics.ma20);
  const ma60DistancePct = pctChange(latest.price_close, metrics.ma60);
  const scored = scoreAsset({
    returns,
    metrics,
    medianAbsReturn60d,
    volumeRatio20d,
    moveVsNormal,
    rangeRatio20d,
    benchmarkReturn1d,
    relativeReturn1d,
    ma20DistancePct,
    ma60DistancePct,
    weight: row.weight,
    weightImportance: row.weight / maxWeight,
  });
  const firstClose = bars[0].price_close;
  const asOf = latest.time_period_end || new Date(latest.time_close * 1000).toISOString();
  const technicalInputs = {
    volumeRatio20d,
    moveVsNormal,
    rangeRatio20d,
    ma20DistancePct,
    ma60DistancePct,
  };
  const reviewColor = reviewColorFor(scored);
  const reviewLabel = statusLabel(reviewColor);
  const reviewReason = buildReviewReason(row.symbol, reviewColor, returns, scored);
  const confirmation = confirmationStatus(scored);
  const evidencePresent = buildEvidencePresent(returns, scored, technicalInputs);
  const evidenceMissing = buildEvidenceMissing();
  const technicalSummary = buildTechnicalSummary(row.symbol, returns, scored, technicalInputs);

  const signalId = row.symbol.toLowerCase() + "-" + scored.trigger.type + "-" + String(latest.time_close || nowMs);
  const reason = scored.severity === "low"
    ? row.symbol + " has no high-priority attention signal in this run."
    : scored.trigger.label + " is the main technical driver.";
  const evidence =
    "1D " + signedPctText(returns.return1d, 2) + "; weight " + round(row.weight * 100, 2) +
    "%; move " + ratioText(moveVsNormal, 2) + " normal; volume " + ratioText(volumeRatio20d, 2) +
    " 20-day median; range " + ratioText(rangeRatio20d, 2) + " normal; relative 1D " +
    signedPctText(relativeReturn1d, 2) + ".";

  const assetRecord = {
    date: nowMs,
    symbol: row.symbol,
    name: detail.name || row.symbol,
    sector: detail.sector || "",
    industry: detail.industry || "",
    asOf,
    watchWeightPct: round(row.weight * 100, 2),
    close: round(latest.price_close, 4),
    volume: round(latest.volume_traded || 0, 0),
    return1d: round(returns.return1d, 2),
    return1w: round(returns.return1w, 2),
    return1m: round(returns.return1m, 2),
    benchmarkReturn1d: round(benchmarkReturn1d, 2),
    relativeReturn1d: round(relativeReturn1d, 2),
    medianAbsReturn60d: round(medianAbsReturn60d, 2),
    volumeRatio20d: round(volumeRatio20d, 2),
    moveVsNormal: round(moveVsNormal, 2),
    rangeRatio20d: round(rangeRatio20d, 2),
    rsi14: round(metrics.rsi14, 2),
    ma20: round(metrics.ma20, 4),
    ma60: round(metrics.ma60, 4),
    ma20DistancePct: round(ma20DistancePct, 2),
    ma60DistancePct: round(ma60DistancePct, 2),
    peRatio: round(metrics.peRatio, 2),
    marketCap: round(metrics.marketCap, 0),
    attentionScore: scored.score,
    technicalScore: scored.technicalScore,
    primaryTechnicalDriver: scored.primaryTechnicalDriver,
    technicalSummary,
    priceState: scored.priceState,
    volumeState: scored.volumeState,
    trendState: scored.trendState,
    volatilityState: scored.volatilityState,
    reviewColor,
    reviewLabel,
    reviewReason,
    portfolioScope: "单只持仓变化",
    confirmationStatus: confirmation,
    severity: scored.severity,
    state: scored.state,
  };

  const signalRecord = {
    date: nowMs,
    signalId,
    symbol: row.symbol,
    severity: scored.severity,
    score: scored.score,
    title: row.symbol + " " + (scored.severity === "high" ? "needs attention" : scored.severity === "medium" ? "is on watch" : "is normal"),
    reason,
    evidence,
    technicalSummary,
    triggerType: scored.trigger.type,
    primaryTechnicalDriver: scored.primaryTechnicalDriver,
    priceState: scored.priceState,
    volumeState: scored.volumeState,
    trendState: scored.trendState,
    volatilityState: scored.volatilityState,
    reviewColor,
    reviewLabel,
    reviewReason,
    portfolioScope: "单只持仓变化",
    confirmationStatus: confirmation,
    evidencePresent,
    evidenceMissing,
    portfolioImpactPct: round(scored.portfolioImpactPct, 2),
    metricValue: round(scored.trigger.value, 2),
    baseline: round(scored.trigger.baseline, 2),
    asOf,
    dedupKey: row.symbol + ":" + scored.trigger.type + ":" + scored.severity,
    deepLinkAnchor: "signal-" + signalId,
  };

  return {
    symbol: row.symbol,
    weight: row.weight,
    bars,
    assetRecord,
    signalRecord,
    priceRecords: bars.map((bar) => ({
      date: bar.time_close * 1000,
      symbol: row.symbol,
      close: round(bar.price_close, 4),
      normalized: round((bar.price_close / firstClose) * 100, 4),
      volume: round(bar.volume_traded || 0, 0),
    })),
  };
}

function indexByDate(records, valueKey) {
  const out = {};
  records.forEach((record) => {
    out[String(record.date)] = record[valueKey];
  });
  return out;
}

function buildEquity(symbolData, benchmarkPriceRecords) {
  const perSymbol = {};
  symbolData.forEach((item) => {
    perSymbol[item.symbol] = indexByDate(item.priceRecords, "normalized");
  });
  let commonDates = null;
  symbolData.forEach((item) => {
    const dates = Object.keys(perSymbol[item.symbol]);
    commonDates = commonDates === null ? dates : commonDates.filter((date) => dates.indexOf(date) !== -1);
  });
  if (!commonDates || !commonDates.length) throw new Error("No common dates for portfolio index");

  const benchmarkByDate = benchmarkPriceRecords ? indexByDate(benchmarkPriceRecords, "normalized") : {};
  return commonDates
    .map((date) => Number(date))
    .sort((a, b) => a - b)
    .map((date) => {
      const portfolioIndex = symbolData.reduce((sum, item) => {
        return sum + item.weight * perSymbol[item.symbol][String(date)];
      }, 0);
      return {
        date,
        portfolioIndex: round(portfolioIndex, 4),
        benchmarkIndex: round(benchmarkByDate[String(date)], 4),
        constituentCount: symbolData.length,
      };
    });
}

async function buildBenchmarkSeries(startSec, endSec) {
  const requested = Array.from(new Set(
    (Array.isArray(CONFIG.benchmarks) ? CONFIG.benchmarks : [])
      .concat(CONFIG.primaryBenchmark ? [CONFIG.primaryBenchmark] : [])
      .filter(Boolean)
      .map((symbol) => String(symbol).trim().toUpperCase())
      .filter(Boolean)
  ));
  const benchmarks = [];
  const missing = [];
  for (let i = 0; i < requested.length; i += 1) {
    const symbol = requested[i];
    try {
      const bars = await buildBars(symbol, startSec, endSec);
      const latest = bars[bars.length - 1];
      const firstClose = bars[0].price_close;
      benchmarks.push({
        symbol,
        returns: {
          return1d: pctChange(latest.price_close, pickPrior(bars, 1)?.price_close),
        },
        priceRecords: bars.map((bar) => ({
          date: bar.time_close * 1000,
          symbol,
          close: round(bar.price_close, 4),
          normalized: round((bar.price_close / firstClose) * 100, 4),
          volume: round(bar.volume_traded || 0, 0),
        })),
      });
    } catch (error) {
      missing.push(symbol + ": " + error.message);
    }
  }
  return { benchmarks, missing };
}

function buildChartSeries(equityRecords, symbolData, benchmarks) {
  const rows = [];
  equityRecords.forEach((record) => {
    rows.push({
      date: record.date,
      seriesType: "portfolio",
      symbol: "PORTFOLIO",
      label: "Portfolio",
      normalized: record.portfolioIndex,
      close: null,
      weightPct: 100,
    });
  });
  symbolData.forEach((item) => {
    item.priceRecords.forEach((record) => {
      rows.push({
        date: record.date,
        seriesType: "holding",
        symbol: item.symbol,
        label: item.symbol,
        normalized: record.normalized,
        close: record.close,
        weightPct: round(item.weight * 100, 2),
      });
    });
  });
  benchmarks.forEach((benchmark) => {
    benchmark.priceRecords.forEach((record) => {
      rows.push({
        date: record.date,
        seriesType: "benchmark",
        symbol: benchmark.symbol,
        label: benchmark.symbol,
        normalized: record.normalized,
        close: record.close,
        weightPct: null,
      });
    });
  });
  return rows;
}

function buildPortfolioScope(signalRecords, weightedReturn1d) {
  const active = signalRecords.filter((signal) => signal.reviewColor === "red" || signal.reviewColor === "yellow");
  const red = active.filter((signal) => signal.reviewColor === "red");
  const negativeActive = active.filter((signal) => typeof signal.metricValue === "number" && signal.metricValue > 0 && signal.priceState === "abnormal down");
  if (red.length > 1 || active.length > 1 || (typeof weightedReturn1d === "number" && weightedReturn1d <= -1.5 && negativeActive.length)) {
    return "多只持仓同时有变化，组合层面需要留意。";
  }
  if (active.length === 1) {
    return "这主要是单只股票的变化，不是整个组合的问题。";
  }
  return "没有看到组合层面的异常。";
}

function topReviewSignal(signalRecords) {
  const sorted = signalRecords.slice().sort((a, b) => {
    const priorityDiff = reviewPriority(b.reviewColor) - reviewPriority(a.reviewColor);
    if (priorityDiff) return priorityDiff;
    return (b.score || 0) - (a.score || 0);
  });
  return sorted.length ? sorted[0] : null;
}

function buildBigStatus(signalRecords, portfolioScope) {
  const top = topReviewSignal(signalRecords);
  const color = top ? top.reviewColor : "green";
  if (!top || color === "green") {
    return {
      color: "green",
      label: statusLabel("green"),
      body: statusBody("green"),
    };
  }
  return {
    color,
    label: statusLabel(color),
    body: top.reviewReason + " " + portfolioScope,
  };
}

function flattenRows(rows) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  rows.forEach((row) => {
    if (Array.isArray(row.items)) {
      row.items.forEach((item) => out.push(Object.assign({ date: item.date || row.date }, item)));
    } else {
      out.push(row);
    }
  });
  return out;
}

async function loadPriorAlerts(ctx) {
  try {
    return flattenRows(await ctx.self.ts("alerts", "events").last(50));
  } catch (error) {
    const message = String(error && error.message ? error.message : error);
    if (message.indexOf("not found") >= 0 || message.indexOf("does not exist") >= 0 || message.indexOf("No such") >= 0) {
      return [];
    }
    throw error;
  }
}

function duplicateKeys(priorAlerts, nowMs) {
  const cutoff = nowMs - CONFIG.duplicateCooldownDays * 86400 * 1000;
  const keys = {};
  priorAlerts.forEach((row) => {
    if (row && row.dedupKey && row.severity === "high" && row.date >= cutoff && row.deliveryState !== "quiet") {
      keys[row.dedupKey] = true;
    }
  });
  return keys;
}

function buildAlertRows(signals, nowMs, latestAsOf, priorAlerts) {
  const high = signals.filter((signal) => signal.reviewColor === "red").sort((a, b) => b.score - a.score);
  const seen = duplicateKeys(priorAlerts, nowMs);
  if (!high.length) {
    return [{
      date: nowMs,
      signalId: "quiet-" + nowMs,
      symbol: "PORTFOLIO",
      severity: "quiet",
      title: "没有达到立即提醒级别",
      body: "当前没有值得立即通知你的变化。",
      portfolioImpactPct: 0,
      triggerType: "quiet",
      asOf: latestAsOf,
      dedupKey: "quiet",
      deepLinkAnchor: "signals",
      deliveryState: "quiet",
    }];
  }
  return high.map((signal) => {
    const duplicate = !!seen[signal.dedupKey];
    return {
      date: nowMs,
      signalId: signal.signalId,
      symbol: signal.symbol,
      severity: signal.severity,
      title: signal.reviewLabel + "：" + signal.symbol,
      body: signal.reviewReason + " " + signal.portfolioScope,
      portfolioImpactPct: signal.portfolioImpactPct,
      triggerType: signal.triggerType,
      asOf: signal.asOf,
      dedupKey: signal.dedupKey,
      deepLinkAnchor: signal.deepLinkAnchor,
      deliveryState: duplicate ? "quiet" : "candidate",
    };
  });
}

function quietReasonFor(top, duplicateHigh) {
  if (duplicateHigh) return "duplicate";
  if (!top) return "no_signal";
  return top.reviewColor === "yellow" ? "below_threshold" : "no_signal";
}

function buildDecision(signals, alertRows, nowMs, latestAsOf, setupConfirmation, bigStatus, portfolioScope) {
  const thresholds = sensitivityThresholds();
  const top = topReviewSignal(signals);
  const actionable = alertRows.filter((row) => row.severity === "high" && row.deliveryState === "candidate");
  const duplicateHigh = alertRows.find((row) => row.severity === "high" && row.deliveryState === "quiet");
  const anchor = actionable.length
    ? actionable[0].deepLinkAnchor
    : top
      ? top.deepLinkAnchor
      : "signals";

  if (actionable.length) {
    const alert = actionable[0];
    return {
      date: nowMs,
      notificationState: "sent",
      decisionTitle: "请立即关注",
      decisionBody: alert.body,
      bigStatusColor: "red",
      bigStatusLabel: statusLabel("red"),
      bigStatusBody: alert.body,
      portfolioScope,
      notificationAudit: "已发送通知，因为这条变化达到立即提醒线，且不是重复提醒。",
      topSignalId: alert.signalId,
      topSymbol: alert.symbol,
      topSeverity: alert.severity,
      quietReason: "",
      nextAction: "Open " + alert.symbol + " detail.",
      nextTrigger: "已经达到请立即关注级别。",
      score: top ? top.score : null,
      threshold: thresholds.high,
      portfolioImpactPct: alert.portfolioImpactPct,
      asOf: alert.asOf,
      deepLinkAnchor: anchor,
      cooldownDays: CONFIG.duplicateCooldownDays,
    };
  }

  if (setupConfirmation) {
    return {
      date: nowMs,
      notificationState: "setup",
      decisionTitle: "监控已开启",
      decisionBody: "Portfolio Watch 已开启。这只是一次设置确认，不是市场信号。",
      bigStatusColor: bigStatus.color,
      bigStatusLabel: bigStatus.label,
      bigStatusBody: bigStatus.body,
      portfolioScope,
      notificationAudit: "已发送一次设置确认，用来确认通知链路可用；后续无大事时不会发心跳通知。",
      topSignalId: top ? top.signalId : "",
      topSymbol: top ? top.symbol : "PORTFOLIO",
      topSeverity: top ? top.severity : "quiet",
      quietReason: quietReasonFor(top, duplicateHigh),
      nextAction: top ? "Open " + top.symbol + " detail if you want context." : "No action needed.",
      nextTrigger: "后续通知需要出现请立即关注级别的变化，且不能是重复提醒。",
      score: top ? top.score : null,
      threshold: thresholds.high,
      portfolioImpactPct: top ? top.portfolioImpactPct : 0,
      asOf: top ? top.asOf : latestAsOf,
      deepLinkAnchor: anchor,
      cooldownDays: CONFIG.duplicateCooldownDays,
    };
  }

  if (duplicateHigh) {
    return {
      date: nowMs,
      notificationState: "quiet",
      decisionTitle: "不重复提醒",
      decisionBody: duplicateHigh.symbol + " 仍然需要关注，但同一类提醒还在冷却期内。",
      bigStatusColor: "red",
      bigStatusLabel: statusLabel("red"),
      bigStatusBody: duplicateHigh.symbol + " 仍然需要关注，但这不是新的提醒。",
      portfolioScope,
      notificationAudit: "未发送新通知，因为同一类提醒已经在冷却期内发过。",
      topSignalId: duplicateHigh.signalId,
      topSymbol: duplicateHigh.symbol,
      topSeverity: duplicateHigh.severity,
      quietReason: "duplicate",
      nextAction: "Open " + duplicateHigh.symbol + " detail if you want context.",
      nextTrigger: "冷却期外出现新的请立即关注级别变化时，才会再次通知。",
      score: top ? top.score : null,
      threshold: thresholds.high,
      portfolioImpactPct: duplicateHigh.portfolioImpactPct,
      asOf: duplicateHigh.asOf,
      deepLinkAnchor: anchor,
      cooldownDays: CONFIG.duplicateCooldownDays,
    };
  }

  if (top) {
    const state = top.reviewColor === "yellow" ? "watch" : "quiet";
    return {
      date: nowMs,
      notificationState: state,
      decisionTitle: bigStatus.label,
      decisionBody: top.reviewColor === "yellow"
        ? top.reviewReason + " " + portfolioScope
        : statusBody("green"),
      bigStatusColor: bigStatus.color,
      bigStatusLabel: bigStatus.label,
      bigStatusBody: bigStatus.body,
      portfolioScope,
      notificationAudit: top.reviewColor === "yellow"
        ? "未发送通知，因为这条变化值得看，但还不到需要立刻处理。"
        : "未发送通知，因为当前没有值得你查看的变化。",
      topSignalId: top.signalId,
      topSymbol: top.symbol,
      topSeverity: top.severity,
      quietReason: top.reviewColor === "yellow" ? "below_threshold" : "no_signal",
      nextAction: top.reviewColor === "yellow" ? "今天有空可以看一眼 " + top.symbol + "。" : "无需操作。",
      nextTrigger: "下一次通知需要出现请立即关注级别的变化，且不能是重复提醒。",
      score: top.score,
      threshold: thresholds.high,
      portfolioImpactPct: top.portfolioImpactPct,
      asOf: top.asOf,
      deepLinkAnchor: anchor,
      cooldownDays: CONFIG.duplicateCooldownDays,
    };
  }

  return {
    date: nowMs,
    notificationState: "quiet",
    decisionTitle: statusLabel("green"),
    decisionBody: statusBody("green"),
    bigStatusColor: "green",
    bigStatusLabel: statusLabel("green"),
    bigStatusBody: statusBody("green"),
    portfolioScope,
    notificationAudit: "未发送通知，因为当前没有值得你查看的变化。",
    topSignalId: "",
    topSymbol: "PORTFOLIO",
    topSeverity: "quiet",
    quietReason: "no_signal",
    nextAction: "无需操作。",
    nextTrigger: "下一次通知需要出现请立即关注级别的变化。",
    score: null,
    threshold: thresholds.high,
    portfolioImpactPct: 0,
    asOf: latestAsOf,
    deepLinkAnchor: anchor,
    cooldownDays: CONFIG.duplicateCooldownDays,
  };
}

function buildNotify(alertRows, decision, setupConfirmation) {
  const actionable = alertRows.filter((row) => row.severity === "high" && row.deliveryState === "candidate");
  if (!actionable.length) {
    if (setupConfirmation) {
      const url = CONFIG.playbookUrl && CONFIG.playbookUrl.indexOf("REPLACE_") < 0
        ? CONFIG.playbookUrl
        : "";
      return {
        title: "Portfolio Watch 已开启",
        body:
          "Portfolio Watch 已开启。这只是一次设置确认，不是市场信号。\n\n" +
          "当前判断：" + (decision.decisionTitle || "无需关注") + "。\n\n" +
          (url ? "[打开 Playbook](" + url + ")" : "打开 Playbook 查看当前状态。"),
      };
    }
    return {
      title: "Portfolio Watch",
      body: "<|SKIP_NOTIFICATION|>",
    };
  }
  const top = actionable[0];
  const extra = actionable.length > 1 ? "\n\nPlaybook 里还有 " + String(actionable.length - 1) + " 条请立即关注级别的变化。" : "";
  const url = CONFIG.playbookUrl && CONFIG.playbookUrl.indexOf("REPLACE_") < 0
    ? CONFIG.playbookUrl + "#" + top.deepLinkAnchor
    : "#" + top.deepLinkAnchor;
  return {
    title: "Portfolio Watch：" + top.symbol,
    body:
      "**" + top.title + "**\n\n" +
      top.body + "\n\n" +
      "组合影响：" + round(top.portfolioImpactPct, 2) + "%\n\n" +
      "[打开详情](" + url + ")" +
      extra,
  };
}

(async () => {
  assertConfigured();
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const startSec = nowSec - CONFIG.lookbackDays * 86400;
  const endSec = nowSec + 2 * 86400;
  const portfolio = normalizePortfolio();
  const maxWeight = Math.max.apply(null, portfolio.map((row) => row.weight));
  const benchmarkSeries = await buildBenchmarkSeries(startSec, endSec);
  const benchmarks = benchmarkSeries.benchmarks;
  const primaryBenchmark = benchmarks.find((item) => item.symbol === String(CONFIG.primaryBenchmark || "").toUpperCase()) || null;

  const symbolData = [];
  const missing = [];
  for (let i = 0; i < portfolio.length; i += 1) {
    try {
      symbolData.push(await buildSymbol(portfolio[i], primaryBenchmark ? primaryBenchmark.returns : null, startSec, endSec, nowMs, maxWeight));
    } catch (error) {
      missing.push(portfolio[i].symbol + ": " + error.message);
    }
  }
  if (missing.length / portfolio.length > 0.2 || !symbolData.length) {
    throw new Error("Too many portfolio symbols failed lookup: " + missing.join("; "));
  }

  const assetRecords = symbolData.map((item) => item.assetRecord);
  const signalRecords = symbolData.map((item) => item.signalRecord).sort((a, b) => b.score - a.score);
  const priceRecords = [];
  symbolData.forEach((item) => item.priceRecords.forEach((record) => priceRecords.push(record)));
  const equityRecords = buildEquity(symbolData, primaryBenchmark ? primaryBenchmark.priceRecords : null);
  const chartRecords = buildChartSeries(equityRecords, symbolData, benchmarks);
  const latestEquity = equityRecords[equityRecords.length - 1];
  const latestAsOf = assetRecords.map((record) => record.asOf).sort().slice(-1)[0];

  const weightedReturn = (key) => round(symbolData.reduce((sum, item) => {
    const value = item.assetRecord[key];
    return sum + item.weight * (typeof value === "number" && Number.isFinite(value) ? value : 0);
  }, 0), 2);
  const weightedReturn1d = weightedReturn("return1d");
  const weightedReturn1w = weightedReturn("return1w");
  const weightedReturn1m = weightedReturn("return1m");
  const portfolioScope = buildPortfolioScope(signalRecords, weightedReturn1d);
  signalRecords.forEach((record) => {
    record.portfolioScope = portfolioScope;
  });
  assetRecords.forEach((record) => {
    record.portfolioScope = portfolioScope;
  });
  const highSignalCount = signalRecords.filter((signal) => signal.severity === "high").length;
  const mediumSignalCount = signalRecords.filter((signal) => signal.severity === "medium").length;
  const redSignalCount = signalRecords.filter((signal) => signal.reviewColor === "red").length;
  const yellowSignalCount = signalRecords.filter((signal) => signal.reviewColor === "yellow").length;
  const bigStatus = buildBigStatus(signalRecords, portfolioScope);

  const summaryRecord = {
    date: nowMs,
    universe: symbolData.map((item) => item.symbol).join(","),
    weighting: portfolio.every((row) => Math.abs(row.weight - 1 / portfolio.length) < 0.0001)
      ? "Equal-weight watch portfolio"
      : "User-provided watch weights",
    benchmark: CONFIG.primaryBenchmark || "",
    benchmarks: benchmarks.map((item) => item.symbol).join(","),
    asOf: latestAsOf,
    tickerCount: symbolData.length,
    portfolioIndex: latestEquity.portfolioIndex,
    return1d: weightedReturn1d,
    return1w: weightedReturn1w,
    return1m: weightedReturn1m,
    attentionCount: highSignalCount + mediumSignalCount,
    highSignalCount,
    redSignalCount,
    yellowSignalCount,
    riskState: redSignalCount ? "Alert" : yellowSignalCount ? "Watch" : "Normal",
    bigStatusColor: bigStatus.color,
    bigStatusLabel: bigStatus.label,
    bigStatusBody: bigStatus.body,
    portfolioScope,
    missingSymbols: missing.join("; "),
    missingBenchmarks: benchmarkSeries.missing.join("; "),
  };
  const capabilityRecord = {
    date: nowMs,
    checkedItems: "价格波动、成交量、趋势、波动率、组合影响、SPY/QQQ 对比",
    notCheckedItems: "新闻、财报、分析师预期、公司催化剂",
    decisionLimit: "本版本只用已接入的数据判断是否需要关注；不会把未接入的新闻、预期或催化剂当成结论。",
  };

  let notifyState = "quiet";
  let alertCandidateCount = 0;
  let setupConfirmationState = "not_requested";
  await feed.run(async (ctx) => {
    const priorAlerts = await loadPriorAlerts(ctx);
    const alertRows = buildAlertRows(signalRecords, nowMs, latestAsOf, priorAlerts);
    const runArgs = env.args || {};
    const setupConfirmationAlreadySent = await ctx.kv.load("initialSubscriptionConfirmationSent");
    const setupConfirmation =
      CONFIG.initialSubscriptionConfirmation &&
      runArgs.initialConfirmation === true &&
      !setupConfirmationAlreadySent;
    const decision = buildDecision(signalRecords, alertRows, nowMs, latestAsOf, setupConfirmation, bigStatus, portfolioScope);
    const notify = buildNotify(alertRows, decision, setupConfirmation);
    notifyState = notify.body === "<|SKIP_NOTIFICATION|>" ? "quiet" : "message";
    setupConfirmationState = setupConfirmation ? "sent_or_replaced_by_market_alert" : setupConfirmationAlreadySent ? "already_sent" : "not_requested";
    alertCandidateCount = alertRows.filter((row) => row.deliveryState === "candidate").length;

    await ctx.self.ts("portfolio", "summary").append([summaryRecord]);
    await ctx.self.ts("portfolio", "equity").append(equityRecords);
    await ctx.self.ts("watch", "assets").append(assetRecords);
    await ctx.self.ts("history", "prices").append(priceRecords);
    await ctx.self.ts("chart", "series").append(chartRecords);
    await ctx.self.ts("signals", "events").append(signalRecords);
    await ctx.self.ts("alerts", "events").append(alertRows);
    await ctx.self.ts("alerts", "decision").append([decision]);
    await ctx.self.ts("capability", "status").append([capabilityRecord]);
    await ctx.self.ts("notify", "message").append([{ date: nowMs, title: notify.title, body: notify.body }]);
    if (setupConfirmation && notify.body !== "<|SKIP_NOTIFICATION|>") {
      await ctx.kv.put("initialSubscriptionConfirmationSent", String(nowMs));
    }
  });

  return {
    feed: CONFIG.feedName,
    symbols: symbolData.map((item) => item.symbol),
    missing,
    signals: signalRecords.length,
    highSignalCount,
    alertCandidates: alertCandidateCount,
    notify: notifyState,
    setupConfirmation: setupConfirmationState,
    asOf: latestAsOf,
  };
})();
