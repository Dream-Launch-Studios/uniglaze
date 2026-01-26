import React, { useState, useEffect } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import type z from "zod";
import { useProjectStore } from "@/store/project.store";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import { toast } from "sonner";

// Define TypeScript interfaces
type ProjectSubItem = Omit<
  NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>[number],
  "sheet2"
>;
type SubTask = NonNullable<
  z.infer<typeof projectVersionSchema>["sheet1"]
>[number];
type NewSubTaskForm = Omit<
  SubTask["sheet2"][number],
  "yesterdayProgressReport" | "percentSupplied" | "percentInstalled"
> & {
  supplyTargetDate?: Date;
  installationTargetDate?: Date;
};

const sheet1Schema = projectVersionSchema.shape.sheet1;

interface Sheet2CreationProps {
  onNext: () => void;
  onPrevious: () => void;
  error?: string;
}

const Sheet2Creation: React.FC<Sheet2CreationProps> = ({
  onNext,
  onPrevious,
  error,
}) => {
  const sheet1 = useProjectStore((state) => state.latestProjectVersion?.sheet1);
  const { deleteSheet2Item, editSheet1Item, editSheet2Item, pushToSheet2 } =
    useProjectStore((state) => state);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [newSubTask, setNewSubTask] = useState<NewSubTaskForm>({
    subItemName: "",
    unit: "",
    totalQuantity: 0,
    totalSupplied: 0,
    totalInstalled: 0,
    connectWithSheet1Item: true,
    supplyTargetDate: undefined,
    installationTargetDate: undefined,
  });
  const [isAddingSubTask, setIsAddingSubTask] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const isHydrated = useProjectStore?.persist?.hasHydrated();

  // Auto-populate from Sheet 1 when item is selected
  useEffect(() => {
    if (!isHydrated) return;
    if (selectedItem !== null) {
      const sheet1Item = sheet1!.find(
        (item: ProjectSubItem, index: number) => index === selectedItem,
      );
      if (sheet1Item) {
        setNewSubTask((prev) => ({
          ...prev,
          itemName: sheet1Item.itemName,
          unit: sheet1Item.unit,
          totalQuantity: sheet1Item.totalQuantity,
          supplyTargetDate: sheet1Item.supplyTargetDate ? new Date(sheet1Item.supplyTargetDate) : undefined,
          installationTargetDate: sheet1Item.installationTargetDate ? new Date(sheet1Item.installationTargetDate) : undefined,
        }));
      }
    }
  }, [selectedItem, sheet1, isHydrated]);

  const validateSubTask = (subTask: NewSubTaskForm): string | null => {
    if (!subTask.subItemName.trim()) return "Sub-task name is required";
    if (!subTask.unit.trim()) return "Unit is required";
    return null;
  };

  const handleAddSubTask = (): void => {
    const validationError = validateSubTask(newSubTask);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (
      sheet1?.[selectedItem!]?.sheet2.find(
        (subTask) => subTask.subItemName === newSubTask.subItemName,
      )
    ) {
      alert("Sub-task already exists");
      return;
    }

    if (
      newSubTask.connectWithSheet1Item &&
      selectedItem !== null &&
      newSubTask.totalQuantity !== sheet1?.[selectedItem]?.totalQuantity
    ) {
      alert("Total quantity cannot be different from the main task");
      return;
    }

    const subTaskToAdd: NewSubTaskForm = {
      ...newSubTask,
    };

    if (selectedItem === null) {
      alert("Please select a main task first");
      return;
    }

    const subTasks = sheet1?.[selectedItem]?.sheet2;

    if (subTasks) {
      if (
        newSubTask.connectWithSheet1Item &&
        subTasks.filter(
          (subTask) =>
            subTask.connectWithSheet1Item === true &&
            subTask.subItemName !== newSubTask.subItemName,
        ).length > 0
      ) {
        toast.error("Only one sub-task can be connected to Sheet 1");
        return;
      }
    }

    if (subTaskToAdd.connectWithSheet1Item) {
      editSheet1Item(selectedItem, {
        blockages: sheet1?.[selectedItem]?.blockages ?? [],
        sheet2: [...(sheet1?.[selectedItem]?.sheet2 ?? [])],
        itemName: sheet1?.[selectedItem]?.itemName ?? "",
        unit: sheet1?.[selectedItem]?.unit ?? "",
        yetToSupply: sheet1?.[selectedItem]?.yetToSupply ?? 0,
        yetToInstall: sheet1?.[selectedItem]?.yetToInstall ?? 0,
        percentSupplied: +(
          (subTaskToAdd.totalSupplied / subTaskToAdd.totalQuantity) * 100
        ).toFixed(2),
        percentInstalled: +(
          (subTaskToAdd.totalInstalled / subTaskToAdd.totalQuantity) * 100
        ).toFixed(2),
        totalQuantity: subTaskToAdd.totalQuantity ?? 0,
        totalSupplied: subTaskToAdd.totalSupplied ?? 0,
        totalInstalled: subTaskToAdd.totalInstalled ?? 0,
        yesterdayProgressPhotos:
          sheet1?.[selectedItem]?.yesterdayProgressPhotos,
      });
    }

    // Inherit target dates from Sheet 1 if connected
    const sheet1Item = sheet1?.[selectedItem];
    const finalSubTask = {
      ...subTaskToAdd,
      percentSupplied: +(
        (subTaskToAdd.totalSupplied / subTaskToAdd.totalQuantity) * 100
      ).toFixed(2),
      percentInstalled: +(
        (subTaskToAdd.totalInstalled / subTaskToAdd.totalQuantity) * 100
      ).toFixed(2),
      supplyTargetDate: subTaskToAdd.connectWithSheet1Item && sheet1Item?.supplyTargetDate
        ? new Date(sheet1Item.supplyTargetDate)
        : subTaskToAdd.supplyTargetDate,
      installationTargetDate: subTaskToAdd.connectWithSheet1Item && sheet1Item?.installationTargetDate
        ? new Date(sheet1Item.installationTargetDate)
        : subTaskToAdd.installationTargetDate,
    };

    pushToSheet2(selectedItem, finalSubTask);

    setNewSubTask({
      subItemName: "",
      unit: "",
      totalQuantity: 0,
      totalSupplied: 0,
      totalInstalled: 0,
      connectWithSheet1Item: true,
      supplyTargetDate: undefined,
      installationTargetDate: undefined,
    });
    setIsAddingSubTask(false);
    // setSelectedItem(null);
  };

  const handleEditSubTask = (index: number): void => {
    if (!isHydrated) return;
    if (selectedItem === null) return;
    const subTask = sheet1?.[selectedItem]?.sheet2[index];
    if (!subTask) return;

    setNewSubTask({
      subItemName: subTask.subItemName,
      unit: subTask.unit,
      totalQuantity: subTask.totalQuantity,
      totalSupplied: subTask.totalSupplied,
      totalInstalled: subTask.totalInstalled,
      connectWithSheet1Item: subTask.connectWithSheet1Item,
      supplyTargetDate: subTask.supplyTargetDate ? new Date(subTask.supplyTargetDate) : undefined,
      installationTargetDate: subTask.installationTargetDate ? new Date(subTask.installationTargetDate) : undefined,
    });
    setEditingIndex(index);
    setIsAddingSubTask(true);
  };

  const handleUpdateSubTask = (): void => {
    const validationError = validateSubTask(newSubTask);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (
      newSubTask.connectWithSheet1Item &&
      selectedItem !== null &&
      newSubTask.totalQuantity !== sheet1?.[selectedItem]?.totalQuantity
    ) {
      alert("Total quantity cannot be different from the main task");
      return;
    }

    if (editingIndex === null || selectedItem === null) return;

    const subTasks = sheet1?.[selectedItem]?.sheet2;

    if (subTasks) {
      if (
        newSubTask.connectWithSheet1Item &&
        subTasks.filter(
          (subTask) =>
            subTask.connectWithSheet1Item === true &&
            subTask.subItemName !== newSubTask.subItemName,
        ).length > 0
      ) {
        toast.error("Only one sub-task can be connected to Sheet 1");
        return;
      }
    }

    const sheet1Item = sheet1?.[selectedItem];
    const updatedSubTask = {
      subItemName: newSubTask.subItemName,
      unit: newSubTask.unit,
      totalQuantity: newSubTask.totalQuantity,
      totalSupplied: newSubTask.totalSupplied,
      totalInstalled: newSubTask.totalInstalled,
      connectWithSheet1Item: newSubTask.connectWithSheet1Item,
      supplyTargetDate: newSubTask.connectWithSheet1Item && sheet1Item?.supplyTargetDate
        ? new Date(sheet1Item.supplyTargetDate)
        : newSubTask.supplyTargetDate,
      installationTargetDate: newSubTask.connectWithSheet1Item && sheet1Item?.installationTargetDate
        ? new Date(sheet1Item.installationTargetDate)
        : newSubTask.installationTargetDate,
    };

    editSheet2Item(selectedItem, editingIndex, {
      ...updatedSubTask,
      percentSupplied: +(
        (updatedSubTask.totalSupplied / updatedSubTask.totalQuantity) * 100
      ).toFixed(2),
      percentInstalled: +(
        (updatedSubTask.totalInstalled / updatedSubTask.totalQuantity) * 100
      ).toFixed(2),
    });

    if (updatedSubTask.connectWithSheet1Item) {
      editSheet1Item(selectedItem, {
        blockages: sheet1?.[selectedItem]?.blockages ?? [],
        sheet2: [...(sheet1?.[selectedItem]?.sheet2 ?? [])],
        itemName: sheet1?.[selectedItem]?.itemName ?? "",
        unit: sheet1?.[selectedItem]?.unit ?? "",
        yetToSupply: sheet1?.[selectedItem]?.yetToSupply ?? 0,
        yetToInstall: sheet1?.[selectedItem]?.yetToInstall ?? 0,
        percentSupplied: +(
          (updatedSubTask.totalSupplied / updatedSubTask.totalQuantity) * 100
        ).toFixed(2),
        percentInstalled: +(
          (updatedSubTask.totalInstalled / updatedSubTask.totalQuantity) * 100
        ).toFixed(2),
        totalQuantity: updatedSubTask.totalQuantity ?? 0,
        totalSupplied: updatedSubTask.totalSupplied ?? 0,
        totalInstalled: updatedSubTask.totalInstalled ?? 0,
        yesterdayProgressPhotos:
          sheet1?.[selectedItem]?.yesterdayProgressPhotos,
      });
    }

    setNewSubTask({
      subItemName: "",
      unit: "",
      totalQuantity: 0,
      totalSupplied: 0,
      totalInstalled: 0,
      connectWithSheet1Item: true,
    });
    setEditingIndex(null);
    setIsAddingSubTask(false);
  };

  const handleDeleteSubTask = (index: number): void => {
    if (selectedItem === null) return;
    deleteSheet2Item(selectedItem, index);
  };

  const handleCancelEdit = (): void => {
    setNewSubTask({
      subItemName: "",
      unit: "",
      totalQuantity: 0,
      totalSupplied: 0,
      totalInstalled: 0,
      connectWithSheet1Item: true,
    });
    setEditingIndex(null);
    setIsAddingSubTask(false);
    // setSelectedItem(null);
  };

  const handleBulkAddFromSheet1 = (): void => {
    if (selectedItem === null) {
      alert("Please select a main task first");
      return;
    }

    const sheet1Item = sheet1!.find(
      (item: ProjectSubItem, index: number) => index === selectedItem,
    );
    if (!sheet1Item) return;

    // Create default sub-tasks based on common patterns
    const defaultSubTasks: NewSubTaskForm[] = [
      {
        subItemName: `${sheet1Item.itemName} - North Face`,
        unit: sheet1Item.unit,
        totalQuantity: sheet1Item.totalQuantity,
        totalSupplied: sheet1Item.totalSupplied,
        totalInstalled: sheet1Item.totalInstalled,
        connectWithSheet1Item: sheet1?.[selectedItem]?.sheet2
          ? sheet1?.[selectedItem]?.sheet2?.filter(
              (subTask) => subTask.connectWithSheet1Item === true,
            ).length === 0
          : true,
      },
      {
        subItemName: `${sheet1Item.itemName} - South Face`,
        unit: sheet1Item.unit,
        totalQuantity: sheet1Item.totalQuantity,
        totalSupplied: sheet1Item.totalSupplied,
        totalInstalled: sheet1Item.totalInstalled,
        connectWithSheet1Item: false,
      },
      {
        subItemName: `${sheet1Item.itemName} - East Face`,
        unit: sheet1Item.unit,
        totalQuantity: sheet1Item.totalQuantity,
        totalSupplied: sheet1Item.totalSupplied,
        totalInstalled: sheet1Item.totalInstalled,
        connectWithSheet1Item: false,
      },
      {
        subItemName: `${sheet1Item.itemName} - West Face`,
        unit: sheet1Item.unit,
        totalQuantity: sheet1Item.totalQuantity,
        totalSupplied: sheet1Item.totalSupplied,
        totalInstalled: sheet1Item.totalInstalled,
        connectWithSheet1Item: false,
      },
    ];

    defaultSubTasks.forEach((subTask) => {
      pushToSheet2(selectedItem, {
        ...subTask,
        percentSupplied: +(
          (subTask.totalSupplied / subTask.totalQuantity) * 100
        ).toFixed(2),
        percentInstalled: +(
          (subTask.totalInstalled / subTask.totalQuantity) * 100
        ).toFixed(2),
      });
    });

    // setSelectedItem(null);
  };

  const getSubTasksByItem = (itemName: string) => {
    return (
      sheet1?.find((item: ProjectSubItem) => item.itemName === itemName)
        ?.sheet2 ?? []
    );
  };

  if (!isHydrated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Sheet 2 - Detailed Work Breakdown
        </h2>
        <p className="text-text-secondary">
          Break down Sheet 1 items into setSubTasksdetailed sub-tasks with photo
          tracking and visibility settings
        </p>
        {error && (
          <div className="bg-error/10 border-error/20 mt-4 rounded-lg border p-3">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Sheet 1 Items Selection */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-text-primary mb-3 font-medium">
          Select main task from Sheet 1
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sheet1?.map((item: ProjectSubItem, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedItem(index)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                selectedItem === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-text-primary font-medium">
                {item.itemName}
              </div>
              <div className="text-text-secondary text-sm">
                {item.totalQuantity} {item.unit}
              </div>
              <div className="text-text-secondary mt-1 text-xs">
                {getSubTasksByItem(item.itemName).length} sub-tasks
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Sub-Task Form */}
      {isAddingSubTask && (
        <div className="bg-surface border-border rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 font-medium">
            {editingIndex !== null ? "Edit Sub-Task" : "Add New Sub-Task"}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                main task *
              </label>
              <input
                type="text"
                value={
                  selectedItem !== null
                    ? (sheet1?.[selectedItem]!.itemName ?? "")
                    : ""
                }
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    subItemName: e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., UCW, Glass Panels"
                readOnly={selectedItem !== null}
              />
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Sub-Task *
              </label>
              <input
                type="text"
                value={newSubTask.subItemName}
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    subItemName: e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., North Face Installation"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Unit *
              </label>
              <input
                type="text"
                value={newSubTask.unit}
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    unit: e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., m, pcs, etc."
              />
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Total Quantity *
              </label>
              <input
                type="text"
                value={newSubTask.totalQuantity}
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    totalQuantity: +e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., 100"
              />
              <p className="text-text-secondary mt-1 text-xs">Numbers only.</p>
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Supplied *
              </label>
              <input
                type="text"
                value={newSubTask.totalSupplied}
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    totalSupplied: +e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., 100"
              />
              <p className="text-text-secondary mt-1 text-xs">Numbers only.</p>
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Installed *
              </label>
              <input
                type="text"
                value={newSubTask.totalInstalled}
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    totalInstalled: +e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., 100"
              />
              <p className="text-text-secondary mt-1 text-xs">Numbers only.</p>
            </div>

            <div className="flex items-end gap-2">
              <label className="text-text-secondary block text-sm font-medium">
                Connect with Sheet 1
              </label>
              <Checkbox
                checked={newSubTask.connectWithSheet1Item}
                onChange={(event) => {
                  const isConnected = event.target.checked;
                  const sheet1Item = sheet1?.[selectedItem ?? -1];
                  setNewSubTask((prev) => ({
                    ...prev,
                    connectWithSheet1Item: isConnected,
                    // Inherit target dates from Sheet 1 when connected
                    supplyTargetDate: isConnected && sheet1Item?.supplyTargetDate
                      ? new Date(sheet1Item.supplyTargetDate)
                      : prev.supplyTargetDate,
                    installationTargetDate: isConnected && sheet1Item?.installationTargetDate
                      ? new Date(sheet1Item.installationTargetDate)
                      : prev.installationTargetDate,
                  }));
                }}
              />
            </div>
            <p className="text-warning border-warning/30 bg-warning/10 -mt-1 rounded-md border px-3 py-2 text-xs">
              If linked to Sheet 1, this item’s Total quantity / Supplied / Installed must match the same values as the main item on Sheet 1.
            </p>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Supply Target Date
                {newSubTask.connectWithSheet1Item && (
                  <span className="text-text-secondary ml-1 text-xs">(Linked from Sheet 1)</span>
                )}
              </label>
              <input
                type="date"
                value={
                  newSubTask.supplyTargetDate?.toISOString().split("T")[0] ?? ""
                }
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    supplyTargetDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                disabled={newSubTask.connectWithSheet1Item}
                className={`border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                  newSubTask.connectWithSheet1Item
                    ? "bg-muted cursor-not-allowed opacity-60"
                    : ""
                }`}
              />
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Installation Target Date
                {newSubTask.connectWithSheet1Item && (
                  <span className="text-text-secondary ml-1 text-xs">(Linked from Sheet 1)</span>
                )}
              </label>
              <input
                type="date"
                value={
                  newSubTask.installationTargetDate?.toISOString().split("T")[0] ?? ""
                }
                onChange={(e) =>
                  setNewSubTask((prev) => ({
                    ...prev,
                    installationTargetDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                disabled={newSubTask.connectWithSheet1Item}
                className={`border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                  newSubTask.connectWithSheet1Item
                    ? "bg-muted cursor-not-allowed opacity-60"
                    : ""
                }`}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-3">
            <Button
              variant="default"
              onClick={
                editingIndex !== null ? handleUpdateSubTask : handleAddSubTask
              }
              iconName={editingIndex !== null ? "Save" : "Plus"}
              iconPosition="left"
            >
              {editingIndex !== null ? "Update Sub-Task" : "Add Sub-Task"}
            </Button>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Add Button */}
      {selectedItem !== null && !isAddingSubTask && (
        <div className="bg-info/10 border-info/20 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-info mb-1 font-medium">Quick Setup</h3>
              <p className="text-text-secondary text-sm">
                Automatically create sub-tasks for all faces (North, South,
                East, West)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAddFromSheet1}
              iconName="Zap"
              iconPosition="left"
              disabled={selectedItem === null}
            >
              Bulk Add Sub-Tasks
            </Button>
          </div>
        </div>
      )}

      {/* Sub-Tasks Table */}
      <div className="bg-surface border-border overflow-hidden rounded-lg border">
        <div className="border-border border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-primary font-medium">
              Sub-Tasks (
              {selectedItem !== null
                ? sheet1?.[selectedItem]?.sheet2.length
                : 0}
              )
            </h3>
            {!isAddingSubTask && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingSubTask(true)}
                iconName="Plus"
                iconPosition="left"
                disabled={selectedItem === null}
              >
                Add Sub-Task
              </Button>
            )}
          </div>
        </div>

        {selectedItem === null ? (
          <div className="p-8 text-center">
            <Icon name="List" size={48} className="text-muted mx-auto mb-4" />
            <p className="text-text-secondary mb-2">No sub-tasks added yet</p>
            <p className="text-text-secondary text-sm">
              Select a main task and add sub-tasks to break down the work
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Item
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Sub-Task
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Unit
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Total
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Supplied
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Installed
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Connected to sheet1
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Supply Target Date
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Installation Target Date
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {sheet1?.[selectedItem]?.sheet2.map(
                  (subTask, index: number) => (
                    <tr key={index} className="hover:bg-muted/20">
                      <td className="text-text-primary px-4 py-3 text-sm font-medium">
                        {sheet1?.[selectedItem]?.itemName}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {subTask.subItemName}
                      </td>
                      <td className="text-text-secondary px-4 py-3 text-sm">
                        {subTask.unit}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {subTask.totalQuantity}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {subTask.totalSupplied}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {subTask.totalInstalled}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {subTask.connectWithSheet1Item ? "Yes" : "No"}
                      </td>
                      <td className="text-text-secondary px-4 py-3 text-sm">
                        {subTask.supplyTargetDate
                          ? new Date(subTask.supplyTargetDate).toLocaleDateString()
                          : "N/A"}
                        {subTask.connectWithSheet1Item && (
                          <span className="text-text-secondary ml-1 text-xs">(Linked)</span>
                        )}
                      </td>
                      <td className="text-text-secondary px-4 py-3 text-sm">
                        {subTask.installationTargetDate
                          ? new Date(subTask.installationTargetDate).toLocaleDateString()
                          : "N/A"}
                        {subTask.connectWithSheet1Item && (
                          <span className="text-text-secondary ml-1 text-xs">(Linked)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSubTask(index)}
                            className="text-info hover:bg-info/10 rounded p-1"
                          >
                            <Icon name="Edit" size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubTask(index)}
                            className="text-error hover:bg-error/10 rounded p-1"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedItem &&
      sheet1?.[selectedItem] &&
      sheet1?.[selectedItem]?.sheet2.length > 0 ? (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-text-primary mb-3 font-medium">Summary</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-text-primary text-2xl font-bold">
                {sheet1?.[selectedItem]?.sheet2.length}
              </p>
              <p className="text-text-secondary text-sm">Total Sub-Tasks</p>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {/* Navigation */}
      <div className="border-border flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Sheet 1
        </Button>

        <div className="text-text-secondary text-sm">
          {selectedItem !== null &&
          (sheet1?.[selectedItem]?.sheet2?.length ?? 0) > 0 ? (
            <span className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Sheet 2 ready for preview</span>
            </span>
          ) : (
            <span>Add at least one sub-task to continue</span>
          )}
        </div>

        <Button
          variant="default"
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  );
};

export default Sheet2Creation;
