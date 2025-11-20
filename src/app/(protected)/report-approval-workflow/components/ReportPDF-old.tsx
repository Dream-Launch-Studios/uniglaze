/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { type PriorityLevel, type ReportStatus } from "@prisma/client";
import type {
  BlockageType,
  projectSchema,
} from "@/validators/prisma-schmea.validator";
import type { z } from "zod";

type Project = z.infer<typeof projectSchema>;
type Sheet1Item = NonNullable<
  Project["latestProjectVersion"]["sheet1"]
>[number];
type Sheet2Item = NonNullable<Sheet1Item["sheet2"]>[number];
type BlockageItem = NonNullable<Sheet1Item["blockages"]>[number];
type ProgressPhoto = NonNullable<Sheet1Item["yesterdayProgressPhotos"]>[number];

interface WorkflowReport {
  id: number;
  projectName: string;
  submittedBy: string;
  submittedAt: string;
  yesterdayReportStatus: ReportStatus;
  priority: PriorityLevel;
  overallProgress: number;
  completedItems: number;
  totalItems: number;
  photosCount: number;
  hasPhotos: boolean;
  hasComments: boolean;
  hasChanges: boolean;
  lastComment?: string;
  workSummary?: string;
  project: Partial<Project>;
}

interface ReportPDFProps {
  report: WorkflowReport;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginTop: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailItem: {
    width: "22%",
  },
  detailLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  notes: {
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  notesText: {
    fontSize: 10,
    color: "#111827",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoContainer: {
    width: "60%",
    // minWidth: "fit-content",
    marginBottom: 10,
  },
  photo: {
    width: "250px",
    height: "250px",
    objectFit: "contain",
    borderRadius: 4,
    border: "1px solid #e2e8f0",
  },
  photoDescription: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 4,
  },
  blockageCard: {
    backgroundColor: "#fef7ed",
    border: "1px solid #fed7aa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  blockageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  blockageTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  blockageType: {
    fontSize: 9,
    color: "#ea580c",
    backgroundColor: "#fed7aa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  blockageDescription: {
    fontSize: 12,
    color: "#111827",
    marginBottom: 4,
  },
  blockageDate: {
    fontSize: 9,
    color: "#6b7280",
  },
  blockagesGrid: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
});

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return "#22c55e";
  if (percentage >= 50) return "#f59e0b";
  return "#ef4444";
};

