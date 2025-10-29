import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
// import Button from "@/components/rocket/components/ui/Button";
// import Image from "@/components/rocket/components/AppImage";

interface AssignedTo {
  name: string;
  // avatar: string;
}

interface Photo {
  thumbnail: string;
}

interface SubTask {
  id: string | number;
  name: string;
  // status: "completed" | "in-progress" | "pending" | "blocked";
  // priority: "high" | "medium" | "low";
  progress: number;
  assignedTo: AssignedTo;
  // photos?: Photo[];
  notes?: string;
}

// interface TaskItem {
//   id: string | number;
//   taskName: string;
//   description: string;
//   // status: "completed" | "in-progress" | "pending" | "blocked";
//   // priority: "high" | "medium" | "low";
//   progress: number;
//   assignedTo: AssignedTo;
//   // photos: Photo[];
//   // hasBlockage?: boolean;
//   subTasks?: SubTask[];
//   unit: string;
//   totalQuantity: number;
//   totalSupplied: number;
//   totalInstalled: number;
//   percentSupplied: number;
//   percentInstalled: number;
//   connectWithSheet1Item: boolean;
//   yesterdaySupplied: number;
//   yesterdayInstalled: number;
//   yesterdayProgress: number;
// }

interface TaskItem {
  id: string | number;
  name: string;
  connectWithSheet1Item: boolean;
  yesterdaySupplied: number;
  yesterdayInstalled: number;
  unit: string;
  totalQuantity: number;
  totalSupplied: number;
  totalInstalled: number;
  percentSupplied: number;
  percentInstalled: number;
}

interface DetailedBreakdownTableProps {
  data: TaskItem[];
  // onDataUpdate?: (data: TaskItem[]) => void;
  // onPhotoUpload: (taskId: string | number) => void;
}

