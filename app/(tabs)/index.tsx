import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import NetworkGraph from "@/components/NetworkGraph";
import {
  buildPercolationNetwork,
  calculatePercolationMetrics,
  DEMO_EVENTS,
  DAYS,
  DAY_LABELS,
  PercolationMetrics,
  PercolationNetwork,
} from "@/lib/percolation";

interface DayResult {
  day: string;
  metrics: PercolationMetrics;
  network: PercolationNetwork;
}

function fragmentColor(frag: number) {
  if (frag >= 0.8) return Colors.red;
  if (frag >= 0.5) return Colors.yellow;
  return Colors.green;
}

function fragmentLabel(frag: number) {
  if (frag >= 0.8) return "Crisis";
  if (frag >= 0.5) return "Fragmented";
  if (frag >= 0.2) return "Partial";
  return "Flow";
}

function MetricBadge({
  value,
  label,
  sublabel,
  color,
  delay,
}: {
  value: string;
  label: string;
  sublabel?: string;
  color: string;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 14, stiffness: 100 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.metricBadge, style]}>
      <View style={[styles.metricGlow, { backgroundColor: color + "18" }]} />
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {sublabel ? (
        <Text style={[styles.metricSub, { color }]}>{sublabel}</Text>
      ) : null}
    </Animated.View>
  );
}

