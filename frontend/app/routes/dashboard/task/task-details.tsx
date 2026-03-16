import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAchievedTaskMutation,
  useDeleteTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { AlignLeft, Eye, EyeOff, Trash2, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export function meta() {
  return [
    { title: "Task Details | ZenTask" },
    { name: "description", content: "View and manage task details" },
  ];
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: {
      task: Task;
      project: Project;
    };
    isLoading: boolean;
  };
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } =
    useAchievedTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString(),
  );

  const workspace = (project as any).workspace;
  const isPrivileged =
    workspace?.owner?.toString() === user?._id?.toString() ||
    workspace?.members?.some(
      (m: any) =>
        m.user?._id?.toString() === user?._id?.toString() &&
        ["admin", "owner"].includes(m.role),
    );

  const goBack = () => navigate(-1);

  const members = task?.assignees || [];

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task watched");
        },
        onError: () => {
          toast.error("Failed to watch task");
        },
      },
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => {
          toast.success("Task achieved");
        },
        onError: () => {
          toast.error("Failed to archive task");
        },
      },
    );
  };

  const handleDeleteTask = () => {
    deleteTask(task._id, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        navigate(`/dashboard/workspaces/${workspaceId}/projects/${projectId}`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete task");
      },
    });
  };

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>

          {task.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchTask}
            className="w-fit"
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleAchievedTask}
            className="w-fit"
            disabled={isAchieved}
          >
            {task.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-lg p-6 lg:p-8 shadow-sm border border-border/50 mb-6 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant={
                      task.priority === "High"
                        ? "destructive"
                        : task.priority === "Medium"
                          ? "default"
                          : "outline"
                    }
                    className="capitalize"
                  >
                    {task.priority} Priority
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    Created{" "}
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <TaskTitle title={task.title} taskId={task._id} />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <TaskStatusSelector status={task.status} taskId={task._id} />

                {isPrivileged && (
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant={"destructive"}
                        size="sm"
                        className="hidden md:flex gap-2"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this task? This action
                          is permanent and cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteTask}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Task"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <AlignLeft className="size-4 text-muted-foreground" />
                Description
              </h3>
              <div className="bg-muted/20 p-4 rounded-md border border-border/40">
                <TaskDescription
                  description={task.description || ""}
                  taskId={task._id}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
              <div className="space-y-4">
                <TaskAssigneesSelector
                  task={task}
                  assignees={task.assignees}
                  projectMembers={(project as any).workspace?.members || []}
                />
              </div>
              <div className="space-y-4">
                <TaskPrioritySelector
                  priority={task.priority}
                  taskId={task._id}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/40">
              <SubTasksDetails
                subTasks={task.subtasks || []}
                taskId={task._id}
              />
            </div>
          </div>

          <CommentSection taskId={task._id} members={project.members as any} />
        </div>

        {/* right side */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
          <Watchers watchers={task.watchers || []} />
          <TaskActivity resourceId={task._id} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
