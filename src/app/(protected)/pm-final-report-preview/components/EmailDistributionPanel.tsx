"use client";

import React, { useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Icon from "@/components/rocket/components/AppIcon";
import type { IconName } from "@/components/rocket/components/AppIcon";

interface EmailSettings {
  internal: {
    recipients: string[];
    subject: string;
    customMessage: string;
  };
  external: {
    recipients: string[];
    subject: string;
    customMessage: string;
  };
}

interface ProjectData {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  // Add other specific project data properties as needed
}

interface EmailDistributionPanelProps {
  emailSettings: EmailSettings;
  onEmailSettingsChange: (
    type: "internal" | "external",
    updates: Partial<EmailSettings["internal"] | EmailSettings["external"]>,
  ) => void;
  onSaveDraft: () => void | Promise<void>;
  onSendInternal: () => void | Promise<void>;
  onSendExternal: () => void | Promise<void>;
  onSendBoth: () => void | Promise<void>;
  projectData?: ProjectData;
}

interface Tab {
  id: "internal" | "external";
  label: string;
  icon: IconName;
  color: string;
}

const EmailDistributionPanel: React.FC<EmailDistributionPanelProps> = ({
  emailSettings,
  onEmailSettingsChange,
  onSaveDraft,
  onSendInternal,
  onSendExternal,
  onSendBoth,
  projectData,
}) => {
  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    "internal",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSettingChange = (
    type: "internal" | "external",
    field: string,
    value: string,
  ) => {
    onEmailSettingsChange(type, { [field]: value });
  };

  const handleRecipientsChange = (
    type: "internal" | "external",
    value: string,
  ) => {
    const recipients = value
      .split(",")
      .map((email: string) => email.trim())
      .filter((email: string) => email);
    onEmailSettingsChange(type, { recipients });
  };

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateRecipients = (recipients: string[]): boolean => {
    return recipients.length > 0 && recipients.every(validateEmail);
  };

  const handleSendEmail = async (
    type: "internal" | "external" | "both",
  ): Promise<void> => {
    setIsLoading(true);
    try {
      if (type === "internal") {
        await onSendInternal();
      } else if (type === "external") {
        await onSendExternal();
      } else {
        await onSendBoth();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: Tab[] = [
    { id: "internal", label: "Internal Team", icon: "Users", color: "primary" },
    { id: "external", label: "Client/External", icon: "Mail", color: "info" },
  ];

  return (
    <div className="bg-surface border-border rounded-lg border">
      <div className="border-border border-b p-6">
        <h3 className="text-text-primary mb-2 text-lg font-semibold">
          Email Distribution
        </h3>

        <div className="mt-6 flex flex-col gap-y-6">
          <Button
            variant="default"
            size="sm"
            fullWidth
            onClick={() => handleSendEmail("internal")}
            disabled={
              !validateRecipients(emailSettings.internal.recipients) ||
              isLoading
            }
            loading={isLoading}
            iconName="Send"
            iconPosition="left"
          >
            Send Internal Report
          </Button>
          <Button
            variant="success"
            size="sm"
            fullWidth
            onClick={() => handleSendEmail("external")}
            disabled={
              !validateRecipients(emailSettings.external.recipients) ||
              isLoading
            }
            loading={isLoading}
            iconName="Send"
            iconPosition="left"
          >
            Send External Report
          </Button>
          <Button
            variant="warning"
            size="sm"
            fullWidth
            onClick={() => handleSendEmail("both")}
            disabled={
              !validateRecipients(emailSettings.internal.recipients) ||
              !validateRecipients(emailSettings.external.recipients) ||
              isLoading
            }
            loading={isLoading}
            iconName="Send"
            iconPosition="left"
          >
            Send Both Reports
          </Button>
        </div>
        {/* <p className="text-text-secondary text-sm">
          Configure email settings and send reports
        </p> */}
      </div>

      {/* Tab Navigation */}
      {/* <div className="border-border flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`transition-smooth flex-1 border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === tab.id
                ? `border-${tab.color} text-${tab.color} bg-${tab.color}/5`
                : "text-text-secondary hover:text-text-primary hover:bg-muted/50 border-transparent"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name={tab.icon} size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
          </button>
        ))}
      </div> */}
    </div>
  );
};

export default EmailDistributionPanel;

// <div className="p-6">
//   {/* Internal Team Tab */}
//   {activeTab === "internal" && (
//     <div className="space-y-4">
//       <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
//         <div className="flex items-center space-x-2">
//           <Icon name="Users" size={16} color="var(--color-primary)" />
//           <p className="text-primary text-sm font-medium">
//             Internal Team Distribution
//           </p>
//         </div>
//         {/* <p className="text-primary/80 mt-1 text-xs">
//           Full report with all details including team-side blockages
//         </p> */}
//       </div>

//       <div>
//         <label className="text-text-primary mb-2 block text-sm font-medium">
//           Recipients
//         </label>
//         <Input
//           value={emailSettings.internal.recipients.join(", ")}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             handleRecipientsChange("internal", e.target.value)
//           }
//           placeholder="email1@company.com, email2@company.com"
//           error={
//             !validateRecipients(emailSettings.internal.recipients)
//               ? "Please enter valid email addresses"
//               : ""
//           }
//         />
//         <p className="text-text-secondary mt-1 text-xs">
//           Comma-separated email addresses
//         </p>
//       </div>

//       <div>
//         <label className="text-text-primary mb-2 block text-sm font-medium">
//           Subject
//         </label>
//         <Input
//           value={emailSettings.internal.subject}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             handleSettingChange("internal", "subject", e.target.value)
//           }
//           placeholder="Enter email subject"
//         />
//       </div>

//       <div>
//         <label className="text-text-primary mb-2 block text-sm font-medium">
//           Custom Message (Optional)
//         </label>
//         <textarea
//           value={emailSettings.internal.customMessage}
//           onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//             handleSettingChange(
//               "internal",
//               "customMessage",
//               e.target.value,
//             )
//           }
//           placeholder="Add a custom message..."
//           rows={3}
//           className="border-border focus:ring-primary/20 focus:border-primary transition-smooth w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
//         />
//       </div>

//       <div className="space-y-2">
//         <Button
//           variant="default"
//           size="sm"
//           fullWidth
//           onClick={() => handleSendEmail("internal")}
//           disabled={
//             !validateRecipients(emailSettings.internal.recipients) ||
//             isLoading
//           }
//           loading={isLoading}
//           iconName="Send"
//           iconPosition="left"
//         >
//           Send Internal Report
//         </Button>
//       </div>
//     </div>
//   )}

//   {/* External/Client Tab */}
//   {activeTab === "external" && (
//     <div className="space-y-4">
//       <div className="bg-info/10 border-info/20 rounded-lg border p-3">
//         <div className="flex items-center space-x-2">
//           <Icon name="Mail" size={16} color="var(--color-info)" />
//           <p className="text-info text-sm font-medium">
//             External Client Distribution
//           </p>
//         </div>
//         {/* <p className="text-info/80 mt-1 text-xs">
//           Filtered report with selected photos and client-appropriate
//           content
//         </p> */}
//       </div>

//       <div>
//         <label className="text-text-primary mb-2 block text-sm font-medium">
//           Recipients
//         </label>
//         <Input
//           value={emailSettings.external.recipients.join(", ")}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             handleRecipientsChange("external", e.target.value)
//           }
//           placeholder="client@company.com, manager@company.com"
//           error={
//             !validateRecipients(emailSettings.external.recipients)
//               ? "Please enter valid email addresses"
//               : ""
//           }
//         />
//         <p className="text-text-secondary mt-1 text-xs">
//           Comma-separated email addresses
//         </p>
//       </div>

//       <div>
//         <label className="text-text-primary mb-2 block text-sm font-medium">
//           Subject
//         </label>
//         <Input
//           value={emailSettings.external.subject}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             handleSettingChange("external", "subject", e.target.value)
//           }
//           placeholder="Enter email subject"
//         />
//       </div>

//       <div>
//         <label className="text-text-primary mb-2 block text-sm font-medium">
//           Custom Message (Optional)
//         </label>
//         <textarea
//           value={emailSettings.external.customMessage}
//           onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//             handleSettingChange(
//               "external",
//               "customMessage",
//               e.target.value,
//             )
//           }
//           placeholder="Add a custom message for the client..."
//           rows={4}
//           className="border-border focus:ring-primary/20 focus:border-primary transition-smooth w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
//         />
//       </div>

//       <div className="space-y-2">
//         <Button
//           variant="outline"
//           size="sm"
//           fullWidth
//           onClick={() => handleSendEmail("external")}
//           disabled={
//             !validateRecipients(emailSettings.external.recipients) ||
//             isLoading
//           }
//           loading={isLoading}
//           iconName="Send"
//           iconPosition="left"
//         >
//           Send External Report
//         </Button>
//       </div>
//     </div>
//   )}

//   {/* Action Buttons */}
//   <div className="border-border mt-6 space-y-3 border-t pt-6">
//     {/* <Button
//       variant="outline"
//       size="sm"
//       fullWidth
//       onClick={onSaveDraft}
//       iconName="Save"
//       iconPosition="left"
//     >
//       Save Draft
//     </Button> */}

//     <Button
//       variant="secondary"
//       size="sm"
//       fullWidth
//       onClick={() => handleSendEmail("both")}
//       disabled={
//         !validateRecipients(emailSettings.internal.recipients) ||
//         !validateRecipients(emailSettings.external.recipients) ||
//         isLoading
//       }
//       loading={isLoading}
//       iconName="Send"
//       iconPosition="left"
//     >
//       Send Both Reports
//     </Button>
//   </div>

//   {/* Email Preview Info */}
//   {/* <div className="border-border mt-6 border-t pt-6">
//     <h4 className="text-text-primary mb-2 font-medium">
//       What will be included:
//     </h4>
//     <div className="text-text-secondary space-y-2 text-xs">
//       <div className="flex items-center space-x-2">
//         <Icon name="FileText" size={12} />
//         <span>Sheet 1 & Sheet 2 progress reports</span>
//       </div>
//       <div className="flex items-center space-x-2">
//         <Icon name="Camera" size={12} />
//         <span>Selected progress photos</span>
//       </div>
//       <div className="flex items-center space-x-2">
//         <Icon name="AlertTriangle" size={12} />
//         <span>
//           {activeTab === "internal"
//             ? "All blockages"
//             : "Client-visible blockages only"}
//         </span>
//       </div>
//       <div className="flex items-center space-x-2">
//         <Icon name="MapPin" size={12} />
//         <span>GPS location data for photos</span>
//       </div>
//     </div>
//   </div> */}
// </div>