function DayCard({
  result,
  index,
  isExpanded,
  onToggle,
  graphWidth,
}: {
  result: DayResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  graphWidth: number;
}) {
  const { frag, kappa, poo } = result.metrics;
  const fragColor = fragmentColor(frag);

  const heightAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);

  React.useEffect(() => {
    if (isExpanded) {
      heightAnim.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
      opacityAnim.value = withDelay(100, withTiming(1, { duration: 300 }));
    } else {
      heightAnim.value = withTiming(0, { duration: 280 });
      opacityAnim.value = withTiming(0, { duration: 200 });
    }
  }, [isExpanded]);

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: heightAnim.value * 320,
    overflow: "hidden",
    opacity: opacityAnim.value,
  }));

  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(24);
  React.useEffect(() => {
    cardOpacity.value = withDelay(
      index * 120,
      withTiming(1, { duration: 400 })
    );
    cardY.value = withDelay(
      index * 120,
      withSpring(0, { damping: 15, stiffness: 90 })
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <Animated.View style={[styles.dayCard, cardStyle]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={styles.dayCardHeader}>
          <View style={styles.dayCardLeft}>
            <View style={[styles.dayDot, { backgroundColor: fragColor }]} />
            <View>
              <Text style={styles.dayLabel}>{DAY_LABELS[result.day]}</Text>
              <Text style={styles.dayDate}>{result.day}</Text>
            </View>
          </View>
          <View style={styles.dayCardRight}>
            <View style={[styles.fragPill, { backgroundColor: fragColor + "22", borderColor: fragColor + "55" }]}>
              <Text style={[styles.fragPillText, { color: fragColor }]}>
                {fragmentLabel(frag)}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.metricsRow}>
          <MetricBadge
            value={frag.toFixed(2)}
            label="Fragmentation"
            sublabel={frag >= 0.8 ? "Crisis" : undefined}
            color={fragColor}
            delay={index * 120 + 80}
          />
          <MetricBadge
            value={kappa.toFixed(2)}
            label="κ Coupling"
            color={Colors.cyan}
            delay={index * 120 + 160}
          />
          <MetricBadge
            value={poo.toFixed(2)}
            label="Coherence"
            color={Colors.orange}
            delay={index * 120 + 240}
          />
        </View>
      </Pressable>

      <Animated.View style={expandStyle}>
        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphTitle}>Percolation Network</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.cyan }]} />
                <Text style={styles.legendText}>Observer</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.orange }]} />
                <Text style={styles.legendText}>Operator</Text>
              </View>
            </View>
          </View>
          <NetworkGraph
            network={result.network}
            width={graphWidth}
            height={200}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [results, setResults] = useState<DayResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const graphWidth = width - 48 - 32;

  function runAnalysis() {
    if (running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning(true);
    setResults(null);
    setExpandedDay(null);
    buttonScale.value = withSpring(0.95, { damping: 10 }, () => {
      buttonScale.value = withSpring(1);
    });

    setTimeout(() => {
      const dayResults: DayResult[] = DAYS.map((day) => {
        const events = DEMO_EVENTS.filter((e) => e.day === day);
        const network = buildPercolationNetwork(events);
        const metrics = calculatePercolationMetrics(network);
        return { day, metrics, network };
      });
      setResults(dayResults);
      setRunning(false);
      setExpandedDay(DAYS[0]);
    }, 600);
  }

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>COGNITIVE ENGINE</Text>
          </View>
          <Text style={styles.title}>Percolation{"\n"}Dashboard</Text>
          <Text style={styles.subtitle}>
            Observer ↔ Operator network analysis from file interaction events
          </Text>
        </View>

        <View style={styles.nathanCard}>
          <View style={styles.nathanCardTop}>
            <View style={styles.nathanAvatar}>
              <Ionicons name="flask-outline" size={18} color={Colors.cyan} />
            </View>
            <View style={styles.nathanCardHeader}>
              <Text style={styles.nathanCardTitle}>Built on Nathan Lazar, PhD's insight</Text>
              <Text style={styles.nathanCardSub}>Computational Biology → Cognitive Networks</Text>
            </View>
          </View>
          <Text style={styles.nathanCardBody}>
            {`"Run a clustering method (I like DBSCAN because it doesn't require every point to be in a cluster). Label each cluster by decoding the embedding…"\n\n`}
            <Text style={styles.nathanCardBodyBold}>
              That's exactly the detector layer. Percolation theory adds what clustering can't: a continuous stress parameter that predicts when the whole system tips.
            </Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="eye-outline" size={18} color={Colors.cyan} />
            <Text style={styles.infoCardText}>Observer nodes view/open files</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="create-outline" size={18} color={Colors.orange} />
            <Text style={styles.infoCardText}>Operator nodes edit/save/export</Text>
          </View>
        </View>

        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={runAnalysis}
            style={[styles.runButton, running && styles.runButtonDisabled]}
            disabled={running}
          >
            <View style={styles.runButtonInner}>
              {running ? (
                <Ionicons name="hourglass-outline" size={20} color={Colors.bg} />
              ) : (
                <Ionicons name="play-circle" size={20} color={Colors.bg} />
              )}
              <Text style={styles.runButtonText}>
                {running ? "Computing…" : "Run Percolation Analysis"}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              {results.length} days analyzed
            </Text>
            {results.map((result, i) => (
              <DayCard
                key={result.day}
                result={result}
                index={i}
                isExpanded={expandedDay === result.day}
                onToggle={() => {
                  Haptics.selectionAsync();
                  setExpandedDay(
                    expandedDay === result.day ? null : result.day
                  );
                }}
                graphWidth={graphWidth}
              />
            ))}
          </View>
        )}

        {!results && !running && (
          <View style={styles.emptyState}>
            <Ionicons
              name="git-network-outline"
              size={48}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyText}>
              Run analysis to compute percolation metrics across demo days
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  headerBadge: {
    backgroundColor: Colors.cyanDim,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  headerBadgeText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  runButton: {
    backgroundColor: Colors.cyan,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 28,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  runButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  resultsContainer: { gap: 14 },
  resultsHeader: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dayCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    overflow: "hidden",
  },
  dayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dayCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  dayDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  fragPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fragPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricBadge: {
    flex: 1,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  metricGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  metricSub: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  graphContainer: {
    marginTop: 14,
  },
  graphHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  graphTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  legend: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  nathanCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.cyan,
    padding: 16,
    marginBottom: 18,
    gap: 12,
  },
  nathanCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nathanAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cyanDim,
    alignItems: "center",
    justifyContent: "center",
  },
  nathanCardHeader: {
    flex: 1,
  },
  nathanCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  nathanCardSub: {
    fontSize: 11,
    color: Colors.cyan,
  },
  nathanCardBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    fontStyle: "italic",
  },
  nathanCardBodyBold: {
    fontStyle: "normal",
    fontWeight: "600",
    color: Colors.text,
  },
});