const ReportPDF: React.FC<ReportPDFProps> = ({ report }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.title}>{report.projectName}</Text>
            <View style={{ flexDirection: "column", gap: 1 }}>
              <Text style={styles.subtitle}>
                Client:{" "}
                {report.project.latestProjectVersion?.client?.clientName}
              </Text>
              <Text style={styles.subtitle}>Contractor: Uniglaze</Text>
              <Text style={styles.subtitle}>
                Site Address:{" "}
                {report.project.latestProjectVersion?.siteLocation.city},{" "}
                {report.project.latestProjectVersion?.siteLocation.state}
              </Text>
              <Text style={styles.subtitle}>
                Submitted by: {report.submittedBy}
              </Text>
              <Text style={styles.subtitle}>
                Submitted on: {formatDate(report.submittedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Progress Report</Text>
          {report.project.latestProjectVersion?.sheet1?.map(
            (item: Sheet1Item, index: number) => (
              <View key={index} style={styles.card}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                </View>

                {/* Sheet 1 Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Yet to Supply</Text>
                    <Text style={styles.detailValue}>{item.yetToSupply}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Yet to Install</Text>
                    <Text style={styles.detailValue}>{item.yetToInstall}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Completed</Text>
                    <Text style={styles.detailValue}>
                      {item.totalInstalled}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Progress</Text>
                    <Text style={styles.detailValue}>
                      {Math.min(item.percentInstalled, 100)}%
                    </Text>
                  </View>
                </View>

                {/* Sheet2 Sub-items */}
                {item.sheet2?.map((subItem: Sheet2Item, subIndex: number) => (
                  <View
                    key={subIndex}
                    style={[
                      styles.card,
                      {
                        marginTop: 8,
                        backgroundColor: "#f8fafc",
                        marginLeft: 16,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemName,
                        { fontSize: 11, marginBottom: 18 },
                      ]}
                    >
                      {subItem.subItemName}
                    </Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>
                          Yesterday Installed
                        </Text>
                        <Text style={styles.detailValue}>
                          {subItem.yesterdayProgressReport
                            ?.yesterdayInstalled ?? "0"}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>
                          Yesterday Supplied
                        </Text>
                        <Text style={styles.detailValue}>
                          {subItem.yesterdayProgressReport?.yesterdaySupplied ??
                            "0"}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>
                          Yesterday % Installed
                        </Text>
                        <Text style={styles.detailValue}>
                          {Math.min(
                            ((subItem.yesterdayProgressReport
                              ?.yesterdayInstalled ?? 0) /
                              (subItem.totalQuantity ?? 1)) *
                              100,
                            100,
                          )}
                          %
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>
                          Yesterday % Supplied
                        </Text>
                        <Text style={styles.detailValue}>
                          {Math.min(
                            ((subItem.yesterdayProgressReport
                              ?.yesterdaySupplied ?? 0) /
                              (subItem.totalQuantity ?? 1)) *
                              100,
                            100,
                          )}
                          %
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Yesterday Progress Photos */}
                {item.yesterdayProgressPhotos &&
                  item.yesterdayProgressPhotos.length > 0 && (
                    <View style={styles.section} break>
                      <Text style={styles.sectionTitle}>Progress Photos</Text>
                      <View style={styles.photosGrid}>
                        {item.yesterdayProgressPhotos.map(
                          (photo: ProgressPhoto, index: number) => (
                            <View
                              key={index}
                              style={[
                                styles.photoContainer,
                                {
                                  border: "1px solid #e2e8f0",
                                  padding: 10,
                                  borderRadius: 10,
                                },
                              ]}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  gap: 10,
                                  flexWrap: "wrap",
                                }}
                              >
                                {photo.photos.map(
                                  (
                                    photo: ProgressPhoto["photos"][number],
                                    photoIndex: number,
                                  ) => (
                                    <View key={photoIndex}>
                                      <Image
                                        src={photo.url ?? ""}
                                        style={styles.photo}
                                      />
                                    </View>
                                  ),
                                )}
                                <Text style={styles.photoDescription}>
                                  {
                                    item?.yesterdayProgressPhotos?.[index]
                                      ?.description
                                  }
                                </Text>
                              </View>
                            </View>
                          ),
                        )}
                      </View>
                    </View>
                  )}

                {item.blockages && item.blockages.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Blockages</Text>
                    <View style={styles.blockagesGrid}>
                      {item.blockages.map(
                        (blockage: BlockageItem, index: number) => (
                          <View key={index} style={styles.blockageCard}>
                            <Text style={styles.blockageTitle}>
                              {blockage.type === "INTERNAL"
                                ? "Internal"
                                : "Client"}
                            </Text>
                            <Text style={styles.blockageDescription}>
                              Description: {blockage.description}
                            </Text>
                            <Text style={styles.blockageDescription}>
                              Weather Report: {blockage.weatherReport}
                            </Text>
                            <Text style={styles.blockageDescription}>
                              Reported on{" "}
                              {formatDate(blockage.blockageStartTime)}
                            </Text>
                            <Text
                              style={[
                                styles.blockageDescription,
                                {
                                  marginBottom: 10,
                                },
                              ]}
                            >
                              Closed on{" "}
                              {blockage.blockageEndTime
                                ? formatDate(blockage.blockageEndTime)
                                : "N/A"}
                            </Text>
                            {blockage.blockagePhotos &&
                              blockage.blockagePhotos.length > 0 && (
                                <View
                                  style={[
                                    styles.photosGrid,
                                    { flexDirection: "column", gap: 10 },
                                  ]}
                                >
                                  {blockage.blockagePhotos.map(
                                    (
                                      photo: BlockageItem["blockagePhotos"][number],
                                      photoIndex: number,
                                    ) => (
                                      <View
                                        key={photoIndex}
                                        style={styles.photoContainer}
                                      >
                                        <Image
                                          src={photo.url}
                                          style={styles.photo}
                                        />
                                        <Text
                                          style={[
                                            styles.photoDescription,
                                            {
                                              fontSize: 10,
                                            },
                                          ]}
                                        >
                                          {photo.fileName}
                                        </Text>
                                      </View>
                                    ),
                                  )}
                                </View>
                              )}
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                )}
              </View>
            ),
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
