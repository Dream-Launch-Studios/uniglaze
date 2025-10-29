import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import {
  FormControl,
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

interface ProjectDetailsFormProps {
  form: UseFormReturn<FormData>;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ form }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const projectTypes = [
    { value: "residential", label: "Residential Building" },
    { value: "commercial", label: "Commercial Complex" },
    { value: "industrial", label: "Industrial Facility" },
    { value: "institutional", label: "Institutional Building" },
    { value: "retail", label: "Retail Space" },
    { value: "hospitality", label: "Hotel/Restaurant" },
  ];

  const projectCategories = [
    { value: "new_construction", label: "New Construction" },
    { value: "renovation", label: "Renovation" },
    { value: "maintenance", label: "Maintenance" },
    { value: "repair", label: "Repair Work" },
  ];

  const priorityLevels = [
    { value: "LOW_PRIORITY", label: "Low Priority" },
    { value: "MEDIUM_PRIORITY", label: "Medium Priority" },
    { value: "HIGH_PRIORITY", label: "High Priority" },
    { value: "URGENT", label: "Urgent" },
  ];

  const projectStatuses = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DELAYED", label: "Delayed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "BLOCKED", label: "Blocked" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="bg-surface border-border rounded-lg border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted transition-smooth flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Building2" size={20} color="var(--color-primary)" />
          <h3 className="text-text-primary text-lg font-semibold">
            Project Details
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
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary block text-sm font-medium">
                  Project Name
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    {...field}
                    className="border-border focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Project Type
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project type (eg Residential, Commercial,...)"
                      {...field}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectCategory"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Project Category
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project category (eg New Construction, Renovation,...)"
                      {...field}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="priorityLevel"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Priority Level
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-border focus:ring-primary w-full focus:border-transparent">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityLevels.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectStatus"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Project Status
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-border focus:ring-primary w-full focus:border-transparent">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary block text-sm font-medium">
                  Project Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the project scope and requirements..."
                    {...field}
                    rows={4}
                    className="border-border focus:ring-primary resize-none focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 md:flex-row">
            <FormField
              control={form.control}
              name="estimatedBudget"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Value of Project (₹) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">Enter amount in INR</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floorArea"
              render={({ field }) => (
                <FormItem className="w-full self-start">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Floor Area (sq ft) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="msTeamsLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary block text-sm font-medium">
                  MS Teams Link
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://teams.microsoft.com/..."
                    {...field}
                    className="border-border focus:ring-primary focus:border-transparent"
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

export default ProjectDetailsForm;
