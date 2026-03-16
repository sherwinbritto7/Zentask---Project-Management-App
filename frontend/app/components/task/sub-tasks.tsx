import type { Subtask } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { ListChecks, Plus, CheckCircle2, Circle } from "lucide-react";

export const SubTasksDetails = ({
  subTasks,
  taskId,
}: {
  subTasks: Subtask[];
  taskId: string;
}) => {
  const [newSubTask, setNewSubTask] = useState("");
  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const completed = subTasks.filter((s) => s.completed).length;
  const total = subTasks.length;

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onSuccess: () => {
          toast.success("Subtask updated");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Error updating subtask",
          );
        },
      },
    );
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    addSubTask(
      { taskId, title: newSubTask },
      {
        onSuccess: () => {
          setNewSubTask("");
          toast.success("Subtask added");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Error adding subtask");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg text-primary">
            <ListChecks className="size-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground/80 tracking-tight">
            Subtasks
          </h3>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">
              {completed} of {total} completed
            </span>
            <div className="w-20 h-1.5 bg-muted/60 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtasks List */}
      <div className="space-y-1.5">
        {subTasks.length > 0 ? (
          subTasks.map((subTask) => (
            <div
              key={subTask._id}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent",
                subTask.completed
                  ? "bg-muted/10 opacity-60"
                  : "bg-muted/20 hover:bg-muted/30 hover:border-border/60 hover:shadow-sm",
              )}
            >
              <div className="relative flex items-center justify-center">
                <Checkbox
                  id={subTask._id}
                  checked={subTask.completed}
                  onCheckedChange={(checked) =>
                    handleToggleTask(subTask._id, !!checked)
                  }
                  disabled={isUpdating}
                  className="size-5 border-2 border-primary/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-600 transition-colors"
                />
              </div>

              <label
                htmlFor={subTask._id}
                className={cn(
                  "text-[13px] cursor-pointer flex-1 font-medium transition-all duration-300",
                  subTask.completed
                    ? "line-through text-muted-foreground decoration-muted-foreground/40"
                    : "text-foreground group-hover:text-primary",
                )}
              >
                {subTask.title}
              </label>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 bg-muted/10 rounded-xl border border-dashed border-border/40">
            <Circle className="size-6 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">
              No subtasks yet
            </p>
          </div>
        )}
      </div>

      {/* Inline Add Input */}
      <div className="relative group/input">
        <Input
          placeholder="What needs to be done?"
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSubTask()}
          disabled={isPending}
          className="h-11 pl-11 pr-4 bg-muted/20 border-border/40 focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all duration-300 rounded-xl text-[13px] placeholder:text-muted-foreground/40"
        />
        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />

        <div
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300",
            newSubTask.length > 0
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none",
          )}
        >
          <Button
            size="sm"
            onClick={handleAddSubTask}
            disabled={isPending}
            className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-primary/20"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
