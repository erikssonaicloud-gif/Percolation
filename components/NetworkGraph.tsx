import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line, Circle, Text as SvgText, G } from "react-native-svg";
import Colors from "@/constants/colors";
import { PercolationNetwork } from "@/lib/percolation";

interface Props {
  network: PercolationNetwork;
  width: number;
  height: number;
}

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  type: "O" | "A" | "I";
  name: string;
}

function computeLayout(
  network: PercolationNetwork,
  width: number,
  height: number
): LayoutNode[] {
  const nodes = Object.values(network.nodes);
  if (nodes.length === 0) return [];

  const padding = 40;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - padding;

  if (nodes.length === 1) {
    return [{ ...nodes[0], x: cx, y: cy }];
  }

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      ...node,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

function nodeColor(type: "O" | "A" | "I") {
  if (type === "O") return Colors.cyan;
  if (type === "A") return Colors.orange;
  return Colors.green;
}

export default function NetworkGraph({ network, width, height }: Props) {
  const layoutNodes = useMemo(
    () => computeLayout(network, width, height),
    [network, width, height]
  );

  const nodeMap = useMemo(() => {
    const map: Record<string, LayoutNode> = {};
    layoutNodes.forEach((n) => (map[n.id] = n));
    return map;
  }, [layoutNodes]);

  const maxWeight = useMemo(() => {
    if (network.edges.length === 0) return 1;
    return Math.max(...network.edges.map((e) => e.weight));
  }, [network.edges]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {network.edges.map((edge, i) => {
          const from = nodeMap[edge.from];
          const to = nodeMap[edge.to];
          if (!from || !to) return null;
          const opacity = 0.15 + 0.55 * (edge.weight / maxWeight);
          return (
            <Line
              key={`edge-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={Colors.borderBright}
              strokeWidth={1.5}
              strokeOpacity={opacity}
            />
          );
        })}

        {layoutNodes.map((node) => {
          const color = nodeColor(node.type);
          const shortName =
            node.name.length > 10
              ? node.name.substring(0, 9) + "…"
              : node.name;
          return (
            <G key={node.id}>
              <Circle
                cx={node.x}
                cy={node.y}
                r={22}
                fill={color + "1A"}
                stroke={color}
                strokeWidth={1.5}
              />
              <Circle cx={node.x} cy={node.y} r={8} fill={color} />
              <SvgText
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
                fontSize={9}
                fill={Colors.textSecondary}
                fontWeight="500"
              >
                {shortName}
              </SvgText>
              <SvgText
                x={node.x}
                y={node.y + 46}
                textAnchor="middle"
                fontSize={8}
                fill={color}
                fontWeight="600"
              >
                {node.type === "O" ? "Observer" : node.type === "A" ? "Operator" : "Inert"}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 12,
    overflow: "hidden",
  },
});