const DetailedBreakdownTable: React.FC<DetailedBreakdownTableProps> = ({
  data,
  // onDataUpdate,
  // onPhotoUpload,
}) => {
  const [expandedRows, setExpandedRows] = useState<(string | number)[]>([]);
  const [selectedSubTasks, setSelectedSubTasks] = useState<(string | number)[]>(
    [],
  );

  // const toggleRowExpansion = (rowId: string | number): void => {
  //   setExpandedRows((prev) =>
  //     prev.includes(rowId)
  //       ? prev.filter((id) => id !== rowId)
  //       : [...prev, rowId],
  //   );
  // };

  const handleSubTaskSelect = (subTaskId: string | number): void => {
    setSelectedSubTasks((prev) =>
      prev.includes(subTaskId)
        ? prev.filter((id) => id !== subTaskId)
        : [...prev, subTaskId],
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "in-progress":
        return "bg-warning/10 text-warning border-warning/20";
      case "pending":
        return "bg-muted text-text-secondary border-border";
      case "blocked":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-muted text-text-secondary border-border";
    }
  };

  // const getPriorityColor = (priority: string): string => {
  //   switch (priority) {
  //     case "high":
  //       return "text-error";
  //     case "medium":
  //       return "text-warning";
  //     case "low":
  //       return "text-success";
  //     default:
  //       return "text-text-secondary";
  //   }
  // };

  return (
    <div className="bg-card border-border overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <h3 className="text-text-primary text-lg font-semibold">
          Detailed Breakdown
        </h3>
        {/* <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Plus">
            Add Sub-task
          </Button>
          <Button variant="outline" size="sm" iconName="Upload">
            Bulk Upload
          </Button>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-3"></th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Task
              </th>
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Status
              </th> */}
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Priority
              </th> */}
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Progress
              </th> */}
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Yesterday Progress
              </th> */}
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Unit
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Yesterday Supplied
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Yesterday Installed
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Total Quantity
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Total Supplied
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Total Installed
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                % Supplied
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                % Installed
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Connect With Sheet 1 Item
              </th>
              <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Overall Progress
              </th>
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Yesterday Progress
              </th> */}
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Assigned To
              </th> */}
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Photos
              </th> */}
              {/* <th className="text-text-secondary p-3 text-left text-sm font-medium">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <React.Fragment key={item.id}>
                {/* Main Row */}
                <tr className="border-border hover:bg-muted/30 transition-smooth border-b">
                  <td className="p-3">
                    {/* <button
                      onClick={() => toggleRowExpansion(item.id)}
                      className="hover:bg-muted transition-smooth rounded-md p-1"
                    >
                      <Icon
                        name={
                          expandedRows.includes(item.id)
                            ? "ChevronDown"
                            : "ChevronRight"
                        }
                        size={16}
                        color="var(--color-text-secondary)"
                      />
                    </button> */}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-primary font-medium">
                        {item.name}
                      </span>
                      {/* {item.hasBlockage && (
                        <Icon
                          name="AlertTriangle"
                          size={14}
                          color="var(--color-error)"
                        />
                      )} */}
                    </div>
                    {/* <p className="text-text-secondary mt-1 text-sm">
                      {item.description}
                    </p> */}
                  </td>
                  {/* <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.status}
                    </span>
                  </td> */}
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.unit}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.yesterdaySupplied}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.yesterdayInstalled}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.totalQuantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.totalSupplied}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.totalInstalled}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.percentSupplied}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.percentInstalled}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary text-sm font-medium">
                      {item.connectWithSheet1Item ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* <td className="p-3">
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </td> */}
                  {/* <td className="p-3">
                    <Icon
                      name="Flag"
                      size={16}
                      color={`var(--color-${item.priority === "high" ? "error" : item.priority === "medium" ? "warning" : "success"})`}
                    />
                  </td> */}
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-muted h-2 w-20 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${+((item.percentSupplied + item.percentInstalled) / 2).toFixed(2)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-text-primary text-sm font-medium">
                        {
                          +(
                            (item.percentSupplied + item.percentInstalled) /
                            2
                          ).toFixed(2)
                        }
                        %
                      </span>
                    </div>
                  </td>
                  {/* <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Image
                        src={item.assignedTo.avatar}
                        alt={item.assignedTo.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="text-text-primary text-sm">
                        {item.assignedTo?.name}
                      </span>
                    </div>
                  </td> */}
                  {/* <td className="p-3">
                    <div className="flex items-center space-x-1">
                      {item.photos.slice(0, 3).map((photo, index) => (
                        <Image
                          key={index}
                          src={photo.thumbnail}
                          alt={`Photo ${index + 1}`}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ))}
                      {item.photos.length > 3 && (
                        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded">
                          <span className="text-text-secondary text-xs">
                            +{item.photos.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </td> */}
                  {/* <td className="p-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onPhotoUpload(item.id)}
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
                        title="Edit Task"
                      >
                        <Icon
                          name="Edit"
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

                {/* Expanded Sub-tasks */}
                {/* {expandedRows.includes(item.id) && item.subTasks && (
                  <>
                    {item.subTasks.map((subTask) => (
                      <tr
                        key={subTask.id}
                        className="bg-muted/20 border-border border-b"
                      >
                        <td className="p-3 pl-8">
                          <input
                            type="checkbox"
                            checked={selectedSubTasks.includes(subTask.id)}
                            onChange={() => handleSubTaskSelect(subTask.id)}
                            className="border-border rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Icon
                              name="CornerDownRight"
                              size={14}
                              color="var(--color-text-secondary)"
                            />
                            <span className="text-text-primary text-sm">
                              {subTask.name}
                            </span>
                          </div>
                          {subTask.notes && (
                            <p className="text-text-secondary mt-1 ml-6 text-xs">
                              {subTask.notes}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(subTask.status)}`}
                          >
                            {subTask.status.charAt(0).toUpperCase() +
                              subTask.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <Icon
                            name="Flag"
                            size={14}
                            color={`var(--color-${subTask.priority === "high" ? "error" : subTask.priority === "medium" ? "warning" : "success"})`}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="bg-muted h-1.5 w-16 rounded-full">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${subTask.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-text-primary text-xs">
                              {subTask.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Image
                              src={subTask.assignedTo.avatar}
                              alt={subTask.assignedTo.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span className="text-text-primary text-xs">
                              {subTask.assignedTo.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {subTask.photos && subTask.photos.length > 0 ? (
                            <div className="flex items-center space-x-1">
                              {subTask.photos
                                .slice(0, 2)
                                .map((photo, index) => (
                                  <Image
                                    key={index}
                                    src={photo.thumbnail}
                                    alt={`Sub-task photo ${index + 1}`}
                                    className="h-6 w-6 rounded object-cover"
                                  />
                                ))}
                              {subTask.photos.length > 2 && (
                                <span className="text-text-secondary text-xs">
                                  +{subTask.photos.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-secondary text-xs">
                              No photos
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => onPhotoUpload(subTask.id)}
                              className="hover:bg-muted transition-smooth rounded-md p-1"
                              title="Upload Photos"
                            >
                              <Icon
                                name="Camera"
                                size={14}
                                color="var(--color-text-secondary)"
                              />
                            </button>
                            <button
                              className="hover:bg-muted transition-smooth rounded-md p-1"
                              title="Edit Sub-task"
                            >
                              <Icon
                                name="Edit"
                                size={14}
                                color="var(--color-text-secondary)"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )} */}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailedBreakdownTable;
