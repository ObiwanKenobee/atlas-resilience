import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Network node data per city
export interface NetworkNode {
  id: string;
  label: string;
  sector: string;
  dependency: number; // 0–1, drives size
  cascadeRisk: number; // 0–1
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  strength: number;
}

interface NetworkFragilityGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  cityName: string;
}

const SECTOR_COLORS: Record<string, string> = {
  Energy: "hsl(var(--accent))",
  Water: "hsl(198 90% 52%)",
  Finance: "hsl(var(--warn))",
  Food: "hsl(var(--healthy))",
  Health: "hsl(280 70% 65%)",
  Infrastructure: "hsl(var(--muted-foreground))",
  Ecosystem: "hsl(140 55% 50%)",
  Governance: "hsl(var(--stress))",
};

const NetworkFragilityGraph = ({
  nodes,
  edges,
  cityName,
}: NetworkFragilityGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [hovered, setHovered] = useState<string | null>(null);
  const animFrameRef = useRef<number>();
  const nodesRef = useRef<(NetworkNode & { x: number; y: number; vx: number; vy: number })[]>([]);

  const W = 480;
  const H = 300;

  // Simple force-directed layout
  useEffect(() => {
    const initialized = nodes.map((n, i) => ({
      ...n,
      x: W / 2 + Math.cos((i / nodes.length) * 2 * Math.PI) * 100,
      y: H / 2 + Math.sin((i / nodes.length) * 2 * Math.PI) * 80,
      vx: 0,
      vy: 0,
    }));
    nodesRef.current = initialized;

    let tick = 0;
    const simulate = () => {
      if (tick++ > 300) return;
      const ns = nodesRef.current;

      // Repulsion
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x;
          const dy = ns[j].y - ns[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1800 / (dist * dist);
          ns[i].vx -= (dx / dist) * force;
          ns[i].vy -= (dy / dist) * force;
          ns[j].vx += (dx / dist) * force;
          ns[j].vy += (dy / dist) * force;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const s = ns.find((n) => n.id === edge.source);
        const t = ns.find((n) => n.id === edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 90 + (1 - edge.strength) * 40;
        const force = (dist - target) * 0.03 * edge.strength;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      }

      // Center gravity
      for (const n of ns) {
        n.vx += (W / 2 - n.x) * 0.008;
        n.vy += (H / 2 - n.y) * 0.008;
        n.vx *= 0.8;
        n.vy *= 0.8;
        n.x = Math.max(30, Math.min(W - 30, n.x + n.vx));
        n.y = Math.max(30, Math.min(H - 30, n.y + n.vy));
      }

      const pos: Record<string, { x: number; y: number }> = {};
      for (const n of ns) pos[n.id] = { x: n.x, y: n.y };
      setPositions(pos);

      animFrameRef.current = requestAnimationFrame(simulate);
    };

    animFrameRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes, edges]);

  const getNodeRadius = (n: NetworkNode) => 8 + n.dependency * 20;

  const hoveredNode = nodes.find((n) => n.id === hovered);

  return (
    <div className="card-atlas p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Network Fragility Graph
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            Dependency & Cascade Risk — {cityName}
          </h3>
        </div>
        <div className="text-xs font-mono text-muted-foreground text-right">
          <div>Node size = dependency</div>
          <div>Glow = cascade risk</div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-muted/20 border border-border">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 300 }}
        >
          <defs>
            {nodes.map((n) => {
              const color = SECTOR_COLORS[n.sector] ?? "hsl(var(--accent))";
              return (
                <filter key={`glow-${n.id}`} id={`glow-${n.id}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur
                    stdDeviation={n.cascadeRisk * 8}
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              );
            })}
          </defs>

          {/* Edges */}
          {edges.map((edge) => {
            const s = positions[edge.source];
            const t = positions[edge.target];
            if (!s || !t) return null;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="hsl(var(--border))"
                strokeWidth={1 + edge.strength * 2}
                strokeOpacity={0.4 + edge.strength * 0.3}
                strokeDasharray={edge.strength < 0.5 ? "4 4" : undefined}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const r = getNodeRadius(node);
            const color = SECTOR_COLORS[node.sector] ?? "hsl(var(--accent))";
            const isCritical = node.cascadeRisk > 0.65;

            return (
              <g
                key={node.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Glow ring for high cascade risk */}
                {isCritical && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={0.35}
                    style={{
                      animation: "pulse-ring 2s ease-in-out infinite",
                    }}
                  />
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={color}
                  fillOpacity={hovered === node.id ? 0.9 : 0.6}
                  stroke={color}
                  strokeWidth={1.5}
                  filter={node.cascadeRisk > 0.5 ? `url(#glow-${node.id})` : undefined}
                  style={{
                    transition: "fill-opacity 0.2s",
                  }}
                />

                {/* Label for larger nodes or hovered */}
                {(r > 16 || hovered === node.id) && (
                  <text
                    x={pos.x}
                    y={pos.y + r + 12}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize={9}
                    fontFamily="Space Mono"
                    opacity={0.8}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-2 left-2 bg-card border border-border rounded-lg p-3 text-xs font-mono space-y-1 pointer-events-none"
            >
              <div className="text-foreground font-bold">{hoveredNode.label}</div>
              <div className="text-muted-foreground">{hoveredNode.sector}</div>
              <div className="flex gap-3 mt-1">
                <span>
                  Dependency:{" "}
                  <span className="text-warn">
                    {Math.round(hoveredNode.dependency * 100)}%
                  </span>
                </span>
                <span>
                  Cascade:{" "}
                  <span
                    style={{
                      color:
                        hoveredNode.cascadeRisk > 0.65
                          ? "hsl(var(--critical))"
                          : hoveredNode.cascadeRisk > 0.4
                          ? "hsl(var(--warn))"
                          : "hsl(var(--healthy))",
                    }}
                  >
                    {Math.round(hoveredNode.cascadeRisk * 100)}%
                  </span>
                </span>
              </div>
              {hoveredNode.cascadeRisk > 0.65 && (
                <div className="text-critical mt-1">
                  ⚡ Failure cascades to{" "}
                  {edges.filter(
                    (e) =>
                      e.source === hoveredNode.id || e.target === hoveredNode.id
                  ).length}{" "}
                  sectors
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(nodes.map((n) => n.sector))).map((sector) => (
          <div key={sector} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SECTOR_COLORS[sector] ?? "hsl(var(--accent))" }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">{sector}</span>
          </div>
        ))}
      </div>

      {/* Critical nodes callout */}
      {nodes.filter((n) => n.cascadeRisk > 0.65).length > 0 && (
        <div className="text-xs font-mono text-critical bg-critical/10 border border-critical/25 rounded px-3 py-2">
          ⚡{" "}
          {nodes.filter((n) => n.cascadeRisk > 0.65).length} critical hub
          {nodes.filter((n) => n.cascadeRisk > 0.65).length > 1 ? "s" : ""}{" "}
          detected —{" "}
          {nodes
            .filter((n) => n.cascadeRisk > 0.65)
            .map((n) => n.label)
            .join(", ")}
        </div>
      )}
    </div>
  );
};

export default NetworkFragilityGraph;
