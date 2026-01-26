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

interface SiteLocationFormProps {
  form: UseFormReturn<FormData>;
}

const SiteLocationForm: React.FC<SiteLocationFormProps> = ({ form }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const states = [
    { value: "andhra_pradesh", label: "Andhra Pradesh" },
    { value: "telangana", label: "Telangana" },
    { value: "karnataka", label: "Karnataka" },
    { value: "tamil_nadu", label: "Tamil Nadu" },
    { value: "kerala", label: "Kerala" },
    { value: "maharashtra", label: "Maharashtra" },
  ];

  const cities = [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "bangalore", label: "Bangalore" },
    { value: "chennai", label: "Chennai" },
    { value: "mumbai", label: "Mumbai" },
    { value: "pune", label: "Pune" },
    { value: "kochi", label: "Kochi" },
  ];

  const countries = [
    { value: "IN", label: "India" },
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
  ];


  return (
    <div className="bg-surface border-border rounded-lg border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted transition-smooth flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center space-x-3">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
          <h3 className="text-text-primary text-lg font-semibold">
            Site Location
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
            name="siteLocation.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                  Site Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Complete site address"
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
              name="siteLocation.state"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                    State <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Andhra Pradesh"
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
              name="siteLocation.city"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hyderabad"
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
              name="siteLocation.pinCode"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                    PIN Code <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="500001"
                      {...field}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <p className="text-text-secondary mt-1 text-xs">
                    6 digits only (e.g. 500001).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteLocation.country"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                    Country <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="India"
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
              name="siteLocation.latitude"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                    Latitude
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="17.3850"
                      {...field}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Optional GPS coordinate
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteLocation.longitude"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary mb-1 block text-sm font-medium">
                    Longitude
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="78.4867"
                      {...field}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Optional GPS coordinate
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteLocationForm;
