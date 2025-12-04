import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import Icon from "@/components/rocket/components/AppIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { Role } from "@prisma/client";
import type { Session } from "@/server/auth";
import { useSession } from "@/lib/auth-client";

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

interface ProgressVisualizationProps {
  data?: MasterDataRow[];
  projectId?: number;
}

type ChartType = "bar" | "line";
type DateRange = "7d" | "30d" | "90d" | "all" | "custom";
type Parameter = "supplied" | "installed" | "net" | "supplyProgress" | "installProgress";

interface ChartDataPoint {
  date: string;
  supplied?: number;
  installed?: number;
  net?: number;
  supplyProgress?: number;
  installProgress?: number;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  data,
  projectId,
}) => {
  const { data: session } = useSession() as {
    data: Session | null;
    isPending: boolean;
  };
  const userRole = session?.user?.customRole;
  const canEdit = userRole === Role.HEAD_OF_PLANNING || userRole === Role.MANAGING_DIRECTOR;

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [selectedItemId, setSelectedItemId] = useState<string | number>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedParameters, setSelectedParameters] = useState<Set<Parameter>>(
    new Set(["supplied", "installed"])
  );

  // Calculate date range for preset options
  const dateRangeParams = useMemo(() => {
    if (!projectId) return { projectId: 0, startDate: undefined, endDate: undefined };
    
    if (dateRange === "custom") {
      return {
        projectId,
        startDate: customStartDate ? new Date(customStartDate) : undefined,
        endDate: customEndDate ? new Date(customEndDate) : undefined,
      };
    }
    
    if (dateRange === "all") {
      return { projectId, startDate: undefined, endDate: undefined };
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return { projectId, startDate: undefined, endDate: undefined };
    }
    
    return { projectId, startDate, endDate: now };
  }, [projectId, dateRange, customStartDate, customEndDate]);

  // Fetch historical data when date range is selected (only for HOP/MD)
  const { data: historicalData } = api.project.getProjectVersionsHistory.useQuery(
    dateRangeParams,
    {
      enabled: !!projectId && canEdit && dateRange !== "all" && (dateRange !== "custom" || (!!customStartDate && !!customEndDate)),
    }
  );

  // Get selected item
  const selectedItem = useMemo(() => {
    if (selectedItemId === "all" || !data) return null;
    return data.find((item) => item.id === selectedItemId);
  }, [selectedItemId, data]);

  // Generate chart data based on selections
  const chartData = useMemo((): ChartDataPoint[] => {
    // If date range is selected (not "all") and we have historical data, use it
    if (dateRange !== "all" && historicalData?.data && historicalData.data.length > 0) {
      const versions = historicalData.data;
      const result: ChartDataPoint[] = [];

      // Get date range for filtering
      let startDateFilter: Date | undefined;
      let endDateFilter: Date | undefined;
      
      if (dateRange === "custom" && customStartDate && customEndDate) {
        startDateFilter = new Date(customStartDate);
        endDateFilter = new Date(customEndDate);
        // Set to end of day for endDate
        if (endDateFilter) {
          endDateFilter.setHours(23, 59, 59, 999);
        }
      } else {
        const now = new Date();
        switch (dateRange) {
          case "7d":
            startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }
        endDateFilter = now;
      }

      // Sort versions by actual report date first
      const sortedVersions = [...versions].sort((a, b) => {
        const dateA = a.yesterdayReportCreatedAt 
          ? new Date(a.yesterdayReportCreatedAt)
          : new Date(a.projectVersionCreatedAt);
        const dateB = b.yesterdayReportCreatedAt 
          ? new Date(b.yesterdayReportCreatedAt)
          : new Date(b.projectVersionCreatedAt);
        return dateA.getTime() - dateB.getTime();
      });

      sortedVersions.forEach((version) => {
        const sheet1 = version.sheet1 as Array<{
          itemName: string;
          totalQuantity: number;
          totalSupplied: number;
          totalInstalled: number;
          percentSupplied: number;
          percentInstalled: number;
          sheet2?: Array<{
            subItemName: string;
            totalQuantity: number;
            totalSupplied: number;
            totalInstalled: number;
            percentSupplied: number;
            percentInstalled: number;
            connectWithSheet1Item: boolean;
          }>;
        }>;

        if (!sheet1 || sheet1.length === 0) return;

        // Use yesterdayReportCreatedAt if available (actual report date), otherwise use projectVersionCreatedAt
        const versionDate = version.yesterdayReportCreatedAt 
          ? new Date(version.yesterdayReportCreatedAt)
          : new Date(version.projectVersionCreatedAt);
        
        // Filter by actual report date
        if (startDateFilter && versionDate < startDateFilter) return;
        if (endDateFilter && versionDate > endDateFilter) return;
        
        const date = versionDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });

        if (selectedItemId === "all") {
          // Aggregate all items
          const aggregated = sheet1.reduce(
            (acc, item) => ({
              supplied: acc.supplied + item.totalSupplied,
              installed: acc.installed + item.totalInstalled,
              quantity: acc.quantity + item.totalQuantity,
            }),
            { supplied: 0, installed: 0, quantity: 0 }
          );

          const avgSupplyProgress =
            sheet1.reduce((sum, item) => sum + item.percentSupplied, 0) / sheet1.length;
          const avgInstallProgress =
            sheet1.reduce((sum, item) => sum + item.percentInstalled, 0) / sheet1.length;

          result.push({
            date,
            supplied: aggregated.supplied ?? 0,
            installed: aggregated.installed ?? 0,
            net: (aggregated.supplied ?? 0) - (aggregated.installed ?? 0),
            supplyProgress: avgSupplyProgress ?? 0,
            installProgress: avgInstallProgress ?? 0,
          });
        } else {
          // Single item selected
          const item = sheet1.find((item, idx) => idx === selectedItemId);
          if (item) {
            result.push({
              date,
              supplied: item.totalSupplied ?? 0,
              installed: item.totalInstalled ?? 0,
              net: (item.totalSupplied ?? 0) - (item.totalInstalled ?? 0),
              supplyProgress: item.percentSupplied ?? 0,
              installProgress: item.percentInstalled ?? 0,
            });
          }
        }
      });

      return result;
    }

    // Fallback to current data (non-historical view)
    if (!data || data.length === 0) return [];

    // If "all items" is selected, aggregate data
    if (selectedItemId === "all") {
      const aggregated = data.reduce(
        (acc, item) => ({
          supplied: acc.supplied + item.supplied,
          installed: acc.installed + item.installed,
          quantity: acc.quantity + item.quantity,
        }),
        { supplied: 0, installed: 0, quantity: 0 }
      );

      return [
        {
          date: "Current",
          supplied: aggregated.supplied ?? 0,
          installed: aggregated.installed ?? 0,
          net: (aggregated.supplied ?? 0) - (aggregated.installed ?? 0),
          supplyProgress: data.length > 0 ? data.reduce((sum, item) => sum + (item.supplyProgress ?? 0), 0) / data.length : 0,
          installProgress: data.length > 0 ? data.reduce((sum, item) => sum + (item.installProgress ?? 0), 0) / data.length : 0,
        },
      ];
    }

    // Single item selected
    if (selectedItem) {
      const item = selectedItem;
      return [
        {
          date: "Current",
          supplied: item.supplied ?? 0,
          installed: item.installed ?? 0,
          net: (item.supplied ?? 0) - (item.installed ?? 0),
          supplyProgress: item.supplyProgress ?? 0,
          installProgress: item.installProgress ?? 0,
        },
      ];
    }

    return [];
  }, [data, selectedItemId, selectedItem, dateRange, historicalData, customStartDate, customEndDate]);

  // Filter data by date range - data is already filtered by the query
  const filteredChartData = useMemo(() => {
    return chartData;
  }, [chartData]);

  const handleParameterToggle = (param: Parameter) => {
    setSelectedParameters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(param)) {
        newSet.delete(param);
      } else {
        newSet.add(param);
      }
      return newSet;
    });
  };

  const getParameterColor = (param: Parameter): string => {
    const colors: Record<Parameter, string> = {
      supplied: "#3b82f6", // Blue
      installed: "#10b981", // Green
      net: "#f59e0b", // Amber
      supplyProgress: "#8b5cf6", // Purple
      installProgress: "#ef4444", // Red
    };
    return colors[param] ?? "#3b82f6";
  };

  const getParameterName = (param: Parameter): string => {
    const names: Record<Parameter, string> = {
      supplied: "Supplied",
      installed: "Installed",
      net: "Net (Supplied - Installed)",
      supplyProgress: "Supply Progress %",
      installProgress: "Install Progress %",
    };
    return names[param];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border-border rounded-lg border p-3 shadow-lg">
          <p className="text-text-primary mb-2 text-sm font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary">{entry.name}:</span>
              <span className="text-text-primary font-medium">
                {typeof entry.value === "number"
                  ? entry.value.toFixed(2)
                  : entry.value}
                {entry.dataKey?.includes("Progress") ? "%" : ""}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="bg-card border-border rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="BarChart3" size={20} color="var(--color-primary)" />
            <h3 className="text-text-primary text-lg font-semibold">
              Progress Visualization
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Item Selector */}
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">
              Select Item
            </Label>
            <Select
              value={selectedItemId.toString()}
              onValueChange={(value) => setSelectedItemId(value === "all" ? "all" : +value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {data?.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.itemDescription}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selector */}
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">
              Date Range
            </Label>
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                {canEdit && <SelectItem value="custom">Custom Range</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range Inputs - Only for HOP/MD */}
          {dateRange === "custom" && canEdit && (
            <>
              <div className="space-y-2">
                <Label className="text-text-secondary text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-secondary text-sm font-medium">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Chart Type Selector */}
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">
              Chart Type
            </Label>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType("bar")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  chartType === "bar"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-text-secondary hover:bg-muted/80"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  chartType === "line"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-text-secondary hover:bg-muted/80"
                }`}
              >
                Line
              </button>
            </div>
          </div>
        </div>

        {/* Parameter Selection */}
        <div className="mt-4 space-y-2">
          <Label className="text-text-secondary text-sm font-medium">
            Select Parameters to Display
          </Label>
          <div className="flex flex-wrap gap-4">
            {(["supplied", "installed", "net", "supplyProgress", "installProgress"] as Parameter[]).map(
              (param) => (
                <div key={param} className="flex items-center space-x-2">
                  <Checkbox
                    id={param}
                    checked={selectedParameters.has(param)}
                    onCheckedChange={() => handleParameterToggle(param)}
                  />
                  <Label
                    htmlFor={param}
                    className="text-text-secondary cursor-pointer text-sm font-normal"
                  >
                    {getParameterName(param)}
                  </Label>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-card border-border rounded-lg border p-4">
        {filteredChartData.length === 0 || selectedParameters.size === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Icon
                name="BarChart3"
                size={48}
                color="var(--color-text-secondary)"
                className="mx-auto mb-3 opacity-50"
              />
              <p className="text-text-secondary">
                {selectedParameters.size === 0
                  ? "Please select at least one parameter to display"
                  : "No data available for the selected filters"}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart
                  data={filteredChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--color-border)" }}
                    angle={chartData.length > 5 ? -45 : 0}
                    textAnchor={chartData.length > 5 ? "end" : "middle"}
                    height={chartData.length > 5 ? 80 : 40}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--color-border)" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedParameters.has("supplied") && (
                    <Bar
                      dataKey="supplied"
                      fill={getParameterColor("supplied")}
                      name="Supplied"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedParameters.has("installed") && (
                    <Bar
                      dataKey="installed"
                      fill={getParameterColor("installed")}
                      name="Installed"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedParameters.has("net") && (
                    <Bar
                      dataKey="net"
                      fill={getParameterColor("net")}
                      name="Net (Supplied - Installed)"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedParameters.has("supplyProgress") && (
                    <Bar
                      dataKey="supplyProgress"
                      fill={getParameterColor("supplyProgress")}
                      name="Supply Progress %"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedParameters.has("installProgress") && (
                    <Bar
                      dataKey="installProgress"
                      fill={getParameterColor("installProgress")}
                      name="Install Progress %"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              ) : (
                <LineChart
                  data={filteredChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--color-border)" }}
                    angle={chartData.length > 5 ? -45 : 0}
                    textAnchor={chartData.length > 5 ? "end" : "middle"}
                    height={chartData.length > 5 ? 80 : 40}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--color-border)" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedParameters.has("supplied") && (
                    <Line
                      type="monotone"
                      dataKey="supplied"
                      stroke={getParameterColor("supplied")}
                      name="Supplied"
                      strokeWidth={2}
                      dot={{ r: 4, fill: getParameterColor("supplied") }}
                    />
                  )}
                  {selectedParameters.has("installed") && (
                    <Line
                      type="monotone"
                      dataKey="installed"
                      stroke={getParameterColor("installed")}
                      name="Installed"
                      strokeWidth={2}
                      dot={{ r: 4, fill: getParameterColor("installed") }}
                      strokeDasharray="5 5"
                    />
                  )}
                  {selectedParameters.has("net") && (
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke={getParameterColor("net")}
                      name="Net (Supplied - Installed)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: getParameterColor("net") }}
                      strokeDasharray="3 3"
                    />
                  )}
                  {selectedParameters.has("supplyProgress") && (
                    <Line
                      type="monotone"
                      dataKey="supplyProgress"
                      stroke={getParameterColor("supplyProgress")}
                      name="Supply Progress %"
                      strokeWidth={2}
                      dot={{ r: 4, fill: getParameterColor("supplyProgress") }}
                    />
                  )}
                  {selectedParameters.has("installProgress") && (
                    <Line
                      type="monotone"
                      dataKey="installProgress"
                      stroke={getParameterColor("installProgress")}
                      name="Install Progress %"
                      strokeWidth={2}
                      dot={{ r: 4, fill: getParameterColor("installProgress") }}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Stats */}
        {selectedItem && (
          <div className="border-border mt-6 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-5">
            <div className="text-center">
              <p className="text-text-secondary text-xs">Total Quantity</p>
              <p className="text-text-primary text-lg font-semibold">
                {selectedItem.quantity}
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary text-xs">Supplied</p>
              <p className="text-text-primary text-lg font-semibold">
                {selectedItem.supplied}
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary text-xs">Installed</p>
              <p className="text-text-primary text-lg font-semibold">
                {selectedItem.installed}
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary text-xs">Supply Progress</p>
              <p className="text-text-primary text-lg font-semibold">
                {selectedItem.supplyProgress.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary text-xs">Install Progress</p>
              <p className="text-text-primary text-lg font-semibold">
                {selectedItem.installProgress.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressVisualization;
