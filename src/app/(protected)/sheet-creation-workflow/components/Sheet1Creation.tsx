import React, { useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import z from "zod";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";

// Define interfaces
type ProjectItem = Omit<
  NonNullable<z.infer<typeof projectVersionSchema>["sheet1"]>[number],
  "sheet2"
>;

// remove yetToSupply, yetToInstal from the type
const newItemForm = projectVersionSchema.shape.sheet1.unwrap().element.pick({
  itemName: true,
  unit: true,
  totalQuantity: true,
  totalSupplied: true,
  totalInstalled: true,
});

const modifiedNewItemForm = newItemForm.extend({
  totalQuantity: z.coerce
    .number()
    .transform((val) => val ?? 0)
    .optional(),
  totalSupplied: z.coerce
    .number()
    .transform((val) => val ?? 0)
    .optional(),
  totalInstalled: z.coerce
    .number()
    .transform((val) => val ?? 0)
    .optional(),
  supplyTargetDate: z.coerce.date().optional(),
  installationTargetDate: z.coerce.date().optional(),
});
type NewItemForm = z.infer<typeof modifiedNewItemForm>;

interface Sheet1CreationProps {
  onNext: () => void;
  error?: string;
}

const Sheet1Creation: React.FC<Sheet1CreationProps> = ({ onNext, error }) => {
  const [newItem, setNewItem] = useState<NewItemForm>({
    itemName: "",
    unit: "",
    totalQuantity: undefined,
    totalSupplied: undefined,
    totalInstalled: undefined,
    supplyTargetDate: undefined,
    installationTargetDate: undefined,
  });
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { pushToSheet1, deleteSheet1Item, editSheet1Item } = useProjectStore();
  const sheet1 = useProjectStore((state) => state.latestProjectVersion?.sheet1);

  // Common units for glass work
  const commonUnits: string[] = [
    "sqm",
    "linear m",
    "units",
    "panels",
    "pieces",
    "kg",
    "liters",
    "sets",
  ];

  // Common items for glass work projects
  const commonItems: string[] = [
    "UCW",
    "Strip Glazing",
    "Railing Installation",
    "Glass Panels",
    "Structural Glazing",
    "Safety Glass",
    "Tempered Glass",
    "Laminated Glass",
    "Double Glazing",
    "Aluminum Frames",
    "Steel Frames",
    "Sealants",
    "Hardware",
    "Insulation",
    "Weather Stripping",
  ];

  const calculateRemaining = (
    total: string | number,
    cumulative: string | number,
  ): number => {
    const totalNum = parseFloat(total.toString()) || 0;
    const cumulativeNum = parseFloat(cumulative.toString()) || 0;
    return Math.max(0, totalNum - cumulativeNum);
  };

  const calculatePercentage = (
    cumulative: string | number,
    total: string | number,
  ): number => {
    const totalNum = parseFloat(total.toString()) || 0;
    const cumulativeNum = parseFloat(cumulative.toString()) || 0;
    return totalNum > 0 ? Math.round((cumulativeNum / totalNum) * 100) : 0;
  };

  // Calculate remaining days from target date to current date
  const calculateRemainingDays = (targetDate: string | Date | null | undefined): number => {
    if (!targetDate) return 0;
    const target = new Date(targetDate);
    const currentDate = new Date();
    if (isNaN(target.getTime())) return 0;
    const diffTime = target.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Return 0 if target date is in the past
  };

  // Calculate per-day productivity (one decimal place maximum)
  const calculatePerDayProductivity = (remaining: number, remainingDays: number): number => {
    if (remainingDays <= 0 || remaining <= 0) return 0;
    const result = remaining / remainingDays;
    return Math.round(result * 10) / 10; // Round to one decimal place
  };

  const validateItem = (item: NewItemForm): string | null => {
    if (!item.itemName.trim()) return "Item name is required. Enter the name of the item (e.g. UCW, Glass Panels).";
    if (!item.unit.trim()) return "Unit of measurement (UOM) is required. Enter the unit (e.g. sqm, units, pieces).";
    if (!item.totalQuantity || item.totalQuantity <= 0)
      return "Total quantity must be greater than 0. Enter how many units you need in total.";
    if (item.totalSupplied && item.totalSupplied < 0)
      return "Cumulative supplied cannot be negative. Enter 0 or a positive number.";
    if (item.totalInstalled && item.totalInstalled < 0)
      return "Cumulative installed cannot be negative. Enter 0 or a positive number.";
    if (
      item.totalQuantity &&
      item.totalSupplied &&
      item.totalSupplied > item.totalQuantity
    )
      return `Cumulative supplied (${item.totalSupplied}) cannot exceed total quantity (${item.totalQuantity}). Reduce the supplied amount or increase total quantity.`;
    if (
      item.totalQuantity &&
      item.totalInstalled &&
      item.totalInstalled > item.totalQuantity
    )
      return `Cumulative installed (${item.totalInstalled}) cannot exceed total quantity (${item.totalQuantity}). Reduce the installed amount or increase total quantity.`;
    return null;
  };

  const handleAddItem = (): void => {
    const validationError = validateItem(newItem);
    // const validated = newItemForm.safeParse(newItem);
    // if (!validated.success) {
    //   toast.error(validated.error.message);
    //   return;
    // }
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const itemToAdd = {
      ...newItem,
      totalQuantity: newItem.totalQuantity ?? 0,
      totalSupplied: newItem.totalSupplied ?? 0,
      totalInstalled: newItem.totalInstalled ?? 0,
      yetToSupply: calculateRemaining(
        newItem.totalQuantity ?? 0,
        newItem.totalSupplied ?? 0,
      ),
      yetToInstall: calculateRemaining(
        newItem.totalQuantity ?? 0,
        newItem.totalInstalled ?? 0,
      ),
      percentSupplied: calculatePercentage(
        newItem.totalSupplied ?? 0,
        newItem.totalQuantity ?? 0,
      ),
      percentInstalled: calculatePercentage(
        newItem.totalInstalled ?? 0,
        newItem.totalQuantity ?? 0,
      ),
      supplyTargetDate: newItem.supplyTargetDate,
      installationTargetDate: newItem.installationTargetDate,
      sheet2: [],
      blockages: [],
      yesterdayProgressPhotos: [],
    };

    pushToSheet1(itemToAdd);
    setNewItem({
      itemName: "",
      unit: "",
      totalQuantity: undefined,
      totalSupplied: undefined,
      totalInstalled: undefined,
      supplyTargetDate: undefined,
      installationTargetDate: undefined,
    });
    setIsAddingItem(false);
  };

  const handleEditItem = (index: number): void => {
    const item = sheet1?.[index];
    if (!item) return;

    setNewItem({
      itemName: item.itemName,
      unit: item.unit,
      totalQuantity: item.totalQuantity ?? undefined,
      totalSupplied: item.totalSupplied ?? undefined,
      totalInstalled: item.totalInstalled ?? undefined,
      supplyTargetDate: item.supplyTargetDate ? new Date(item.supplyTargetDate) : undefined,
      installationTargetDate: item.installationTargetDate ? new Date(item.installationTargetDate) : undefined,
    });
    setEditingIndex(index);
    setIsAddingItem(true);
  };

  const handleUpdateItem = (): void => {
    const validationError = validateItem(newItem);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (editingIndex === null) return;

    const existingItem = sheet1?.[editingIndex];
    if (!existingItem) return;

    const itemToAdd = {
      ...existingItem,
      itemName: newItem.itemName,
      unit: newItem.unit,
      totalQuantity: newItem.totalQuantity ?? 0,
      totalSupplied: newItem.totalSupplied ?? 0,
      totalInstalled: newItem.totalInstalled ?? 0,
      yetToSupply: calculateRemaining(
        newItem.totalQuantity ?? 0,
        newItem.totalSupplied ?? 0,
      ),
      yetToInstall: calculateRemaining(
        newItem.totalQuantity ?? 0,
        newItem.totalInstalled ?? 0,
      ),
      percentSupplied: calculatePercentage(
        newItem.totalSupplied ?? 0,
        newItem.totalQuantity ?? 0,
      ),
      percentInstalled: calculatePercentage(
        newItem.totalInstalled ?? 0,
        newItem.totalQuantity ?? 0,
      ),
      supplyTargetDate: newItem.supplyTargetDate,
      installationTargetDate: newItem.installationTargetDate,
    };

    editSheet1Item(editingIndex, itemToAdd);
    setNewItem({
      itemName: "",
      unit: "",
      totalQuantity: undefined,
      totalSupplied: undefined,
      totalInstalled: undefined,
      supplyTargetDate: undefined,
      installationTargetDate: undefined,
    });
    setEditingIndex(null);
    setIsAddingItem(false);
  };

  const handleDeleteItem = (index: number): void => {
    deleteSheet1Item(index);
  };

  const handleCancelEdit = (): void => {
    setNewItem({
      itemName: "",
      unit: "",
      totalQuantity: undefined,
      totalSupplied: undefined,
      totalInstalled: undefined,
    });
    setEditingIndex(null);
    setIsAddingItem(false);
  };

  const handleQuickAdd = (itemName: string): void => {
    setNewItem((prev) => ({
      ...prev,
      itemName: itemName,
    }));
    setIsAddingItem(true);
  };

  const isHydrated = useProjectStore?.persist?.hasHydrated();

  if (!isHydrated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Sheet 1 - Master Project Data
        </h2>
        <p className="text-text-secondary">
          Create the main project structure with items, quantities, and tracking
          metrics
        </p>
        {error && (
          <div className="bg-error/10 border-error/20 mt-4 rounded-lg border p-3">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Quick Add Items */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-text-primary mb-3 font-medium">
          Quick Add Common Items
        </h3>
        <div className="flex flex-wrap gap-2">
          {commonItems.map((itemName) => (
            <button
              key={itemName}
              onClick={() => handleQuickAdd(itemName)}
              className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 py-1 text-xs transition-colors"
            >
              {itemName}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Item Form */}
      {isAddingItem && (
        <div className="bg-surface border-border rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 font-medium">
            {editingIndex !== null ? "Edit Item" : "Add New Item"}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Item Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={newItem.itemName}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, itemName: e.target.value }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., UCW, Glass Panels"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                UOM <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="e.g., sqm, linear m, units, panels, pieces, kg, liters, sets"
              />
              {/* <select
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
              >
                <option value="">Select Unit</option>
                {commonUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select> */}
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Total Quantity <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={newItem.totalQuantity}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    totalQuantity: +e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-text-secondary mt-1 text-xs">Numbers only.</p>
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Cumulative Supplied
              </label>
              <input
                type="number"
                value={newItem.totalSupplied}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    totalSupplied: +e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-text-secondary mt-1 text-xs">Numbers only.</p>
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Cumulative Installed
              </label>
              <input
                type="number"
                value={newItem.totalInstalled}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    totalInstalled: +e.target.value,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-text-secondary mt-1 text-xs">Numbers only.</p>
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Supply Target Date
              </label>
              <input
                type="date"
                value={newItem.supplyTargetDate?.toISOString().split("T")[0] ?? ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    supplyTargetDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Installation Target Date
              </label>
              <input
                type="date"
                value={newItem.installationTargetDate?.toISOString().split("T")[0] ?? ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    installationTargetDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-3">
            <Button
              variant="default"
              onClick={editingIndex !== null ? handleUpdateItem : handleAddItem}
              iconName={editingIndex !== null ? "Save" : "Plus"}
              iconPosition="left"
            >
              {editingIndex !== null ? "Update Item" : "Add Item"}
            </Button>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-surface border-border overflow-hidden rounded-lg border">
        <div className="border-border border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-primary font-medium">
              Project Items ({sheet1?.length})
            </h3>
            {!isAddingItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingItem(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Add Item
              </Button>
            )}
          </div>
        </div>

        {sheet1?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Table" size={48} className="text-muted mx-auto mb-4" />
            <p className="text-text-secondary mb-2">No items added yet</p>
            <p className="text-text-secondary text-sm">
              Click &ldquo;Add Item&rdquo; to start building your project
              structure
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    S.No
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Item
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
                    Yet to Supply
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Yet to Install
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    % Supplied
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    % Installed
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Supply Target Date
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Installation Target Date
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Per Day Supply Productivity
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Per Day Install Productivity
                  </th>
                  <th className="text-text-secondary px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {sheet1?.map((item, index) => {
                  const remainingDaysSupply = calculateRemainingDays(item.supplyTargetDate);
                  const remainingDaysInstall = calculateRemainingDays(item.installationTargetDate);
                  const perDaySupplyProductivity = calculatePerDayProductivity(
                    item.yetToSupply ?? 0,
                    remainingDaysSupply,
                  );
                  const perDayInstallProductivity = calculatePerDayProductivity(
                    item.yetToInstall ?? 0,
                    remainingDaysInstall,
                  );
                  return (
                  <tr key={index} className="hover:bg-muted/20">
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {index + 1}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm font-medium">
                      {item.itemName}
                    </td>
                    <td className="text-text-secondary px-4 py-3 text-sm">
                      {item.unit}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {item.totalQuantity}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {item.totalSupplied}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {item.totalInstalled}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {item.yetToSupply}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm">
                      {item.yetToInstall}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.percentSupplied >= 80
                            ? "bg-success/10 text-success"
                            : item.percentSupplied >= 50
                              ? "bg-warning/10 text-warning"
                              : "bg-info/10 text-info"
                        }`}
                      >
                        {item.percentSupplied}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.percentInstalled >= 80
                            ? "bg-success/10 text-success"
                            : item.percentInstalled >= 50
                              ? "bg-warning/10 text-warning"
                              : "bg-info/10 text-info"
                        }`}
                      >
                        {item.percentInstalled}%
                      </span>
                    </td>
                    <td className="text-text-secondary px-4 py-3 text-sm">
                      {item.supplyTargetDate
                        ? new Date(item.supplyTargetDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="text-text-secondary px-4 py-3 text-sm">
                      {item.installationTargetDate
                        ? new Date(item.installationTargetDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm font-medium">
                      {perDaySupplyProductivity > 0
                        ? perDaySupplyProductivity.toFixed(1)
                        : "N/A"}
                    </td>
                    <td className="text-text-primary px-4 py-3 text-sm font-medium">
                      {perDayInstallProductivity > 0
                        ? perDayInstallProductivity.toFixed(1)
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditItem(index)}
                          className="text-info hover:bg-info/10 rounded p-1"
                        >
                          <Icon name="Edit" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="text-error hover:bg-error/10 rounded p-1"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {/* {(sheet1?.length ?? 0) > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-text-primary mb-3 font-medium">Summary</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-text-primary text-2xl font-bold">
                {sheet1?.length}
              </p>
              <p className="text-text-secondary text-sm">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-info text-2xl font-bold">
                {sheet1?.reduce(
                  (sum: number, item: ProjectItem) => sum + item.totalQuantity,
                  0,
                )}
              </p>
              <p className="text-text-secondary text-sm">Total Quantity</p>
            </div>
            <div className="text-center">
              <p className="text-warning text-2xl font-bold">
                {sheet1?.reduce(
                  (sum: number, item: ProjectItem) => sum + item.yetToSupply,
                  0,
                )}
              </p>
              <p className="text-text-secondary text-sm">Yet to Supply</p>
            </div>
            <div className="text-center">
              <p className="text-success text-2xl font-bold">
                {sheet1?.reduce(
                  (sum: number, item: ProjectItem) => sum + item.yetToInstall,
                  0,
                )}
              </p>
              <p className="text-text-secondary text-sm">Yet to Install</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Navigation */}
      <div className="border-border flex items-center justify-between border-t pt-6">
        <div className="text-text-secondary text-sm">
          {(sheet1?.length ?? 0) > 0 ? (
            <span className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Sheet 1 ready for Sheet 2 breakdown</span>
            </span>
          ) : (
            <span>Add at least one item to continue</span>
          )}
        </div>

        <Button
          variant="default"
          onClick={onNext}
          disabled={sheet1?.length === 0 || !isHydrated}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Sheet 2
        </Button>
      </div>
    </div>
  );
};

export default Sheet1Creation;
