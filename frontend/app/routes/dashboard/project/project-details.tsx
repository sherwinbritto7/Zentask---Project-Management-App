import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export function meta() {
  return [
    { title: "Project Details | ZenTask" },
    { name: "description", content: "View and manage project tasks" },
  ];
}

const statusDot: Record<string, string> = {
  "To Do": "bg-muted-foreground",
  "In Progress": "bg-amber-500",
  Done: "bg-emerald-500",
};

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: { tasks: Task[]; project: Project };
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);

  const handleTaskClick = (taskId: string) => {
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
    );
  };

  const todoCnt = tasks.filter((t) => t.status === "To Do").length;
  const inProgCnt = tasks.filter((t) => t.status === "In Progress").length;
  const doneCnt = tasks.filter((t) => t.status === "Done").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3 mt-4">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
            <Badge variant="outline" className="shrink-0">
              {tasks.length} tasks
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-[180px]">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {projectProgress}%
            </span>
            <Progress value={projectProgress} className="h-1.5 flex-1" />
          </div>
          <Button onClick={() => setIsCreateTask(true)} className="gap-2">
            <PlusCircle className="size-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {(["To Do", "In Progress", "Done"] as const).map((s) => {
          const cnt = tasks.filter((t) => t.status === s).length;
          return (
            <div
              key={s}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className={`size-2 rounded-full ${statusDot[s]}`} />
              <span className="font-medium text-foreground">{cnt}</span>
              <span>{s}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {(["To Do", "In Progress", "Done"] as TaskStatus[]).map(
              (status) => (
                <TaskColumn
                  key={status}
                  title={status}
                  tasks={tasks.filter((t) => t.status === status)}
                  onTaskClick={handleTaskClick}
                />
              ),
            )}
          </div>
        </TabsContent>

        {(
          [
            { value: "todo", status: "To Do" },
            { value: "in-progress", status: "In Progress" },
            { value: "done", status: "Done" },
          ] as { value: string; status: TaskStatus }[]
        ).map(({ value, status }) => (
          <TabsContent key={value} value={value} className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => handleTaskClick(task._id)}
                  />
                ))}
              {tasks.filter((t) => t.status === status).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-8 text-center">
                  No tasks here yet
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={(project as any).workspace?.members || []}
      />
    </div>
  );
};

export default ProjectDetails;

/* ─── Task Column ──────────────────────────────────────────────────────────── */

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const TaskColumn = ({ title, tasks, onTaskClick }: TaskColumnProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${statusDot[title] ?? "bg-muted-foreground"}`}
          />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {tasks.length}
        </Badge>
      </div>

      {/* Cards */}
      {tasks.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-lg py-10 text-center text-sm text-muted-foreground">
          No tasks
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task._id)}
          />
        ))
      )}
    </div>
  );
};

/* ─── Task Card ──────────────────────────────────────────────────────────── */

const priorityStyles: Record<string, string> = {
  High: "bg-red-500/10 text-red-600 border-red-200",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-200",
  Low: "bg-slate-500/10 text-slate-600 border-slate-200",
};

const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusUpdate = (status: TaskStatus) => {
    mutate(
      { taskId: task._id, status },
      {
        onSuccess: () => {
          toast.success(`Task moved to ${status}`);
        },
        onError: () => {
          toast.error("Failed to update status");
        },
      },
    );
  };

  const completedSubs = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubs = task.subtasks?.length ?? 0;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full border border-border/60"
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium border px-2 py-0.5",
              priorityStyles[task.priority],
            )}
          >
            {task.priority}
          </Badge>

          {/* quick status actions */}
          <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
            {task.status !== "To Do" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Mark as To Do"
                onClick={() => handleStatusUpdate("To Do")}
                disabled={isPending}
              >
                <AlertCircle className="size-3.5" />
              </Button>
            )}
            {task.status !== "In Progress" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-amber-500"
                title="Mark as In Progress"
                onClick={() => handleStatusUpdate("In Progress")}
                disabled={isPending}
              >
                <Clock className="size-3.5" />
              </Button>
            )}
            {task.status !== "Done" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-emerald-500"
                title="Mark as Done"
                onClick={() => handleStatusUpdate("Done")}
                disabled={isPending}
              >
                <CheckCircle className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex flex-col gap-3 flex-1">
        <h4 className="font-medium text-sm leading-snug line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* subtasks progress */}
        {totalSubs > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subtasks</span>
              <span>
                {completedSubs}/{totalSubs}
              </span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all"
                style={{
                  width: `${totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 4).map((member) => (
                <Avatar
                  key={member._id}
                  className="size-6 border-2 border-background"
                  title={member.name}
                >
                  <AvatarImage src={member.profilePicture} />
                  <AvatarFallback className="text-[9px]">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 4 && (
                <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                  +{task.assignees.length - 4}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Unassigned
            </span>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
