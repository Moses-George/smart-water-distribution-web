import { HOURLY } from "@/lib/network-data";
import type {
  NetworkNode,
  ScheduleResult,
  ScheduleRow,
  NetworkPipe,
  LeakResult,
  ScenarioMetrics,
  ScenarioId,
} from "@/types/network";

export function computeSchedule(nodes: NetworkNode[]): ScheduleResult {
  const pumps = nodes.filter((n) => n.type === "pump");
  const pumpIds = pumps.map((p) => p.id);
  const totalRatedKw = pumps.reduce((s, p) => s + (p.ratedKw ?? 280), 0) || 1;

  const baseDuty = 0.65;
  const invW = HOURLY.map((h) => 1 / Math.pow(h.tariff, 1.4));
  const sumInv = invW.reduce((a, b) => a + b, 0);
  const optDutyH = invW.map((w) => Math.min(1, (w / sumInv) * 24 * baseDuty));

  const rows: ScheduleRow[] = HOURLY.map((h, i) => {
    const optDuty = optDutyH[i];
    const baselineKw = totalRatedKw * baseDuty;
    const kw = totalRatedKw * optDuty;
    const cost = (kw * h.tariff) / 100;
    const baselineCost = (baselineKw * h.tariff) / 100;
    const pumpsMap: Record<string, number> = {};
    pumps.forEach((p) => {
      const scale = (p.ratedKw ?? 280) / totalRatedKw;
      pumpsMap[p.id] = +(kw * scale).toFixed(1);
    });
    return {
      hour: h.hour,
      tariff: h.tariff,
      demandLps: h.demand * 11.57,
      pumps: pumpsMap,
      kw: +kw.toFixed(1),
      cost: +cost.toFixed(2),
      baselineKw: +baselineKw.toFixed(1),
      baselineCost: +baselineCost.toFixed(2),
    };
  });

  const totalKWh = rows.reduce((s, r) => s + r.kw, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const baselineKWh = rows.reduce((s, r) => s + r.baselineKw, 0);
  const baselineCost = rows.reduce((s, r) => s + r.baselineCost, 0);
  const savings = baselineCost - totalCost;

  return {
    rows,
    totalKWh: +totalKWh.toFixed(0),
    totalCost: +totalCost.toFixed(0),
    baselineKWh: +baselineKWh.toFixed(0),
    baselineCost: +baselineCost.toFixed(0),
    savings: +savings.toFixed(0),
    savingsPct: +((savings / (baselineCost || 1)) * 100).toFixed(1),
    pumpIds,
    ranAt: Date.now(),
  };
}

export function detectLeaks(
  nodes: NetworkNode[],
  pipes: NetworkPipe[],
): {
  perNode: LeakResult["perNode"];
  updated: NetworkNode[];
} {
  const seed = Math.random();
  const perPipe = new Map<string, NetworkPipe[]>();
  nodes.forEach((n) => perPipe.set(n.id, []));
  pipes.forEach((p) => {
    perPipe.get(p.from)?.push(p);
    perPipe.get(p.to)?.push(p);
  });

  const per: LeakResult["perNode"] = [];
  const updated = nodes.map((n) => {
    if (n.type === "reservoir" || n.type === "tank") {
      per.push({
        id: n.id,
        label: n.label,
        prob: 0,
        zScore: 0,
        reason: "source node",
      });
      return n;
    }
    const connected = perPipe.get(n.id) ?? [];
    const avgAge = connected.length
      ? connected.reduce((s, p) => s + p.age, 0) / connected.length
      : 0;
    const materialRisk =
      connected.reduce(
        (s, p) =>
          s +
          (p.material === "Steel" ? 0.25 : p.material === "PVC" ? 0.1 : 0.05),
        0,
      ) / (connected.length || 1);
    const noise =
      Math.sin(seed * 137 + n.x + n.y) * 0.5 +
      Math.sin(seed * 91 + n.pressure) * 0.5;
    const z = Math.abs(noise) * 3 + avgAge / 20 + materialRisk * 2;
    const prob = 1 / (1 + Math.exp(-(z - 2.2)));
    const reasonParts = [
      `avg pipe age ${avgAge.toFixed(0)}y`,
      `material risk ${(materialRisk * 100).toFixed(0)}%`,
      `pressure residual z=${z.toFixed(2)}`,
    ];
    per.push({
      id: n.id,
      label: n.label,
      prob: +prob.toFixed(3),
      zScore: +z.toFixed(2),
      reason: reasonParts.join(" · "),
    });
    return {
      ...n,
      leakProb: +prob.toFixed(3),
      status:
        prob > 0.7
          ? ("alert" as const)
          : prob > 0.4
            ? ("warn" as const)
            : n.status,
    };
  });

  per.sort((a, b) => b.prob - a.prob);
  return { perNode: per, updated };
}

export function metricsFor(
  nodes: NetworkNode[],
  pipes: NetworkPipe[],
  demandMultiplier = 1,
  energyMultiplier = 1,
): ScenarioMetrics {
  const consumers = nodes.filter((n) => n.type === "consumer");
  const pumps = nodes.filter((n) => n.type === "pump");
  const peakDemand =
    consumers.reduce((s, n) => s + (n.demand ?? 0), 0) * demandMultiplier;
  const pressures = nodes
    .filter((n) => n.type !== "reservoir")
    .map((n) => n.pressure);
  const minPressure = pressures.length ? Math.min(...pressures) : 0;
  const avgPressure = pressures.length
    ? pressures.reduce((a, b) => a + b, 0) / pressures.length
    : 0;
  const ratedKw = pumps.reduce((s, p) => s + (p.ratedKw ?? 280), 0);
  const energyKWh = ratedKw * 0.65 * 24 * energyMultiplier;
  const co2t = energyKWh * 0.00038;
  const activeLeaks = nodes.filter((n) => (n.leakProb ?? 0) > 0.5).length;
  return {
    peakDemand: +peakDemand.toFixed(1),
    minPressure: +minPressure.toFixed(1),
    avgPressure: +avgPressure.toFixed(1),
    energyKWh: +energyKWh.toFixed(0),
    co2t: +co2t.toFixed(2),
    activeLeaks,
    nodes: nodes.length,
    pipes: pipes.length,
  };
}

export function applyScenario(
  id: ScenarioId,
  nodes: NetworkNode[],
  pipes: NetworkPipe[],
) {
  let n = nodes.map((x) => ({ ...x }));
  let p = pipes.map((x) => ({ ...x }));
  let demandMul = 1;
  let energyMul = 1;

  if (id === "pop") {
    n = n.map((x) =>
      x.type === "consumer"
        ? {
            ...x,
            demand: +((x.demand ?? 0) * 1.3).toFixed(1),
            pressure: +(x.pressure - 3.5).toFixed(1),
          }
        : x,
    );
    demandMul = 1.3;
    energyMul = 1.28;
  } else if (id === "pump") {
    const target = n.find((x) => x.type === "pump");
    if (target) {
      n = n.map((x) =>
        x.id === target.id
          ? { ...x, status: "alert" as const, pressure: 0, ratedKw: 0 }
          : x,
      );
    }
    n = n.map((x) =>
      x.type === "consumer"
        ? { ...x, pressure: +(x.pressure - 6).toFixed(1) }
        : x,
    );
    demandMul = 0.85;
    energyMul = 0.7;
  } else if (id === "burst") {
    if (p.length) {
      const b = p[0];
      p = p.map((x) =>
        x.id === b.id
          ? {
              ...x,
              flow: x.flow + 300,
              velocity: +(x.velocity * 2.2).toFixed(2),
              headloss: +(x.headloss * 3).toFixed(1),
            }
          : x,
      );
      n = n.map((x) =>
        x.id === b.from || x.id === b.to
          ? {
              ...x,
              pressure: +(x.pressure - 12).toFixed(1),
              status: "alert" as const,
              leakProb: 0.99,
            }
          : x,
      );
    }
    demandMul = 1.15;
    energyMul = 1.4;
  } else if (id === "res") {
    let i = 1;
    while (n.some((x) => x.id === `R${i}`)) i++;
    n = [
      ...n,
      {
        id: `R${i}`,
        type: "reservoir",
        label: `Reservoir ${i}`,
        x: 88,
        y: 12,
        pressure: 64,
        status: "ok",
      },
    ];
    n = n.map((x) =>
      x.type === "consumer" || x.type === "junction"
        ? { ...x, pressure: +(x.pressure + 4).toFixed(1) }
        : x,
    );
    demandMul = 1;
    energyMul = 0.92;
  } else if (id === "solar") {
    energyMul = 0.4;
  }

  return { nodes: n, pipes: p, demandMul, energyMul };
}
