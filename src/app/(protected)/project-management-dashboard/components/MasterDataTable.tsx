import React, { useState, useMemo } from "react";
// import Icon from "@/components/rocket/components/AppIcon";
// import Button from "@/components/rocket/components/ui/Button";

interface MasterDataRow {
  id: string | number;
  itemDescription: string;
  quantity: number;
  supplied: number;
  installed: number;
  yetToSupply: number;
  yetToInstall: number;
  supplyProgress: number;
  installProgress: number;
  supplyTargetDate?: string | Date | null;
  installationTargetDate?: string | Date | null;
  remainingDaysSupply?: number;
  remainingDaysInstall?: number;
  perDaySupplyTarget?: number;
  perDayInstallTarget?: number;
  hasPhotos?: boolean;
  isBlocked?: boolean;
}

interface SortConfig {
  key: keyof MasterDataRow | null;
  direction: "asc" | "desc";
}

interface MasterDataTableProps {
  data: MasterDataRow[];
  selectedRowId: string | number;
  setSelectedRowId: React.Dispatch<React.SetStateAction<string | number>>;
  // onDataUpdate: (
  //   rowId: string | number,
  //   field: keyof MasterDataRow,
  //   value: number,
  // ) => void;
  // onPhotoUpload: (rowId: string | number) => void;
}

