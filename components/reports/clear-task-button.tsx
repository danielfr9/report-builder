import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { Trash2Icon } from "lucide-react";

const ClearTasksButton = ({
  disabled = false,
  title,
  onClearTasks,
}: {
  title: string;
  disabled?: boolean;
  onClearTasks: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-fit ml-auto"
              onClick={() => {
                onClearTasks();
                setOpen(false);
              }}
            >
              Si, eliminar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ClearTasksButton;
