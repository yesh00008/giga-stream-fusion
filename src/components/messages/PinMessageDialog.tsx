import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Infinity } from "lucide-react";

interface PinMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (expiresInMinutes?: number) => void;
  messagePreview?: string;
}

const PIN_DURATIONS = [
  { label: "1 Hour", value: 60, icon: Clock },
  { label: "24 Hours", value: 1440, icon: Clock },
  { label: "7 Days", value: 10080, icon: Clock },
  { label: "30 Days", value: 43200, icon: Clock },
  { label: "Unlimited", value: undefined, icon: Infinity },
];

export function PinMessageDialog({
  open,
  onOpenChange,
  onConfirm,
  messagePreview
}: PinMessageDialogProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | undefined>(1440); // Default 24 hours

  const handleConfirm = () => {
    onConfirm(selectedDuration);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pin Message</DialogTitle>
          <DialogDescription>
            Choose how long you want to pin this message to the top of your chat.
          </DialogDescription>
        </DialogHeader>

        {messagePreview && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {messagePreview}
            </p>
          </div>
        )}

        <RadioGroup
          value={selectedDuration?.toString() || "unlimited"}
          onValueChange={(value) => setSelectedDuration(value === "unlimited" ? undefined : parseInt(value))}
          className="space-y-3"
        >
          {PIN_DURATIONS.map((duration) => {
            const Icon = duration.icon;
            const value = duration.value?.toString() || "unlimited";
            
            return (
              <div key={value} className="flex items-center space-x-3">
                <RadioGroupItem value={value} id={value} />
                <Label
                  htmlFor={value}
                  className="flex items-center gap-2 cursor-pointer flex-1 py-2"
                >
                  <Icon size={18} className="text-gray-500" />
                  <span className="font-medium">{duration.label}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-500 hover:bg-blue-600">
            Pin Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
