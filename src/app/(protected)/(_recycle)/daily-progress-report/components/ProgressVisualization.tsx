import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";

// Define proper types
type WorkItemStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "blocked";

interface WorkItem {
  id: string | number;
  name: string;
  description: string;
  unit: string;
  location: string;
  total_quantity: number;
  completed_quantity: number;
  progress_percentage?: number;
  status: WorkItemStatus;
  daily_target?: number;
}

interface ProjectStats {
  overallProgress?: number;
}

interface ProgressVisualizationProps {
  workItems: WorkItem[];
  projectStats?: ProjectStats;
}

interface BarChartData {
  name: string;
  fullName: string;
  completed: number;
  remaining: number;
}

interface PieChartData {
  name: string;
  value: number;
  status: string;
}

interface StatusColors {
  not_started: string;
  in_progress: string;
  completed: string;
  on_hold: string;
  blocked: string;
}

interface TooltipPayload {
  value?: number;
  payload?: {
    fullName?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface PieTooltipPayload {
  name?: string;
  value?: number;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayload[];
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  workItems,
  projectStats,
}) => {
  // Prepare data for bar chart
  const barChartData: BarChartData[] = workItems.map((item: WorkItem) => ({
    name:
      item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    fullName: item.name,
    completed:
      Math.round((item.completed_quantity / item.total_quantity) * 100) || 0,
    remaining:
      100 - Math.round((item.completed_quantity / item.total_quantity) * 100) ||
      100,
  }));

  // Prepare data for pie chart
  const statusCounts = workItems.reduce(
    (acc: Record<string, number>, item: WorkItem) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const pieChartData: PieChartData[] = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      status,
    }),
  );

  const statusColors: StatusColors = {
    not_started: "#64748B",
    in_progress: "#2563EB",
    completed: "#059669",
    on_hold: "#D97706",
    blocked: "#DC2626",
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-popover border-border elevation-2 rounded-lg border p-3">
          <p className="text-text-primary font-medium">
            {payload[0]?.payload?.fullName ?? label}
          </p>
          <p className="text-success text-sm">
            Completed: {payload[0]?.value}%
          </p>
          <p className="text-text-secondary text-sm">
            Remaining: {payload[1]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-popover border-border elevation-2 rounded-lg border p-3">
          <p className="text-text-primary font-medium">{payload[0]?.name}</p>
          <p className="text-text-secondary text-sm">
            Count: {payload[0]?.value} items
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Stats */}
      <div className="bg-surface border-border rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Today&apos;s Progress Overview
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
              <Icon name="Target" size={24} color="var(--color-primary)" />
            </div>
            <div className="text-text-primary text-2xl font-bold">
              {projectStats?.overallProgress ?? 0}%
            </div>
            <div className="text-text-secondary text-sm">Overall Progress</div>
          </div>

          <div className="text-center">
            <div className="bg-success/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
              <Icon name="CheckCircle" size={24} color="var(--color-success)" />
            </div>
            <div className="text-success text-2xl font-bold">
              {
                workItems.filter(
                  (item: WorkItem) => item.status === "completed",
                ).length
              }
            </div>
            <div className="text-text-secondary text-sm">Completed Items</div>
          </div>

          <div className="text-center">
            <div className="bg-warning/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
              <Icon name="Clock" size={24} color="var(--color-warning)" />
            </div>
            <div className="text-warning text-2xl font-bold">
              {
                workItems.filter(
                  (item: WorkItem) => item.status === "in_progress",
                ).length
              }
            </div>
            <div className="text-text-secondary text-sm">In Progress</div>
          </div>

          <div className="text-center">
            <div className="bg-error/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
              <Icon name="AlertTriangle" size={24} color="var(--color-error)" />
            </div>
            <div className="text-error text-2xl font-bold">
              {
                workItems.filter((item: WorkItem) => item.status === "blocked")
                  .length
              }
            </div>
            <div className="text-text-secondary text-sm">Blocked Items</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Chart */}
      <div className="bg-surface border-border rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Work Item Progress
        </h3>

        <div className="h-80" aria-label="Work Item Progress Bar Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="var(--color-text-secondary)"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="completed"
                stackId="a"
                fill="var(--color-success)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="remaining"
                stackId="a"
                fill="var(--color-muted)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-surface border-border rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Status Distribution
        </h3>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        statusColors[entry.status as keyof StatusColors] ??
                        "#64748B"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {pieChartData.map((entry) => (
              <div
                key={entry.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{
                      backgroundColor:
                        statusColors[entry.status as keyof StatusColors],
                    }}
                  />
                  <span className="text-text-primary text-sm font-medium">
                    {entry.name}
                  </span>
                </div>
                <div className="text-text-secondary text-sm">
                  {entry.value} items
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Targets */}
      <div className="bg-surface border-border rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Daily Targets vs Achievement
        </h3>

        <div className="space-y-4">
          {workItems.slice(0, 5).map((item: WorkItem) => {
            const progress =
              Math.round(
                (item.completed_quantity / item.total_quantity) * 100,
              ) || 0;
            const target = item.daily_target ?? 20; // Mock daily target
            const achievement = Math.min(progress, target);

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="text-text-secondary text-sm">
                    {achievement}% / {target}%
                  </span>
                </div>

                <div className="relative">
                  <div className="bg-muted h-3 w-full rounded-full">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((achievement / target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div
                    className="bg-text-secondary absolute top-0 h-3 w-1 rounded-full"
                    style={{ left: `${target}%` }}
                    title={`Target: ${target}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressVisualization;
