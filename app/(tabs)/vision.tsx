import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface TimelineItem {
  hours: string;
  label: string;
  description: string;
  color: string;
  icon: string;
}

const TIMELINE: TimelineItem[] = [
  {
    hours: "72h",
    label: "Early Signal",
    description: "κ coupling begins degrading. Observer nodes decouple from operator actions. Files start spawning without consolidation.",
    color: Colors.yellow,
    icon: "trending-down-outline",
  },
  {
    hours: "48h",
    label: "Fragmentation",
    description: "Percolation threshold approached. Giant component shrinks. Decision surface becomes incoherent — too many versions, no canonical path.",
    color: Colors.orange,
    icon: "warning-outline",
  },
  {
    hours: "24h",
    label: "Pre-crisis",
    description: "P∞ collapses. Network transitions from navigable to disconnected. Paralysis window opens.",
    color: Colors.red,
    icon: "flash-outline",
  },
  {
    hours: "0",
    label: "Paralysis Event",
    description: "Cognitive collapse. Unable to act despite high urgency. The system tipped — not a personal failure, a phase transition.",
    color: Colors.red,
    icon: "close-circle-outline",
  },
];

const PARALLELS = [
  {
    left: "Cognitive files",
    right: "Cell phenotypes",
    icon: "document-outline",
  },
  {
    left: "Version sprawl stress",
    right: "Genetic perturbation",
    icon: "git-branch-outline",
  },
  {
    left: "Observer → Operator coupling",
    right: "Signal transduction pathway",
    icon: "git-network-outline",
  },
  {
    left: "Percolation threshold",
    right: "Phase transition in cell state",
    icon: "analytics-outline",
  },
  {
    left: "72h warning window",
    right: "Pre-apoptotic stress signature",
    icon: "time-outline",
  },
];

const ROADMAP = [
  {
    phase: "01",
    title: "Proof of concept",
    detail: "Historical Drive metadata → labeled paralysis events as ground truth. DBSCAN clustering + percolation metrics on temporal graphs.",
    done: true,
  },
  {
    phase: "02",
    title: "Personalized baseline",
    detail: "Learn individual κ and P∞ trajectories. What does my \"flow state\" network topology look like vs. pre-crisis?",
    done: false,
  },
  {
    phase: "03",
    title: "Early-warning system",
    detail: "24–72h advance notice. Push alert: \"Your Observer/Operator coupling dropped 40% overnight. Restructure before the window closes.\"",
    done: false,
  },
  {
    phase: "04",
    title: "Intervention layer",
    detail: "Not just a warning — a prescription. Identify which file clusters to consolidate, which versions to archive, to restore percolation.",
    done: false,
  },
];

function FadeInView({
  children,
  delay,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  style?: object;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 14, stiffness: 90 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animStyle, style]}>{children}</Animated.View>
  );
}

