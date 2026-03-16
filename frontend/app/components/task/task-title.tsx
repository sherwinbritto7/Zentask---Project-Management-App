import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Pencil, X } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId,
}: {
  title: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  const updateTitle = () => {
    if (!newTitle.trim() || newTitle === title) {
      setIsEditing(false);
      return;
    }
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update title");
        },
      }
    );
  };

  const cancel = () => {
    setNewTitle(title);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-2 group">
      {isEditing ? (
        <>
          <Input
            className="text-xl font-semibold flex-1"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateTitle();
              if (e.key === "Escape") cancel();
            }}
            disabled={isPending}
            autoFocus
          />
          <Button size="icon" variant="ghost" onClick={updateTitle} disabled={isPending} className="shrink-0 size-8 text-emerald-600">
            <Check className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={cancel} className="shrink-0 size-8 text-destructive">
            <X className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-xl flex-1 font-semibold leading-tight">{title}</h2>
          <button
            className="size-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
