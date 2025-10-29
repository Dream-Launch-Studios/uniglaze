import React, { useState } from "react";
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
import Icon from "@/components/rocket/components/AppIcon";

// Define proper types
interface BarChartDataItem {
  phase: string;
  supply: number;
  install: number;
}

interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface ProgressVisualizationProps {
  data?: MasterDataRow[];
  type?: "bar" | "pie";
}

interface onTypeChangeProps {
  onTypeChange?: (type: "bar" | "pie") => void;
}

interface TooltipPayload {
  value?: number;
  dataKey?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface PieTooltipPayload {
  name?: string;
  value?: number;
  payload?: {
    color?: string;
  };
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayload[];
}

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
  hasPhotos?: boolean;
  isBlocked?: boolean;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  data,
}) => {
  // const barChartData: BarChartDataItem[] = [
  //   { phase: "Foundation", supply: 85, install: 75 },
  //   { phase: "Structure", supply: 70, install: 45 },
  //   { phase: "Glazing", supply: 60, install: 30 },
  //   { phase: "Finishing", supply: 40, install: 15 },
  //   { phase: "Testing", supply: 20, install: 5 },
  // ];

  const COLORS = Array.from(
    { length: data?.length ?? 1 },
    (_, i) => `hsl(${(i * 360) / (data?.length ?? 1)}, 70%, 50%)`,
  );

  const [type, setType] = useState<"bar" | "pie">("bar");

  const onTypeChange = (newType: "bar" | "pie") => {
    setType(newType);
  };

  const barChartData: BarChartDataItem[] =
    data?.map((item) => ({
      phase: item.itemDescription,
      supply: item.supplyProgress,
      install: item.installProgress,
    })) ?? [];

  const pieChartData: PieChartDataItem[] =
    data?.map((item, index) => ({
      name: item.itemDescription,
      value: item.supplyProgress,
      color: COLORS[index] ?? "var(--color-primary)",
    })) ?? [];

  // const pieChartData: PieChartDataItem[] = [
  //   { name: "Completed", value: 45, color: "var(--color-success)" },
  //   { name: "In Progress", value: 30, color: "var(--color-warning)" },
  //   { name: "Pending", value: 20, color: "var(--color-error)" },
  //   { name: "Blocked", value: 5, color: "var(--color-text-secondary)" },
  // ];

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-popover border-border elevation-2 rounded-lg border p-3">
          <p className="text-text-primary mb-2 text-sm font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-text-secondary">{entry.dataKey}:</span>
              <span className="text-text-primary font-medium">
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0];
      if (!data) return null;

      return (
        <div className="bg-popover border-border elevation-2 rounded-lg border p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: data.payload?.color }}
            ></div>
            <span className="text-text-secondary">{data.name}:</span>
            <span className="text-text-primary font-medium">{data.value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleTypeChange = (newType: "bar" | "pie") => {
    onTypeChange(newType);
    // if (onTypeChange) {
    // }
  };

  return (
    <div className="bg-card border-border rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={20} color="var(--color-primary)" />
          <h3 className="text-text-primary text-lg font-semibold">
            Progress Visualization
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTypeChange("bar")}
            className={`transition-smooth rounded-md px-3 py-1 text-sm ${
              type === "bar"
                ? "bg-primary text-primary-foreground"
                : "text-text-secondary hover:bg-muted"
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => handleTypeChange("pie")}
            className={`transition-smooth rounded-md px-3 py-1 text-sm ${
              type === "pie"
                ? "bg-primary text-primary-foreground"
                : "text-text-secondary hover:bg-muted"
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      {type === "bar" ? (
        <div className="h-80">
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
                dataKey="phase"
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="supply"
                fill="var(--color-primary)"
                name="Supply Progress"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="install"
                fill="var(--color-accent)"
                name="Install Progress"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="border-border mt-4 flex items-center justify-center space-x-6 border-t pt-4">
        {type === "bar" ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="bg-primary h-3 w-3 rounded"></div>
              <span className="text-text-secondary text-sm">
                Supply Progress
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-accent h-3 w-3 rounded"></div>
              <span className="text-text-secondary text-sm">
                Install Progress
              </span>
            </div>
          </>
        ) : (
          pieChartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-text-secondary text-sm">{item.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgressVisualization;
