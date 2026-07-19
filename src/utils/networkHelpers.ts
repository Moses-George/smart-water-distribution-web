import type { NodeType, NetworkNode, NetworkPipe } from "@/types/network";


export const defaults: Record<NodeType, Partial<NetworkNode>> = {
  reservoir: { pressure: 60, status: "ok" },
  tank: { pressure: 50, level: 70, status: "ok" },
  pump: { pressure: 55, status: "ok", ratedKw: 280 },
  valve: { pressure: 45, status: "ok" },
  junction: { pressure: 42, status: "ok", leakProb: 0.02 },
  consumer: { pressure: 30, demand: 20, status: "ok" },
};

export const prefix: Record<NodeType, string> = {
  reservoir: "R",
  tank: "T",
  pump: "P",
  valve: "V",
  junction: "J",
  consumer: "C",
};

export function nextId(nodes: NetworkNode[], type: NodeType) {
  let i = 1;
  while (nodes.some((n) => n.id === `${prefix[type]}${i}`)) i++;
  return `${prefix[type]}${i}`;
}

export function hopsFromReservoirs(nodes: NetworkNode[], pipes: NetworkPipe[]) {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  pipes.forEach((p) => {
    adj.get(p.from)?.push(p.to);
    adj.get(p.to)?.push(p.from);
  });
  const dist = new Map<string, number>();
  const q: string[] = [];
  nodes.filter((n) => n.type === "reservoir").forEach((n) => {
    dist.set(n.id, 0);
    q.push(n.id);
  });
  while (q.length) {
    const id = q.shift()!;
    for (const nb of adj.get(id) ?? []) {
      if (!dist.has(nb)) {
        dist.set(nb, (dist.get(id) ?? 0) + 1);
        q.push(nb);
      }
    }
  }
  return dist;
}