export default function VisionScreen() {
  const insets = useSafeAreaInsets();
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
        <FadeInView delay={0}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>THE PRODUCT VISION</Text>
          </View>
          <Text style={styles.title}>Early Warning{"\n"}System</Text>
          <Text style={styles.subtitle}>
            A 24–72 hour advance notice system for cognitive collapse — built on the same mathematical substrate that describes phase transitions in complex biological systems.
          </Text>
        </FadeInView>

        <FadeInView delay={120}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>THE 72-HOUR WINDOW</Text>
          </View>
          <View style={styles.timelineContainer}>
            {TIMELINE.map((item, i) => (
              <View key={item.hours} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineHourBadge, { borderColor: item.color + "55", backgroundColor: item.color + "15" }]}>
                    <Text style={[styles.timelineHour, { color: item.color }]}>{item.hours}</Text>
                  </View>
                  {i < TIMELINE.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: item.color + "30" }]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <View style={styles.timelineTitleRow}>
                    <Ionicons name={item.icon as any} size={15} color={item.color} />
                    <Text style={[styles.timelineTitle, { color: item.color }]}>{item.label}</Text>
                  </View>
                  <Text style={styles.timelineDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={240}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>THE BIO PARALLEL</Text>
          </View>
          <View style={styles.parallelCard}>
            <View style={styles.parallelHeader}>
              <View style={[styles.parallelHeaderPill, { backgroundColor: Colors.cyanDim }]}>
                <Text style={[styles.parallelHeaderPillText, { color: Colors.cyan }]}>Cognitive System</Text>
              </View>
              <View style={[styles.parallelHeaderPill, { backgroundColor: Colors.greenDim }]}>
                <Text style={[styles.parallelHeaderPillText, { color: Colors.green }]}>Biological System</Text>
              </View>
            </View>
            {PARALLELS.map((p) => (
              <View key={p.left} style={styles.parallelRow}>
                <Ionicons name={p.icon as any} size={14} color={Colors.textMuted} style={styles.parallelIcon} />
                <Text style={styles.parallelLeft}>{p.left}</Text>
                <Ionicons name="swap-horizontal" size={12} color={Colors.textMuted} />
                <Text style={styles.parallelRight}>{p.right}</Text>
              </View>
            ))}
            <View style={styles.parallelNote}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.parallelNoteText}>
                The mathematics of percolation theory is agnostic to domain. The same threshold behavior that describes network robustness in cellular systems describes cognitive load tolerance.
              </Text>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={360}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>ROADMAP</Text>
          </View>
          <View style={styles.roadmapContainer}>
            {ROADMAP.map((item, i) => (
              <View key={item.phase} style={[styles.roadmapCard, item.done && styles.roadmapCardDone]}>
                <View style={styles.roadmapTop}>
                  <View style={[styles.roadmapPhase, { backgroundColor: item.done ? Colors.greenDim : Colors.bgCardAlt, borderColor: item.done ? Colors.green + "55" : Colors.border }]}>
                    <Text style={[styles.roadmapPhaseText, { color: item.done ? Colors.green : Colors.textSecondary }]}>{item.phase}</Text>
                  </View>
                  <View style={styles.roadmapTitleRow}>
                    <Text style={styles.roadmapTitle}>{item.title}</Text>
                    {item.done && (
                      <View style={styles.doneChip}>
                        <Ionicons name="checkmark" size={10} color={Colors.green} />
                        <Text style={styles.doneChipText}>In prototype</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.roadmapDetail}>{item.detail}</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={480}>
          <View style={styles.closingCard}>
            <Ionicons name="flask-outline" size={22} color={Colors.cyan} />
            <Text style={styles.closingTitle}>Why this isn't just a productivity app</Text>
            <Text style={styles.closingBody}>
              {`Most "focus" tools fight symptoms. This system models the underlying phase transition — the same math that computational biologists use to understand when a cellular system loses resilience.\n\nIf you've spent years building tools to predict when biological systems tip, this is the same problem in a different substrate.`}
            </Text>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerBadge: {
    backgroundColor: Colors.greenDim,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  headerBadgeText: {
    color: Colors.green,
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
    lineHeight: 21,
    marginBottom: 28,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  timelineContainer: {
    marginBottom: 28,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 16,
    minHeight: 88,
  },
  timelineLeft: {
    alignItems: "center",
    width: 52,
  },
  timelineHourBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center",
    minWidth: 44,
  },
  timelineHour: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  timelineLine: {
    flex: 1,
    width: 1.5,
    marginTop: 6,
    marginBottom: 0,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  timelineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  parallelCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 28,
    gap: 0,
  },
  parallelHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  parallelHeaderPill: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  parallelHeaderPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  parallelRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  parallelIcon: {
    width: 16,
  },
  parallelLeft: {
    flex: 1,
    fontSize: 12,
    color: Colors.cyan,
    fontWeight: "500",
  },
  parallelRight: {
    flex: 1,
    fontSize: 12,
    color: Colors.green,
    fontWeight: "500",
    textAlign: "right",
  },
  parallelNote: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "flex-start",
  },
  parallelNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    fontStyle: "italic",
  },
  roadmapContainer: {
    gap: 10,
    marginBottom: 24,
  },
  roadmapCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  roadmapCardDone: {
    borderColor: Colors.green + "33",
  },
  roadmapTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roadmapPhase: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  roadmapPhaseText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  roadmapTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  roadmapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  doneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.greenDim,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  doneChipText: {
    fontSize: 9,
    color: Colors.green,
    fontWeight: "600",
  },
  roadmapDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  closingCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cyan + "33",
    padding: 20,
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  closingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 22,
  },
  closingBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
});
