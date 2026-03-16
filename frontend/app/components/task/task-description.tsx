import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const TaskDescription = ({
  description,
  taskId,
}: {
  description: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  const updateDescription = () => {
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to update description",
          );
        },
      },
    );
  };

  const cancel = () => {
    setNewDescription(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          className="w-full min-h-[100px] resize-none"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={cancel} className="gap-1">
            <X className="size-3.5" /> Cancel
          </Button>
          <Button
            size="sm"
            onClick={updateDescription}
            disabled={isPending}
            className="gap-1"
          >
            <Check className="size-3.5" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {description || (
          <span className="text-muted-foreground italic">
            Click to add a description...
          </span>
        )}
      </p>
      {/* <button className="absolute top-0 right-0 size-6 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
        <Pencil className="size-3" />
      </button> */}
    </div>
  );
};
