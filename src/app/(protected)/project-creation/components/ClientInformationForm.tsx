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

interface ClientInformationFormProps {
  form: UseFormReturn<FormData>;
}

const ClientInformationForm: React.FC<ClientInformationFormProps> = ({
  form,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-surface border-border rounded-lg border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted transition-smooth flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center space-x-3">
          <Icon name="Users" size={20} color="var(--color-primary)" />
          <h3 className="text-text-primary text-lg font-semibold">
            Client Information
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
              name="client.clientName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Client Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter client name"
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
              name="client.clientType"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Client Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter client type (Corporate, Individual, ...)"
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
              name="client.clientContactPersonName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Contact Person <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Primary contact name"
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
              name="client.clientContactPersonPhoneNumber"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
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
              name="client.clientEmail"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Client Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="client@example.com"
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
              name="client.clientCCEmails"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Comma Seperated Client CC Email Addresses{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="client1@example.com, client2@example.com"
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
              name="client.internalEmail"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Internal Email Address{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="internal@example.com"
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
              name="client.internalCCEmails"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Comma Seperated Internal CC Email Addresses{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="internal1@example.com, internal2@example.com"
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
              name="client.gstNumber"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    GST Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="22AAAAA0000A1Z5"
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
              name="client.billingAddress"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-text-primary text-sm font-medium">
                    Billing Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Complete billing address"
                      {...field}
                      className="border-border focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
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

export default ClientInformationForm;
