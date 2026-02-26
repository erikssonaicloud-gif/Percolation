export type NodeType = "O" | "A" | "I";

export interface Event {
  day: string;
  timestamp: string;
  action: string;
  file_id: string;
  file_name: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  ts: string;
}

export interface NetworkEdge {
  from: string;
  to: string;
  weight: number;
}

export interface PercolationNetwork {
  nodes: Record<string, NetworkNode>;
  edges: NetworkEdge[];
}

export interface PercolationMetrics {
  frag: number;
  kappa: number;
  poo: number;
}

export function buildPercolationNetwork(
  events: Event[],
  timeWindowMinutes = 30
): PercolationNetwork {
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const nodes: Record<string, NetworkNode> = {};
  sorted.forEach((event) => {
    let type: NodeType;
    if (["view", "open"].includes(event.action)) type = "O";
    else if (["edit", "save", "export"].includes(event.action)) type = "A";
    else type = "I";

    nodes[event.file_id] = {
      id: event.file_id,
      name: event.file_name,
      type,
      ts: event.timestamp,
    };
  });

  const edges: NetworkEdge[] = [];
  const windowMs = timeWindowMinutes * 60 * 1000;

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const diffMs =
        new Date(sorted[j].timestamp).getTime() -
        new Date(sorted[i].timestamp).getTime();
      if (diffMs > windowMs) break;
      const diffSec = diffMs / 1000;
      const weight = 1 / Math.max(diffSec, 1);
      edges.push({ from: sorted[i].file_id, to: sorted[j].file_id, weight });
    }
  }

  return { nodes, edges };
}

function makeUnionFind(ids: string[]) {
  const parent: Record<string, string> = {};
  ids.forEach((id) => (parent[id] = id));

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: string, y: string) {
    const px = find(x);
    const py = find(y);
    if (px !== py) parent[px] = py;
  }

  return { find, union };
}

export function calculatePercolationMetrics(
  network: PercolationNetwork
): PercolationMetrics {
  const nodeList = Object.values(network.nodes);

  if (nodeList.length === 0) return { frag: 1.0, kappa: 0.0, poo: 0.0 };

  const oNodes = nodeList.filter((n) => n.type === "O").map((n) => n.id);
  const aNodes = nodeList.filter((n) => n.type === "A").map((n) => n.id);

  if (oNodes.length === 0) return { frag: 0.0, kappa: 1.0, poo: 1.0 };
  if (aNodes.length === 0) return { frag: 1.0, kappa: 0.0, poo: 0.0 };

  const nodeIds = nodeList.map((n) => n.id);
  const { find, union } = makeUnionFind(nodeIds);

  network.edges.forEach((e) => union(e.from, e.to));

  const componentSizes: Record<string, number> = {};
  nodeIds.forEach((id) => {
    const root = find(id);
    componentSizes[root] = (componentSizes[root] || 0) + 1;
  });

  const giantRoot = Object.entries(componentSizes).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const giantNodes = new Set(nodeIds.filter((id) => find(id) === giantRoot));

  const connectedO = oNodes.filter((o) => {
    if (!giantNodes.has(o)) return false;
    return aNodes.some((a) => giantNodes.has(a));
  }).length;

  const kappa = connectedO / oNodes.length;
  const poo = giantNodes.size / nodeIds.length;
  const frag = 1.0 - kappa * poo;

  return { frag, kappa, poo };
}

export interface SpawnCluster {
  baseName: string;
  files: string[];
  count: number;
}

export function detectSpawningClusters(fileNames: string[]): SpawnCluster[] {
  function normalize(name: string): string {
    return name
      .replace(/\.[^.]+$/, "")
      .replace(/[\s_\-]*(copy|v\d+|final|draft|\(\d+\)|\d+)[\s_\-]*/gi, "")
      .trim()
      .toLowerCase();
  }

  const groups: Record<string, string[]> = {};
  fileNames.forEach((name) => {
    const base = normalize(name);
    if (!groups[base]) groups[base] = [];
    groups[base].push(name);
  });

  return Object.entries(groups)
    .filter(([, files]) => files.length > 1)
    .map(([baseName, files]) => ({
      baseName,
      files,
      count: files.length,
    }))
    .sort((a, b) => b.count - a.count);
}

export const DEMO_EVENTS: Event[] = [
  {
    day: "2026-02-20",
    timestamp: "2026-02-20 10:00:00",
    action: "view",
    file_id: "pdf1",
    file_name: "Research.pdf",
  },
  {
    day: "2026-02-20",
    timestamp: "2026-02-20 10:15:00",
    action: "edit",
    file_id: "doc1",
    file_name: "Draft_v1.docx",
  },
  {
    day: "2026-02-21",
    timestamp: "2026-02-21 14:00:00",
    action: "view",
    file_id: "pdf2",
    file_name: "Methodology.pdf",
  },
  {
    day: "2026-02-21",
    timestamp: "2026-02-21 14:45:00",
    action: "view",
    file_id: "pdf3",
    file_name: "Examples.pdf",
  },
  {
    day: "2026-02-21",
    timestamp: "2026-02-21 16:00:00",
    action: "edit",
    file_id: "doc1",
    file_name: "Draft_v1.docx",
  },
  {
    day: "2026-02-22",
    timestamp: "2026-02-22 09:00:00",
    action: "view",
    file_id: "pdf1",
    file_name: "Research.pdf",
  },
  {
    day: "2026-02-22",
    timestamp: "2026-02-22 09:10:00",
    action: "view",
    file_id: "pdf2",
    file_name: "Methodology.pdf",
  },
  {
    day: "2026-02-22",
    timestamp: "2026-02-22 09:20:00",
    action: "view",
    file_id: "pdf4",
    file_name: "More_Research.pdf",
  },
];

export const DEMO_SPAWNING_FILES = [
  "Q3_Report.docx",
  "Q3_Report Copy.docx",
  "Q3_Report_Final.docx",
  "Q3_Report_v2.docx",
  "Q3_Report (1).docx",
  "Vacation_photos.jpg",
  "Vacation_photos (1).jpg",
  "Vacation_photos_edited.jpg",
  "Meeting_Notes.txt",
  "Meeting_Notes_draft.txt",
  "Meeting_Notes_Final.txt",
  "Untitled.docx",
  "Budget_2026.xlsx",
  "Budget_2026 Copy.xlsx",
];

export const DAYS = ["2026-02-20", "2026-02-21", "2026-02-22"];

export const DAY_LABELS: Record<string, string> = {
  "2026-02-20": "Day 1 — Flow State",
  "2026-02-21": "Day 2 — Transition",
  "2026-02-22": "Day 3 — Observer Crisis",
};
