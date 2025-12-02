/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { type PriorityLevel, type ReportStatus } from "@prisma/client";
import type { projectSchema } from "@/validators/prisma-schmea.validator";
import type { z } from "zod";

type Project = z.infer<typeof projectSchema>;
type Sheet1Item = NonNullable<
  Project["latestProjectVersion"]["sheet1"]
>[number];
type BlockageItem = NonNullable<Sheet1Item["blockages"]>[number];

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
  table: { width: "100%", marginTop: 8 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
  tableCell: { flex: 1, padding: 4, fontSize: 10 },
  headerCell: { flex: 1, padding: 4, fontSize: 10, fontWeight: "bold" },
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

export const ReportTeamPDF: React.FC<ReportPDFProps> = ({ report }) => {
  const latest = report.project.latestProjectVersion;
  // remove empty blockages
  const internalBlockages =
    report.project.latestProjectVersion?.sheet1?.flatMap((item: Sheet1Item) =>
      item.blockages
        ?.filter((blockage: BlockageItem) => blockage.type === "INTERNAL")
        ?.filter((blockage: BlockageItem) => blockage.description !== ""),
    );
  // remove empty blockages
  const clientBlockages = report.project.latestProjectVersion?.sheet1?.flatMap(
    (item: Sheet1Item) =>
      item.blockages
        ?.filter((blockage: BlockageItem) => blockage.type === "CLIENT")
        ?.filter((blockage: BlockageItem) => blockage.description !== ""),
  );
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* client information */}
        <View style={styles.header}>
          <Text style={styles.title}>{report.projectName}</Text>
          <Text style={styles.subtitle}>
            Report Date:{" "}
            {formatDate(latest?.yesterdayReportCreatedAt ?? new Date())}
          </Text>
          <Text style={styles.subtitle}>
            Client Name: {latest?.client?.clientName ?? "-"}
          </Text>
          <Text style={styles.subtitle}>
            Site Address: {latest?.siteLocation?.city ?? ""},{" "}
            {latest?.siteLocation?.state ?? ""}
          </Text>
          <Text style={styles.subtitle}>Contractor: Uniglaze</Text>
          <Text style={styles.subtitle}>
            Submitted by: {report.submittedBy}
          </Text>
        </View>

        {/* Sheet 1 Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sheet 1</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Main Task</Text>
              <Text style={styles.headerCell}>Units</Text>
              <Text style={styles.headerCell}>Total Qty</Text>
              <Text style={styles.headerCell}>Total Supplied</Text>
              <Text style={styles.headerCell}>Total Installed</Text>
              <Text style={styles.headerCell}>Yet to Supply</Text>
              <Text style={styles.headerCell}>Yet to Install</Text>
              <Text style={styles.headerCell}>% Supplied</Text>
              <Text style={styles.headerCell}>% Installed</Text>
            </View>
            {latest?.sheet1?.map((item, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.tableCell}>{item.itemName}</Text>
                <Text style={styles.tableCell}>{item.unit}</Text>
                <Text style={styles.tableCell}>{item.totalQuantity}</Text>
                <Text style={styles.tableCell}>{item.totalSupplied}</Text>
                <Text style={styles.tableCell}>{item.totalInstalled}</Text>
                <Text style={styles.tableCell}>{item.yetToSupply}</Text>
                <Text style={styles.tableCell}>{item.yetToInstall}</Text>
                <Text style={styles.tableCell}>
                  {Math.min(item.percentSupplied, 100)}%
                </Text>
                <Text style={styles.tableCell}>
                  {Math.min(item.percentInstalled, 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sheet 2 Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sheet 2</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Main Task</Text>
              <Text style={styles.headerCell}>Sub Task</Text>
              <Text style={styles.headerCell}>Unit</Text>
              <Text style={styles.headerCell}>Total Qty</Text>
              <Text style={styles.headerCell}>Total Supplied</Text>
              <Text style={styles.headerCell}>Total Installed</Text>
              <Text style={styles.headerCell}>Y&apos;day Installed</Text>
              <Text style={styles.headerCell}>Y&apos;day Supplied</Text>
              <Text style={styles.headerCell}>% Installed</Text>
              <Text style={styles.headerCell}>% Supplied</Text>
            </View>
            {latest?.sheet1?.flatMap((item, idx) =>
              (item.sheet2 ?? []).map((sub, sidx) => (
                <View key={`${idx}-${sidx}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.itemName}</Text>
                  <Text style={styles.tableCell}>{sub.subItemName}</Text>
                  <Text style={styles.tableCell}>{sub.unit}</Text>
                  <Text style={styles.tableCell}>{sub.totalQuantity}</Text>
                  <Text style={styles.tableCell}>{sub.totalSupplied}</Text>
                  <Text style={styles.tableCell}>{sub.totalInstalled}</Text>
                  <Text style={styles.tableCell}>
                    {sub.yesterdayProgressReport?.yesterdayInstalled ?? "-"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {sub.yesterdayProgressReport?.yesterdaySupplied ?? "-"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {Math.min(sub.percentInstalled, 100)}%
                  </Text>
                  <Text style={styles.tableCell}>
                    {Math.min(sub.percentSupplied, 100)}%
                  </Text>
                </View>
              )),
            )}
          </View>
        </View>

        {/* Sheet1 Progress Photos */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
            Progress Photos
          </Text>
          {report.project.latestProjectVersion?.sheet1?.map(
            (item: Sheet1Item, index: number) => (
              <View key={index} style={styles.section}>
                {item.yesterdayProgressPhotos &&
                  item.yesterdayProgressPhotos.length > 0 && (
                    <View style={styles.section} break>
                      <View style={[styles.section, { width: "100%" }]}>
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
                                  flexDirection: "row",
                                  gap: 10,
                                  width: "100%",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.title,
                                  {
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    width: "30%",
                                  },
                                ]}
                              >
                                {item.itemName}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "column",
                                  gap: 10,
                                  width: "70%",
                                }}
                              >
                                {photo.photos
                                  .slice(0, 1)
                                  .map(
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
                                <Text
                                  style={[
                                    styles.photoDescription,
                                    { fontSize: 10 },
                                  ]}
                                >
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
              </View>
            ),
          )}
        </View> */}

        {/* Progress Photos per Sheet1 Main Task */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Photos & Description</Text>
          {latest?.sheet1?.map((item, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  marginBottom: 3,
                  color: "#0f172a",
                }}
              >
                {idx + 1}. {item.itemName}
              </Text>
              {item.yesterdayProgressPhotos?.length ? (
                item.yesterdayProgressPhotos.map((photoSet, pid) => (
                  <View key={pid} style={styles.photoContainer}>
                    {photoSet.photos.slice(0, 1).map((photo, phidx) => {
                      const imageUrl = photo.url;
                      // Only render image if URL is valid and not empty
                      if (!imageUrl || imageUrl.trim() === "") {
                        return null;
                      }
                      return (
                        <Image
                          key={phidx}
                          src={imageUrl}
                          style={styles.photo}
                          cache={false}
                        />
                      );
                    })}
                    <Text style={styles.photoDescription}>
                      Progress Description:{" "}
                      {photoSet.description || "No description"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.photoDescription}>
                  No progress photos available
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Sheet1 Internal Blockages */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
            Internal Blockages
          </Text>
          {internalBlockages && internalBlockages?.length > 0 ? (
            internalBlockages?.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={[styles.section, { marginTop: 20 }]}>
                  <View style={styles.blockagesGrid}>
                    <View style={styles.blockageCard}>
                      <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
                        {item?.category}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View>
                          <Text style={styles.blockageTitle}>
                            {item?.type === "INTERNAL" ? "Internal" : "Client"}
                          </Text>
                          <Text style={styles.blockageDescription}>
                            Description: {item?.description}
                          </Text>
                          <Text style={styles.blockageDescription}>
                            Weather Report: {item?.weatherReport}
                          </Text>
                          <Text style={styles.blockageDescription}>
                            Reported on{" "}
                            {formatDate(item?.blockageStartTime ?? new Date())}
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
                            {item?.blockageEndTime
                              ? formatDate(item?.blockageEndTime)
                              : "N/A"}
                          </Text>
                        </View>
                        {item?.blockagePhotos &&
                          item?.blockagePhotos.length > 0 && (
                            <View
                              style={[
                                styles.photosGrid,
                                { flexDirection: "column", gap: 10 },
                              ]}
                            >
                              {item?.blockagePhotos
                                .slice(0, 1)
                                .map(
                                  (
                                    photo: BlockageItem["blockagePhotos"][number],
                                    photoIndex: number,
                                  ) => (
                                    <View
                                      key={photoIndex}
                                      style={styles.photoContainer}
                                    >
                                      <Image
                                        src={photo.url ?? ""}
                                        style={styles.photo}
                                      />
                                    </View>
                                  ),
                                )}
                            </View>
                          )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text>No Internal Blockages</Text>
          )}
        </View> */}

        {/* Sheet1 Client Blockages */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
            Client Blockages
          </Text>
          {clientBlockages && clientBlockages?.length > 0 ? (
            clientBlockages?.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={[styles.section, { marginTop: 20 }]}>
                  <View style={styles.blockagesGrid}>
                    <View style={styles.blockageCard}>
                      <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
                        {item?.category}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View>
                          <Text style={styles.blockageTitle}>
                            {item?.type === "CLIENT" ? "Client" : "Internal"}
                          </Text>
                          <Text style={styles.blockageDescription}>
                            Description: {item?.description}
                          </Text>
                          <Text style={styles.blockageDescription}>
                            Weather Report: {item?.weatherReport}
                          </Text>
                          <Text style={styles.blockageDescription}>
                            Reported on{" "}
                            {formatDate(item?.blockageStartTime ?? new Date())}
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
                            {item?.blockageEndTime
                              ? formatDate(item?.blockageEndTime)
                              : "N/A"}
                          </Text>
                        </View>
                        {item?.blockagePhotos &&
                          item?.blockagePhotos.length > 0 && (
                            <View
                              style={[
                                styles.photosGrid,
                                { flexDirection: "column", gap: 10 },
                              ]}
                            >
                              {item?.blockagePhotos
                                .slice(0, 1)
                                .map(
                                  (
                                    photo: BlockageItem["blockagePhotos"][number],
                                    photoIndex: number,
                                  ) => (
                                    <View
                                      key={photoIndex}
                                      style={styles.photoContainer}
                                    >
                                      <Image
                                        src={photo.url ?? ""}
                                        style={styles.photo}
                                      />
                                    </View>
                                  ),
                                )}
                            </View>
                          )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text>No Client Blockages</Text>
          )}
        </View> */}

        {/* Client Blockages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Client-Side Blockages & Issues
          </Text>
          {clientBlockages?.length ? (
            clientBlockages.map((blockage, idx) => (
              <View key={idx} style={styles.blockageCard}>
                <Text style={styles.blockageTitle}>
                  Blockage: {blockage?.category ?? "N/A"}
                </Text>
                <Text style={styles.blockageDescription}>
                  Type: <Text style={styles.blockageType}>Client</Text>
                </Text>
                <Text style={styles.blockageDescription}>
                  Description: {blockage?.description}
                </Text>
                <Text style={styles.blockageDescription}>
                  Weather Report: {blockage?.weatherReport}
                </Text>
                <Text style={styles.blockageDescription}>
                  Reported on:{" "}
                  {formatDate(blockage?.blockageStartTime ?? new Date())}
                </Text>
                <Text style={styles.blockageDescription}>
                  Closed on:{" "}
                  {blockage?.blockageEndTime
                    ? formatDate(blockage.blockageEndTime)
                    : "N/A"}
                </Text>
                {blockage?.blockagePhotos?.length &&
                blockage.blockagePhotos[0]?.url &&
                blockage.blockagePhotos[0].url.trim() !== "" ? (
                  <Image
                    src={blockage.blockagePhotos[0].url}
                    style={styles.photo}
                    cache={false}
                  />
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.blockageDescription}>
              No client-side blockages available
            </Text>
          )}
        </View>

        {/* Internal Blockages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Internal Blockages & Issues
          </Text>
          {internalBlockages && internalBlockages?.length > 0 ? (
            internalBlockages.map((blockage, idx) => (
              <View key={idx} style={styles.blockageCard}>
                <Text style={styles.blockageTitle}>
                  Blockage: {blockage?.category ?? "N/A"}
                </Text>
                <Text style={styles.blockageDescription}>
                  Type: <Text style={styles.blockageType}>Internal</Text>
                </Text>
                <Text style={styles.blockageDescription}>
                  Description: {blockage?.description}
                </Text>
                <Text style={styles.blockageDescription}>
                  Weather Report: {blockage?.weatherReport}
                </Text>
                <Text style={styles.blockageDescription}>
                  Reported on:{" "}
                  {formatDate(blockage?.blockageStartTime ?? new Date())}
                </Text>
                <Text style={styles.blockageDescription}>
                  Closed on:{" "}
                  {blockage?.blockageEndTime
                    ? formatDate(blockage.blockageEndTime)
                    : "N/A"}
                </Text>
                {blockage?.blockagePhotos?.length &&
                blockage.blockagePhotos[0]?.url &&
                blockage.blockagePhotos[0].url.trim() !== "" ? (
                  <Image
                    src={blockage.blockagePhotos[0].url}
                    style={styles.photo}
                    cache={false}
                  />
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.blockageDescription}>
              No internal blockages available
            </Text>
          )}
        </View>

        {/* footer */}
        <Text
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginTop: 10,
            textAlign: "center",
            width: "100%",
          }}
        >
          This report is generated on {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
};

export const ReportClientPDF: React.FC<ReportPDFProps> = ({ report }) => {
  const latest = report.project.latestProjectVersion;
  // remove empty blockages - only CLIENT type blockages for client reports
  const clientBlockages = report.project.latestProjectVersion?.sheet1?.flatMap(
    (item: Sheet1Item) =>
      item.blockages
        ?.filter((blockage: BlockageItem) => blockage.type === "CLIENT")
        ?.filter((blockage: BlockageItem) => blockage.description !== ""),
  );
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* client information */}
        <View style={styles.header}>
          <Text style={styles.title}>{report.projectName}</Text>
          <Text style={styles.subtitle}>
            Report Date:{" "}
            {formatDate(latest?.yesterdayReportCreatedAt ?? new Date())}
          </Text>
          <Text style={styles.subtitle}>
            Client Name: {latest?.client?.clientName ?? "-"}
          </Text>
          <Text style={styles.subtitle}>
            Site Address: {latest?.siteLocation?.city ?? ""},{" "}
            {latest?.siteLocation?.state ?? ""}
          </Text>
          <Text style={styles.subtitle}>Contractor: Uniglaze</Text>
          <Text style={styles.subtitle}>
            Submitted by: {report.submittedBy}
          </Text>
        </View>

        {/* Sheet 1 Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sheet 1</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Main Task</Text>
              <Text style={styles.headerCell}>Units</Text>
              <Text style={styles.headerCell}>Total Qty</Text>
              <Text style={styles.headerCell}>Total Supplied</Text>
              <Text style={styles.headerCell}>Total Installed</Text>
              <Text style={styles.headerCell}>Yet to Supply</Text>
              <Text style={styles.headerCell}>Yet to Install</Text>
              <Text style={styles.headerCell}>% Supplied</Text>
              <Text style={styles.headerCell}>% Installed</Text>
            </View>
            {latest?.sheet1?.map((item, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.tableCell}>{item.itemName}</Text>
                <Text style={styles.tableCell}>{item.unit}</Text>
                <Text style={styles.tableCell}>{item.totalQuantity}</Text>
                <Text style={styles.tableCell}>{item.totalSupplied}</Text>
                <Text style={styles.tableCell}>{item.totalInstalled}</Text>
                <Text style={styles.tableCell}>{item.yetToSupply}</Text>
                <Text style={styles.tableCell}>{item.yetToInstall}</Text>
                <Text style={styles.tableCell}>
                  {Math.min(item.percentSupplied, 100)}%
                </Text>
                <Text style={styles.tableCell}>
                  {Math.min(item.percentInstalled, 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sheet 2 Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sheet 2</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Main Task</Text>
              <Text style={styles.headerCell}>Sub Task</Text>
              <Text style={styles.headerCell}>Unit</Text>
              <Text style={styles.headerCell}>Total Qty</Text>
              <Text style={styles.headerCell}>Total Supplied</Text>
              <Text style={styles.headerCell}>Total Installed</Text>
              <Text style={styles.headerCell}>Y&apos;day Installed</Text>
              <Text style={styles.headerCell}>Y&apos;day Supplied</Text>
              <Text style={styles.headerCell}>% Installed</Text>
              <Text style={styles.headerCell}>% Supplied</Text>
            </View>
            {latest?.sheet1?.flatMap((item, idx) =>
              (item.sheet2 ?? []).map((sub, sidx) => (
                <View key={`${idx}-${sidx}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.itemName}</Text>
                  <Text style={styles.tableCell}>{sub.subItemName}</Text>
                  <Text style={styles.tableCell}>{sub.unit}</Text>
                  <Text style={styles.tableCell}>{sub.totalQuantity}</Text>
                  <Text style={styles.tableCell}>{sub.totalSupplied}</Text>
                  <Text style={styles.tableCell}>{sub.totalInstalled}</Text>
                  <Text style={styles.tableCell}>
                    {sub.yesterdayProgressReport?.yesterdayInstalled ?? "-"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {sub.yesterdayProgressReport?.yesterdaySupplied ?? "-"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {Math.min(sub.percentInstalled, 100)}%
                  </Text>
                  <Text style={styles.tableCell}>
                    {Math.min(sub.percentSupplied, 100)}%
                  </Text>
                </View>
              )),
            )}
          </View>
        </View>

        {/* Progress Photos per Sheet1 Main Task */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Photos & Description</Text>
          {latest?.sheet1?.map((item, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  marginBottom: 3,
                  color: "#0f172a",
                }}
              >
                {idx + 1}. {item.itemName}
              </Text>
              {item.yesterdayProgressPhotos?.length ? (
                item.yesterdayProgressPhotos.map((photoSet, pid) => (
                  <View key={pid} style={styles.photoContainer}>
                    {photoSet.photos.slice(0, 1).map((photo, phidx) => {
                      const imageUrl = photo.url;
                      // Only render image if URL is valid and not empty
                      if (!imageUrl || imageUrl.trim() === "") {
                        return null;
                      }
                      return (
                        <Image
                          key={phidx}
                          src={imageUrl}
                          style={styles.photo}
                          cache={false}
                        />
                      );
                    })}
                    <Text style={styles.photoDescription}>
                      Progress Description:{" "}
                      {photoSet.description || "No description"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.photoDescription}>
                  No progress photos available
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Client Blockages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Client-Side Blockages & Issues
          </Text>
          {clientBlockages?.length ? (
            clientBlockages.map((blockage, idx) => (
              <View key={idx} style={styles.blockageCard}>
                <Text style={styles.blockageTitle}>
                  Blockage: {blockage?.category ?? "N/A"}
                </Text>
                <Text style={styles.blockageDescription}>
                  Type: <Text style={styles.blockageType}>Client</Text>
                </Text>
                <Text style={styles.blockageDescription}>
                  Description: {blockage?.description}
                </Text>
                <Text style={styles.blockageDescription}>
                  Weather Report: {blockage?.weatherReport}
                </Text>
                <Text style={styles.blockageDescription}>
                  Reported on:{" "}
                  {formatDate(blockage?.blockageStartTime ?? new Date())}
                </Text>
                <Text style={styles.blockageDescription}>
                  Closed on:{" "}
                  {blockage?.blockageEndTime
                    ? formatDate(blockage.blockageEndTime)
                    : "N/A"}
                </Text>
                {blockage?.blockagePhotos?.length &&
                blockage.blockagePhotos[0]?.url &&
                blockage.blockagePhotos[0].url.trim() !== "" ? (
                  <Image
                    src={blockage.blockagePhotos[0].url}
                    style={styles.photo}
                    cache={false}
                  />
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.blockageDescription}>
              No client-side blockages available
            </Text>
          )}
        </View>

        {/* footer */}
        <Text
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginTop: 10,
            textAlign: "center",
            width: "100%",
          }}
        >
          This report is generated on {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
};
