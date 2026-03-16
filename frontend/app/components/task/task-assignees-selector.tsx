import type { ProjectMemberRole, Task, User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { ChevronDown, Users } from "lucide-react";

export const TaskAssigneesSelector = ({
  task,
  assignees,
  projectMembers,
}: {
  task: Task;
  assignees: User[];
  projectMembers: { user: User; role: ProjectMemberRole }[];
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    assignees.map((assignee) => assignee._id)
  );
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const { mutate, isPending } = useUpdateTaskAssigneesMutation();

  const handleSelectAll = () => {
    setSelectedIds(projectMembers.map((m) => m.user._id));
  };

  const handleUnSelectAll = () => {
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    mutate(
      { taskId: task._id, assignees: selectedIds },
      {
        onSuccess: () => {
          setDropDownOpen(false);
          toast.success("Assignees updated");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update assignees");
        },
      }
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        Assignees
      </h3>

      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">Unassigned</span>
        ) : (
          projectMembers
            .filter((member) => selectedIds.includes(member.user._id))
            .map((m) => (
              <div
                key={m.user._id}
                className="flex items-center gap-1.5 bg-muted/50 border border-border/40 rounded-full px-2.5 py-1"
              >
                <Avatar className="size-4">
                  <AvatarImage src={m.user.profilePicture} />
                  <AvatarFallback className="text-[8px]">{m.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{m.user.name}</span>
              </div>
            ))
        )}
      </div>

      <div className="relative">
        <button
          className="text-sm text-muted-foreground w-full border border-border/60 rounded-md px-3 py-2 text-left bg-background hover:bg-muted/30 transition-colors flex items-center justify-between"
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          <span>
            {selectedIds.length === 0
              ? "Select assignees"
              : `${selectedIds.length} selected`}
          </span>
          <ChevronDown className={`size-4 transition-transform ${dropDownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropDownOpen && (
          <div className="absolute z-20 mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
            <div className="flex justify-between px-3 py-2 border-b border-border/50">
              <button
                className="text-xs text-primary hover:underline"
                onClick={handleSelectAll}
              >
                Select all
              </button>
              <button
                className="text-xs text-destructive hover:underline"
                onClick={handleUnSelectAll}
              >
                Clear all
              </button>
            </div>

            {projectMembers.map((m) => (
              <label
                className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-muted/40 gap-3"
                key={m.user._id}
              >
                <Checkbox
                  checked={selectedIds.includes(m.user._id)}
                  onCheckedChange={() => handleSelect(m.user._id)}
                />
                <Avatar className="size-6">
                  <AvatarImage src={m.user.profilePicture} />
                  <AvatarFallback className="text-xs">{m.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{m.user.name}</span>
              </label>
            ))}

            <div className="flex justify-end gap-2 px-3 py-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClickCapture={() => setDropDownOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClickCapture={handleSave}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
