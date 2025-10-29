import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import { api } from "@/trpc/react";

import { projectVersionSchema } from "@/validators/prisma-schmea.validator";
import z from "zod";

const formSchema = projectVersionSchema
  .omit({
    projectId: true,
    projectVersionCreatedAt: true,
    projectVersionCreatedByUserId: true,
    sheet1: true,
    reportStatus: true,
    blockages: true,
  })
  .extend({
    projectDocuments: z.array(z.instanceof(File)),
  });

type FormData = z.infer<typeof formSchema>;

interface TimelineFormProps {
  form: UseFormReturn<FormData>;
}

const TimelineForm: React.FC<TimelineFormProps> = ({ form }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const { data: projectManagers } =
    api.project.getProjectManagersNameWithId.useQuery(undefined, {});

  const calculateDuration = (): number => {
    const startDate = form.watch("projectStartDate");
    const endDate = form.watch("estimatedEndDate");

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const duration = calculateDuration();

  return (
    <div className="bg-surface border-border rounded-lg border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted transition-smooth flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Calendar" size={20} color="var(--color-primary)" />
          <h3 className="text-text-primary text-lg font-semibold">
            Timeline & Assignment
          </h3>
        </div>
        <Icon
          name={isExpanded ? "ChevronUp" : "ChevronDown"}
          size={20}
          color="var(--color-text-secondary)"
        />
      </button>

      {isExpanded && (
        <div className="space-y-4 p-4 pt-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="projectStartDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Project Start Date
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedEndDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Expected End Date
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {duration > 0 && (
            <div className="bg-muted rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} color="var(--color-primary)" />
                <span className="text-text-primary text-sm font-medium">
                  Project Duration: {duration} days
                </span>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="assignedProjectManagerId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-text-primary block text-sm font-medium">
                  Assigned Project Manager
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl className="w-full">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-border focus:ring-primary w-full focus:border-transparent">
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectManagers?.data.map((pm) => (
                        <SelectItem key={pm.id} value={pm.id}>
                          {pm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="estimatedWorkingDays"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Estimated Working Days{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormDescription className="text-text-secondary text-xs">
                    Excluding weekends and holidays
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bufferDays"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Buffer Days <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="15"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormDescription className="text-text-secondary text-xs">
                    Additional days for contingency
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary block text-sm font-medium">
                  Special Instructions
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special timeline considerations or instructions..."
                    {...field}
                    rows={3}
                    className="border-border focus:ring-primary resize-none focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default TimelineForm;