const MasterDataTable: React.FC<MasterDataTableProps> = ({
  data,
  selectedRowId,
  setSelectedRowId,
  // onDataUpdate,
  // onPhotoUpload,
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // const handleSort = (key: keyof MasterDataRow) => {
  //   let direction: "asc" | "desc" = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   }
  //   setSortConfig({ key, direction });
  // };

  // const handleCellEdit = (
  //   rowId: string | number,
  //   field: keyof MasterDataRow,
  //   value: number,
  // ) => {
  //   // onDataUpdate(rowId, field, value);
  //   setEditingCell(null);
  // };

  // const handleRowSelect = (rowId: string | number) => {
  //   setSelectedRowId(rowId);
  // };

  // const handleSelectAll = () => {
  //   setSelectedRows(
  //     selectedRows.length === data.length ? [] : data.map((row) => row.id),
  //   );
  // };

  const getProgressColor = (percentage: number): string => {
    return "bg-primary";
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className="bg-card border-border overflow-hidden rounded-lg border">
      {/* Table Header Actions */}
      {/* <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedRows.length === data.length}
            onChange={handleSelectAll}
            className="border-border rounded"
          />
          <span className="text-text-secondary text-sm">
            {selectedRows.length > 0
              ? `${selectedRows.length} selected`
              : "Select all"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedRows.length > 0 && (
            <>
              <Button variant="outline" size="sm" iconName="Upload">
                Bulk Upload Photos
              </Button>
              <Button variant="outline" size="sm" iconName="Download">
                Export Selected
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" iconName="Filter">
            Filter
          </Button>
          <Button variant="outline" size="sm" iconName="Download">
            Export All
          </Button>
        </div>
      </div> */}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-3">
                {/* <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={handleSelectAll}
                  className="border-border rounded"
                /> */}
              </th>
              {[
                { key: "itemDescription" as const, label: "Item Description" },
                { key: "quantity" as const, label: "Quantity" },
                { key: "supplied" as const, label: "Supplied" },
                { key: "installed" as const, label: "Installed" },
                { key: "yetToSupply" as const, label: "Balance to Supply" },
                { key: "yetToInstall" as const, label: "Balance to Install" },
                { key: "remainingDaysSupply" as const, label: "Remaining Days (Supply)" },
                { key: "remainingDaysInstall" as const, label: "Remaining Days (Install)" },
                { key: "perDaySupplyTarget" as const, label: "Per Day Supply Target" },
                { key: "perDayInstallTarget" as const, label: "Per Day Install Target" },
                { key: "supplyProgress" as const, label: "Supply %" },
                { key: "installProgress" as const, label: "Install %" },
                // { key: "actions" as const, label: "Actions" },
              ].map((column) => (
                <th
                  key={column.key}
                  className="text-text-secondary hover:bg-muted/70 transition-smooth cursor-pointer p-3 text-left text-sm font-medium"
                  // onClick={() =>
                  //   column.key !== "actions" && handleSort(column.key)
                  // }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {/* {column.key !== "actions" && (
                      <Icon
                        name={
                          sortConfig.key === column.key
                            ? sortConfig.direction === "asc"
                              ? "ChevronUp"
                              : "ChevronDown"
                            : "ChevronsUpDown"
                        }
                        size={14}
                      />
                    )} */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr
                key={row.id}
                className="border-border hover:bg-muted/30 transition-smooth border-b"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRowId === row.id}
                    onChange={() => {
                      setSelectedRowId(row.id);
                    }}
                    className="border-border rounded"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-text-primary font-medium">
                      {row.itemDescription}
                    </span>
                    {/* {row.hasPhotos && (
                      <Icon
                        name="Camera"
                        size={14}
                        color="var(--color-primary)"
                      />
                    )}
                    {row.isBlocked && (
                      <Icon
                        name="AlertTriangle"
                        size={14}
                        color="var(--color-error)"
                      />
                    )} */}
                  </div>
                </td>
                <td className="text-text-primary p-3 font-medium">
                  {row.quantity}
                </td>
                <td className="p-3">
                  <span
                    className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1"
                    // onClick={() => setEditingCell(`${row.id}-supplied`)}
                  >
                    {row.supplied}
                  </span>
                  {/* {editingCell === `${row.id}-supplied` ? (
                    <input
                      type="number"
                      defaultValue={row.supplied}
                      onBlur={(e) =>
                        handleCellEdit(
                          row.id,
                          "supplied",
                          parseInt(e.target.value),
                        )
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.target as HTMLInputElement).blur()
                      }
                      className="border-border w-20 rounded border px-2 py-1 text-sm"
                      autoFocus
                      readOnly
                    />
                  ) : (
                    <span
                      className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1"
                      onClick={() => setEditingCell(`${row.id}-supplied`)}
                    >
                      {row.supplied}
                    </span>
                  )} */}
                </td>
                <td className="p-3">
                  <span
                    className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1"
                    onClick={() => setEditingCell(`${row.id}-installed`)}
                  >
                    {row.installed}
                  </span>
                  {/* {editingCell === `${row.id}-installed` ? (
                    <input
                      type="number"
                      defaultValue={row.installed}
                      onBlur={(e) =>
                        handleCellEdit(
                          row.id,
                          "installed",
                          parseInt(e.target.value),
                        )
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.target as HTMLInputElement).blur()
                      }
                      className="border-border w-20 rounded border px-2 py-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1"
                      onClick={() => setEditingCell(`${row.id}-installed`)}
                    >
                      {row.installed}
                    </span>
                  )} */}
                </td>
                <td className="text-text-secondary p-3">{row.yetToSupply}</td>
                <td className="text-text-secondary p-3">{row.yetToInstall}</td>
                <td className="text-text-secondary p-3">
                  {row.remainingDaysSupply !== undefined && row.remainingDaysSupply > 0
                    ? row.remainingDaysSupply
                    : "N/A"}
                </td>
                <td className="text-text-secondary p-3">
                  {row.remainingDaysInstall !== undefined && row.remainingDaysInstall > 0
                    ? row.remainingDaysInstall
                    : "N/A"}
                </td>
                <td className="text-text-secondary p-3">
                  {row.perDaySupplyTarget !== undefined && row.perDaySupplyTarget > 0
                    ? row.perDaySupplyTarget
                    : "N/A"}
                </td>
                <td className="text-text-secondary p-3">
                  {row.perDayInstallTarget !== undefined && row.perDayInstallTarget > 0
                    ? row.perDayInstallTarget
                    : "N/A"}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-muted h-2 w-16 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(row.supplyProgress)}`}
                        style={{ width: `${row.supplyProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-text-primary w-10 text-sm font-medium">
                      {row.supplyProgress}%
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-muted h-2 w-16 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(row.installProgress)}`}
                        style={{ width: `${row.installProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-text-primary w-10 text-sm font-medium">
                      {row.installProgress}%
                    </span>
                  </div>
                </td>
                {/* <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <button
                      // onClick={() => onPhotoUpload(row.id)}
                      className="hover:bg-muted transition-smooth rounded-md p-1"
                      title="Upload Photos"
                    >
                      <Icon
                        name="Camera"
                        size={16}
                        color="var(--color-text-secondary)"
                      />
                    </button>
                    <button
                      className="hover:bg-muted transition-smooth rounded-md p-1"
                      title="View Details"
                    >
                      <Icon
                        name="Eye"
                        size={16}
                        color="var(--color-text-secondary)"
                      />
                    </button>
                    <button
                      className="hover:bg-muted transition-smooth rounded-md p-1"
                      title="More Options"
                    >
                      <Icon
                        name="MoreHorizontal"
                        size={16}
                        color="var(--color-text-secondary)"
                      />
                    </button>
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {/* <div className="border-border bg-muted/20 flex items-center justify-between border-t p-4">
        <div className="text-text-secondary text-sm">
          Showing {data.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ChevronLeft">
            Previous
          </Button>
          <Button variant="outline" size="sm" iconName="ChevronRight">
            Next
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default MasterDataTable;
