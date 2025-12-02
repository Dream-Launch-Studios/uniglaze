import { create } from "zustand";
import type z from "zod";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { type projectSchema } from "../validators/prisma-schmea.validator";

type ProjectData = Partial<z.infer<typeof projectSchema>>;

type ProjectActions = {
  setProject: (data: Partial<z.infer<typeof projectSchema>>) => void;

  closeBlockage: (sheet1Index: number, blockageIndex: number) => void;

  getPendingBlockages: (
    sheet1Index: number,
  ) => NonNullable<
    NonNullable<
      NonNullable<
        z.infer<typeof projectSchema>["latestProjectVersion"]
      >["sheet1"]
    >[number]["blockages"]
  >;

  pushToBlockages: (
    sheet1Index: number,
    data: NonNullable<
      NonNullable<
        NonNullable<
          z.infer<typeof projectSchema>["latestProjectVersion"]
        >["sheet1"]
      >[number]["blockages"]
    >[number],
  ) => void;

  getProgressPhotos: (
    sheet1Index: number,
  ) => NonNullable<
    NonNullable<
      NonNullable<
        z.infer<typeof projectSchema>["latestProjectVersion"]
      >["sheet1"]
    >[number]["yesterdayProgressPhotos"]
  >;

  resetProgressPhotos: () => void;

  pushToProgressPhotos: (
    sheet1Index: number,
    data: NonNullable<
      NonNullable<
        NonNullable<
          z.infer<typeof projectSchema>["latestProjectVersion"]
        >["sheet1"]
      >[number]["yesterdayProgressPhotos"]
    >[number],
  ) => void;

  deleteProgressPhotos: (
    sheet1Index: number,
    progressPhotoIndex: number,
  ) => void;

  getResolvedBlockages: (
    sheet1Index: number,
  ) => NonNullable<
    NonNullable<
      NonNullable<
        z.infer<typeof projectSchema>["latestProjectVersion"]
      >["sheet1"]
    >[number]["blockages"]
  >;

  getSheet1Blockages: (
    sheet1Index: number,
  ) => NonNullable<
    NonNullable<
      NonNullable<
        z.infer<typeof projectSchema>["latestProjectVersion"]
      >["sheet1"]
    >[number]["blockages"]
  >;

  getSheet1: () => NonNullable<
    z.infer<typeof projectSchema>["latestProjectVersion"]
  >["sheet1"];

  getSheet2: (
    sheet1Index: number,
  ) => NonNullable<
    NonNullable<z.infer<typeof projectSchema>["latestProjectVersion"]>["sheet1"]
  >[number]["sheet2"];

  getSheet1Length: () => number;

  getTotalNumOfSubItemsInSheet1: (sheet1Index: number) => number;

  getProject: () => Partial<z.infer<typeof projectSchema>>;

  getComments: () => NonNullable<
    z.infer<typeof projectSchema>["latestProjectVersion"]["comments"]
  >;

  getYesterdayReport: (
    sheet1Index: number,
    sheet2Index: number,
  ) => {
    yesterdaySupplied: number;
    yesterdayInstalled: number;
    reportCreatedAt: Date;
  };

  setProjectId: (projectId: number) => void;

  pushToComments: (
    data: NonNullable<
      z.infer<typeof projectSchema>["latestProjectVersion"]["comments"]
    >[number],
  ) => void;

  pushToSheet1: (
    data: NonNullable<
      z.infer<typeof projectSchema>["latestProjectVersion"]["sheet1"]
    >[number],
  ) => void;

  editSheet1Item: (
    index: number,
    data: NonNullable<
      NonNullable<
        z.infer<typeof projectSchema>["latestProjectVersion"]
      >["sheet1"]
    >[number],
  ) => void;

  deleteSheet1Item: (index: number) => void;

  deleteSheet2Item: (sheet1Index: number, sheet2Index: number) => void;

  resetProject: () => void;

  pushToSheet2: (
    sheet1Index: number,
    data: NonNullable<
      NonNullable<
        NonNullable<
          z.infer<typeof projectSchema>["latestProjectVersion"]
        >["sheet1"]
      >[number]["sheet2"]
    >[number],
  ) => void;

  editSheet2Item: (
    sheet1Index: number,
    sheet2Index: number,
    data: NonNullable<
      NonNullable<
        NonNullable<
          z.infer<typeof projectSchema>["latestProjectVersion"]
        >["sheet1"]
      >[number]["sheet2"]
    >[number],
  ) => void;

  deleteBlockage: (sheet1Index: number, blockageIndex: number) => void;

  setBlockageResolved: (sheet1Index: number, blockageIndex: number) => void;

  setYesterdayProgressReportOfItem: (
    sheet1Index: number,
    data: NonNullable<
      z.infer<typeof projectSchema>["latestProjectVersion"]["sheet1"]
    >[number]["yesterdayProgressPhotos"],
  ) => void;

  setYesterdayProgressReportOfSubItem: (
    sheet1Index: number,
    sheet2Index: number,
    data: NonNullable<
      z.infer<typeof projectSchema>["latestProjectVersion"]["sheet1"]
    >[number]["sheet2"][number]["yesterdayProgressReport"],
  ) => void;

  setYesterdayReportStatus: (
    data: NonNullable<
      z.infer<typeof projectSchema>["latestProjectVersion"]
    >["yesterdayReportStatus"],
  ) => void;

  updateSupplyAndInstallationsFromYesterdayProgressReport: () => void;
};

