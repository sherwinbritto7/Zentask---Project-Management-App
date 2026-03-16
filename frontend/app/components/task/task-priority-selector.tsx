import type { TaskPriority } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskPriorityMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { Flag } from "lucide-react";

const priorityColors: Record<string, string> = {
  Low: "text-muted-foreground",
  Medium: "text-amber-500",
  High: "text-destructive",
};

export const TaskPrioritySelector = ({
  priority,
  taskId,
}: {
  priority: TaskPriority;
  taskId: string;
}) => {
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  const handlePriorityChange = (value: string) => {
    mutate(
      { taskId, priority: value as TaskPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update priority");
        },
      }
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
        <Flag className="size-4 text-muted-foreground" />
        Priority
      </h3>
      <Select value={priority || ""} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-full" disabled={isPending}>
          <SelectValue placeholder="Set priority" />
        </SelectTrigger>
        <SelectContent>
          {["Low", "Medium", "High"].map((p) => (
            <SelectItem key={p} value={p}>
              <span className={`font-medium ${priorityColors[p]}`}>{p}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
