import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import {
  detectSpawningClusters,
  DEMO_SPAWNING_FILES,
  SpawnCluster,
} from "@/lib/percolation";

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "document-text-outline";
  if (ext === "docx" || ext === "doc" || ext === "txt") return "document-outline";
  if (ext === "xlsx" || ext === "xls") return "grid-outline";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
    return "image-outline";
  return "document-outline";
}

function fileColor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return Colors.red;
  if (ext === "docx" || ext === "doc") return Colors.cyan;
  if (ext === "xlsx") return Colors.green;
  if (["jpg", "jpeg", "png"].includes(ext || "")) return Colors.orange;
  return Colors.textSecondary;
}

function AnimatedClusterCard({
  cluster,
  index,
}: {
  cluster: SpawnCluster;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(20);
  const expandH = useSharedValue(0);
  const expandOp = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withDelay(index * 100, withTiming(1, { duration: 350 }));
    cardY.value = withDelay(
      index * 100,
      withSpring(0, { damping: 14, stiffness: 100 })
    );
  }, []);

  React.useEffect(() => {
    if (expanded) {
      expandH.value = withTiming(1, { duration: 300 });
      expandOp.value = withDelay(60, withTiming(1, { duration: 250 }));
    } else {
      expandH.value = withTiming(0, { duration: 240 });
      expandOp.value = withTiming(0, { duration: 180 });
    }
  }, [expanded]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const listStyle = useAnimatedStyle(() => ({
    maxHeight: expandH.value * cluster.files.length * 52,
    overflow: "hidden",
    opacity: expandOp.value,
  }));

  const severity = cluster.count >= 4 ? "high" : cluster.count >= 3 ? "medium" : "low";
  const severityColor =
    severity === "high" ? Colors.red : severity === "medium" ? Colors.yellow : Colors.green;

  return (
    <Animated.View style={[styles.clusterCard, cardStyle]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setExpanded(!expanded);
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={styles.clusterHeader}>
          <View style={styles.clusterLeft}>
            <View style={[styles.clusterIcon, { backgroundColor: severityColor + "20" }]}>
              <Ionicons name="copy-outline" size={18} color={severityColor} />
            </View>
            <View style={styles.clusterInfo}>
              <Text style={styles.clusterName} numberOfLines={1}>
                {cluster.baseName}
              </Text>
              <Text style={styles.clusterCount}>
                {cluster.count} copies detected
              </Text>
            </View>
          </View>
          <View style={styles.clusterRight}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: severityColor + "1A", borderColor: severityColor + "44" },
              ]}
            >
              <Text style={[styles.severityText, { color: severityColor }]}>
                {severity.toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.textSecondary}
            />
          </View>
        </View>
      </Pressable>

      <Animated.View style={listStyle}>
        <View style={styles.fileList}>
          {cluster.files.map((file, i) => {
            const isOriginal = i === 0;
            const icon = fileIcon(file);
            const color = fileColor(file);
            return (
              <View key={file} style={styles.fileItem}>
                <Ionicons name={icon as any} size={16} color={color} />
                <Text
                  style={[
                    styles.fileName,
                    isOriginal && styles.fileNameOriginal,
                  ]}
                  numberOfLines={1}
                >
                  {file}
                </Text>
                {isOriginal && (
                  <View style={styles.originalBadge}>
                    <Text style={styles.originalBadgeText}>source</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function DetectorScreen() {
  const insets = useSafeAreaInsets();
  const [clusters, setClusters] = useState<SpawnCluster[] | null>(null);
  const [running, setRunning] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const statsOpacity = useSharedValue(0);
  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  function runDetector() {
    if (running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning(true);
    setClusters(null);
    buttonScale.value = withSpring(0.95, { damping: 10 }, () => {
      buttonScale.value = withSpring(1);
    });

    setTimeout(() => {
      const detected = detectSpawningClusters(DEMO_SPAWNING_FILES);
      setClusters(detected);
      setTotalFiles(DEMO_SPAWNING_FILES.length);
      setRunning(false);
      statsOpacity.value = withTiming(1, { duration: 400 });
    }, 700);
  }

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const spawnedCount = clusters
    ? clusters.reduce((s, c) => s + c.count, 0)
    : 0;

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
            <Text style={styles.headerBadgeText}>FILE INTELLIGENCE</Text>
          </View>
          <Text style={styles.title}>Spawning{"\n"}Detector</Text>
          <Text style={styles.subtitle}>
            Identifies file clusters where one document spawned multiple copies or versions
          </Text>
        </View>

        <View style={styles.conceptCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.yellow} />
          <Text style={styles.conceptText}>
            Files like "Q3_Report.docx" spawning "Q3_Report Copy", "Q3_Report_Final", "Q3_Report_v2" indicate fragmented document workflows. Percolation drops when operators can't find the canonical version.
          </Text>
        </View>

        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={runDetector}
            style={[styles.runButton, running && styles.runButtonDisabled]}
            disabled={running}
          >
            <View style={styles.runButtonInner}>
              {running ? (
                <Ionicons name="hourglass-outline" size={20} color={Colors.bg} />
              ) : (
                <Ionicons name="search" size={20} color={Colors.bg} />
              )}
              <Text style={styles.runButtonText}>
                {running ? "Scanning files…" : "Detect Spawning Clusters"}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {clusters && (
          <>
            <Animated.View style={[styles.statsRow, statsStyle]}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{totalFiles}</Text>
                <Text style={styles.statLabel}>Total Files</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: Colors.orange }]}>
                  {clusters.length}
                </Text>
                <Text style={styles.statLabel}>Clusters Found</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: Colors.red }]}>
                  {spawnedCount}
                </Text>
                <Text style={styles.statLabel}>Spawned Files</Text>
              </View>
            </Animated.View>

            <Text style={styles.sectionLabel}>
              {clusters.length} spawning cluster{clusters.length !== 1 ? "s" : ""} detected
            </Text>

            <View style={styles.clusterList}>
              {clusters.map((cluster, i) => (
                <AnimatedClusterCard key={cluster.baseName} cluster={cluster} index={i} />
              ))}
            </View>
          </>
        )}

        {!clusters && !running && (
          <View style={styles.emptyState}>
            <Ionicons name="copy-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              Scan the demo file set to identify documents that spawned multiple copies
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
  header: { marginBottom: 20 },
  headerBadge: {
    backgroundColor: Colors.orangeDim,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  headerBadgeText: {
    color: Colors.orange,
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
  conceptCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.yellow,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  conceptText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  runButton: {
    backgroundColor: Colors.orange,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 24,
  },
  runButtonDisabled: { opacity: 0.6 },
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
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 3,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  clusterList: { gap: 12 },
  clusterCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    padding: 14,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clusterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  clusterIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterInfo: { flex: 1 },
  clusterName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  clusterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  clusterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  severityText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  fileList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    gap: 2,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  fileNameOriginal: {
    color: Colors.text,
    fontWeight: "500",
  },
  originalBadge: {
    backgroundColor: Colors.cyanDim,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  originalBadgeText: {
    fontSize: 9,
    color: Colors.cyan,
    fontWeight: "600",
    letterSpacing: 0.5,
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
});
