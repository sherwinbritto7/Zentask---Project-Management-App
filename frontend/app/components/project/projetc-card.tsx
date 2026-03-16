import type { Project } from "@/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor } from "@/lib";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays, CheckSquare } from "lucide-react";
import { Badge } from "../ui/badge";

interface ProjectCardProps {
  project: Project;
  progress: number;
  workspaceId: string;
}

export const ProjectCard = ({
  project,
  progress,
  workspaceId,
}: ProjectCardProps) => {
  return (
    <Link
      to={`/workspaces/${workspaceId}/projects/${project._id}`}
      className="flex h-full"
    >
      <Card className="flex flex-col h-full w-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug line-clamp-2">
              {project.title}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-xs shrink-0 font-medium capitalize px-2 py-0.5",
                getTaskStatusColor(project.status)
              )}
            >
              {project.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 text-xs leading-relaxed">
            {project.description || "No description provided"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-0 mt-auto">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Footer metadata */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckSquare className="size-3.5" />
              <span>{project.tasks.length} tasks</span>
            </div>

            {project.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <span>{format(new Date(project.dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
