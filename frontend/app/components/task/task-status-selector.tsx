import type { TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { toast } from "sonner";

const statusDotColors: Record<string, string> = {
  "To Do": "bg-muted-foreground",
  "In Progress": "bg-amber-500",
  "Done": "bg-emerald-500",
};

export const TaskStatusSelector = ({
  status,
  taskId,
}: {
  status: TaskStatus;
  taskId: string;
}) => {
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, status: value as TaskStatus },
      {
        onSuccess: () => {
          toast.success("Status updated");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update status");
        },
      }
    );
  };

  return (
    <Select value={status || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[160px]" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {["To Do", "In Progress", "Done"].map((s) => (
          <SelectItem key={s} value={s}>
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full shrink-0 ${statusDotColors[s]}`} />
              {s}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
