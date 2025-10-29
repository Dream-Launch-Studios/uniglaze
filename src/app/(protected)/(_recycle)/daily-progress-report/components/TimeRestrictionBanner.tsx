/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";

interface TimeRestrictionBannerProps {
  isTimeRestricted?: boolean;
  allowedStartHour?: number;
  allowedEndHour?: number;
  onOverrideRequest?: () => void;
}

const TimeRestrictionBanner: React.FC<TimeRestrictionBannerProps> = ({
  isTimeRestricted = true,
  allowedStartHour = 10,
  allowedEndHour = 11,
  onOverrideRequest,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInAllowedWindow, setIsInAllowedWindow] = useState(false);
  const [timeUntilWindow, setTimeUntilWindow] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentHour = now.getHours();
      const isAllowed =
        currentHour >= allowedStartHour && currentHour < allowedEndHour;
      setIsInAllowedWindow(isAllowed);

      if (!isAllowed) {
        calculateTimeUntilWindow(now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [allowedStartHour, allowedEndHour]);

  const calculateTimeUntilWindow = (now: Date): void => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(allowedStartHour, 0, 0, 0);

    const today = new Date(now);
    today.setHours(allowedStartHour, 0, 0, 0);

    let targetTime: Date;
    if (now.getHours() < allowedStartHour) {
      targetTime = today;
    } else {
      targetTime = tomorrow;
    }

    const diff = targetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      setTimeUntilWindow(`${hours}h ${minutes}m`);
    } else {
      setTimeUntilWindow(`${minutes}m`);
    }
  };

  if (!isTimeRestricted) {
    return null;
  }

  if (isInAllowedWindow) {
    return (
      <div className="bg-success/10 border-success mb-6 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-success/20 flex h-10 w-10 items-center justify-center rounded-full">
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            </div>
            <div>
              <h3 className="text-success text-sm font-semibold">
                Data Entry Window Active
              </h3>
              <p className="text-success/80 text-xs">
                You can now enter and update progress data until{" "}
                {allowedEndHour}:00 AM
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-success font-mono text-sm">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-success/80 text-xs">
              Window closes in {60 - currentTime.getMinutes()} minutes
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warning/10 border-warning mb-6 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-warning/20 flex h-10 w-10 items-center justify-center rounded-full">
            <Icon name="Clock" size={20} color="var(--color-warning)" />
          </div>
          <div>
            <h3 className="text-warning text-sm font-semibold">
              Data Entry Restricted
            </h3>
            <p className="text-warning/80 text-xs">
              Progress data can only be entered between {allowedStartHour}:00 AM
              - {allowedEndHour}:00 AM daily
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-warning font-mono text-sm">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-warning/80 text-xs">
            Next window in {timeUntilWindow}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="border-warning/20 mt-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="text-warning/80 text-xs">
            This ensures data accuracy and prevents late entries that could
            affect project timelines.
          </div>

          {onOverrideRequest && (
            <Button
              variant="outline"
              size="sm"
              iconName="Key"
              iconPosition="left"
              onClick={onOverrideRequest}
              className="border-warning text-warning hover:bg-warning/10"
            >
              Request Override
            </Button>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-warning/5 mt-3 rounded-md p-3">
        <div className="flex items-center justify-center space-x-2">
          <Icon name="Timer" size={16} color="var(--color-warning)" />
          <span className="text-warning text-sm font-medium">
            Next entry window opens in {timeUntilWindow}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeRestrictionBanner;