type ProjectState = ProjectData & ProjectActions;

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set, get) => ({
      setProject: (project) => set(project),

      closeBlockage: (sheet1Index: number, blockageIndex: number) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]?.blockages?.[
              blockageIndex
            ]
          )
            return;
          state.latestProjectVersion.sheet1[sheet1Index].blockages[
            blockageIndex
          ].blockageEndTime = new Date();
          state.latestProjectVersion.sheet1[sheet1Index].blockages[
            blockageIndex
          ].status = "RESOLVED";
        }),

      getResolvedBlockages: (sheet1Index: number) =>
        get().latestProjectVersion?.sheet1?.[sheet1Index]?.blockages?.filter(
          (blockage) => blockage.status === "RESOLVED",
        ) ?? [],

      getPendingBlockages: (sheet1Index: number) =>
        get().latestProjectVersion?.sheet1?.[sheet1Index]?.blockages?.filter(
          (blockage) => blockage.status === "PENDING",
        ) ?? [],

      getSheet1Blockages: (sheet1Index: number) =>
        get().latestProjectVersion?.sheet1?.[sheet1Index]?.blockages ?? [],

      getProject: () => get(),

      getSheet1: () => get().latestProjectVersion?.sheet1 ?? [],

      getSheet2: (sheet1Index) =>
        get().latestProjectVersion?.sheet1?.[sheet1Index]?.sheet2 ?? [],

      getSheet1Length: () => get().latestProjectVersion?.sheet1?.length ?? 0,

      getTotalNumOfSubItemsInSheet1: (sheet1Index) =>
        get().latestProjectVersion?.sheet1?.[sheet1Index]?.sheet2?.length ?? 0,

      getComments: () => get().latestProjectVersion?.comments ?? [],

      getYesterdayReport: (sheet1Index, sheet2Index) => {
        const sheet1Item = get().latestProjectVersion?.sheet1?.[sheet1Index];
        const sheet2Item = sheet1Item?.sheet2?.[sheet2Index];

        return {
          yesterdaySupplied:
            sheet2Item?.yesterdayProgressReport?.yesterdaySupplied ?? 0,
          yesterdayInstalled:
            sheet2Item?.yesterdayProgressReport?.yesterdayInstalled ?? 0,
          reportCreatedAt:
            get().latestProjectVersion?.yesterdayReportCreatedAt ?? new Date(),
        };
      },

      setProjectId: (projectId) => set((state) => ({ ...state, projectId })),

      pushToComments: (data) => {
        set((state) => ({
          ...state,
          latestProjectVersion: {
            ...state.latestProjectVersion,
            comments: [...(state.latestProjectVersion?.comments ?? []), data],
          },
        }));
      },

      pushToSheet1: (data) =>
        set((state) => ({
          ...state,
          latestProjectVersion: {
            ...state.latestProjectVersion,
            sheet1: [...(state.latestProjectVersion?.sheet1 ?? []), data],
          },
        })),

      editSheet1Item: (index, data) =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1?.[index]) return;
          state.latestProjectVersion.sheet1[index] = data;
        }),

      deleteSheet1Item: (index) =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1?.[index]) return;
          state.latestProjectVersion.sheet1 =
            state.latestProjectVersion.sheet1?.filter((_, i) => i !== index);
        }),

      deleteSheet2Item: (sheet1Index, sheet2Index) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]?.sheet2?.[
              sheet2Index
            ]
          )
            return;
          state.latestProjectVersion.sheet1[sheet1Index].sheet2 =
            state.latestProjectVersion.sheet1[sheet1Index].sheet2?.filter(
              (_, i) => i !== sheet2Index,
            );
        }),

      resetProject: () => {
        set({});
        useProjectStore.persist.clearStorage();
      },

      pushToSheet2: (sheet1Index, data) =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1?.[sheet1Index]) return;
          state.latestProjectVersion.sheet1[sheet1Index].sheet2 = [
            ...(state.latestProjectVersion.sheet1[sheet1Index].sheet2 ?? []),
            data,
          ];
        }),

      editSheet2Item: (sheet1Index, sheet2Index, data) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]?.sheet2?.[
              sheet2Index
            ]
          )
            return;
          state.latestProjectVersion.sheet1[sheet1Index].sheet2[sheet2Index] =
            data;
        }),

      // reset all the sheet1's progress photos
      resetProgressPhotos: () =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1) return;
          state.latestProjectVersion.sheet1.forEach((item) => {
            item.yesterdayProgressPhotos = [];
          });
        }),

      getProgressPhotos: (sheet1Index: number) =>
        get().latestProjectVersion?.sheet1?.[sheet1Index]
          ?.yesterdayProgressPhotos ?? [],

      pushToProgressPhotos: (
        sheet1Index: number,
        data: NonNullable<
          NonNullable<
            NonNullable<
              z.infer<typeof projectSchema>["latestProjectVersion"]
            >["sheet1"]
          >[number]["yesterdayProgressPhotos"]
        >[number],
      ) =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1?.[sheet1Index]) return;
          if (
            !state.latestProjectVersion.sheet1[sheet1Index]
              .yesterdayProgressPhotos?.length
          ) {
            state.latestProjectVersion.sheet1[
              sheet1Index
            ].yesterdayProgressPhotos = [data];
            return;
          }
          state.latestProjectVersion.sheet1[
            sheet1Index
          ].yesterdayProgressPhotos?.push(data);
        }),

      deleteProgressPhotos: (sheet1Index: number, progressPhotoIndex: number) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]
              ?.yesterdayProgressPhotos?.length
          )
            return;
          state.latestProjectVersion.sheet1[
            sheet1Index
          ].yesterdayProgressPhotos = state.latestProjectVersion.sheet1[
            sheet1Index
          ].yesterdayProgressPhotos?.filter((_, i) => i !== progressPhotoIndex);
        }),

      pushToBlockages: (sheet1Index, data) =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1?.[sheet1Index]) return;
          state.latestProjectVersion.sheet1[sheet1Index].blockages = [
            ...(state.latestProjectVersion.sheet1[sheet1Index].blockages ?? []),
            data,
          ];
        }),

      deleteBlockage: (sheet1Index, blockageIndex) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]?.blockages?.[
              blockageIndex
            ]
          )
            return;
          state.latestProjectVersion.sheet1[sheet1Index].blockages =
            state.latestProjectVersion.sheet1[sheet1Index].blockages?.filter(
              (_, i) => i !== blockageIndex,
            );
        }),

      setBlockageResolved: (sheet1Index: number, blockageIndex: number) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]?.blockages?.[
              blockageIndex
            ]
          )
            return;
          state.latestProjectVersion.sheet1[sheet1Index].blockages[
            blockageIndex
          ].status = "RESOLVED";

          state.latestProjectVersion.sheet1[sheet1Index].blockages[
            blockageIndex
          ].blockageEndTime = new Date();
        }),

      setYesterdayProgressReportOfItem: (sheet1Index, data) =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1?.[sheet1Index]) return;
          state.latestProjectVersion.sheet1[
            sheet1Index
          ].yesterdayProgressPhotos = data;
        }),

      setYesterdayProgressReportOfSubItem: (sheet1Index, sheet2Index, data) =>
        set((state) => {
          if (
            !state.latestProjectVersion?.sheet1?.[sheet1Index]?.sheet2?.[
              sheet2Index
            ]
          )
            return;
          state.latestProjectVersion.sheet1[sheet1Index].sheet2[
            sheet2Index
          ].yesterdayProgressReport = data;
        }),

      setYesterdayReportStatus: (data) =>
        set((state) => {
          if (!state.latestProjectVersion) return;
          state.latestProjectVersion.yesterdayReportStatus = data;
        }),

      updateSupplyAndInstallationsFromYesterdayProgressReport: () =>
        set((state) => {
          if (!state.latestProjectVersion?.sheet1) return;
          state.latestProjectVersion.sheet1.forEach((item) => {
            if (
              item.sheet2.every((subItem) => subItem.percentInstalled === 0)
            ) {
              item.actualStartDate = new Date();
            }
          });
          state.latestProjectVersion.sheet1.forEach((item) => {
            item.sheet2.forEach((subItem) => {
              if (subItem.yesterdayProgressReport) {
                const totalQuantity = subItem.totalQuantity ?? 0;

                const newTotalSupplied =
                  subItem.totalSupplied +
                  subItem.yesterdayProgressReport.yesterdaySupplied;
                const newTotalInstalled =
                  subItem.totalInstalled +
                  subItem.yesterdayProgressReport.yesterdayInstalled;

                // Hard cap at total quantity so we never exceed it
                subItem.totalSupplied = Math.min(
                  newTotalSupplied,
                  totalQuantity,
                );
                subItem.totalInstalled = Math.min(
                  newTotalInstalled,
                  totalQuantity,
                );
                subItem.percentSupplied = +(
                  (subItem.totalSupplied / subItem.totalQuantity) *
                  100
                ).toFixed(2);
                subItem.percentInstalled = +(
                  (subItem.totalInstalled / subItem.totalQuantity) *
                  100
                ).toFixed(2);
                if (subItem.connectWithSheet1Item) {
                  const newItemTotalSupplied =
                    item.totalSupplied +
                    (subItem.yesterdayProgressReport?.yesterdaySupplied ?? 0);
                  const newItemTotalInstalled =
                    item.totalInstalled +
                    (subItem.yesterdayProgressReport?.yesterdayInstalled ?? 0);

                  // Hard cap at item total quantity as well
                  item.totalSupplied = Math.min(
                    newItemTotalSupplied,
                    item.totalQuantity,
                  );
                  item.totalInstalled = Math.min(
                    newItemTotalInstalled,
                    item.totalQuantity,
                  );
                  item.yetToSupply = item.totalQuantity - item.totalSupplied;
                  item.yetToInstall = item.totalQuantity - item.totalInstalled;
                  item.percentSupplied = +(
                    (item.totalSupplied / item.totalQuantity) *
                    100
                  ).toFixed(2);
                  item.percentInstalled = +(
                    (item.totalInstalled / item.totalQuantity) *
                    100
                  ).toFixed(2);
                }
              }
            });
          });
          state.latestProjectVersion.sheet1.forEach((item) => {
            if (
              item.sheet2.every((subItem) => subItem.percentInstalled === 100)
            ) {
              item.actualEndDate = new Date();
            }
          });
        }),
    })),
    { name: "project", storage: createJSONStorage(() => localStorage) },
  ),
);
