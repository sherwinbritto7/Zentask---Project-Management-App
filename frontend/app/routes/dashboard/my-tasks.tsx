import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  FilterIcon,
  MoreHorizontal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/my-tasks";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Tasks | ZenTask" },
    { name: "description", content: "View and manage your tasks" },
  ];
}

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc",
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;

    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const filteredTasks =
    myTasks?.length > 0
      ? myTasks
          .filter((task) => {
            if (filter === "all") return true;
            if (filter === "todo") return task.status === "To Do";
            if (filter === "inprogress") return task.status === "In Progress";
            if (filter === "done") return task.status === "Done";
            if (filter === "achieved") return task.isArchived === true;
            if (filter === "high") return task.priority === "High";

            return true;
          })
          .filter(
            (task) =>
              task.title.toLowerCase().includes(search.toLowerCase()) ||
              task.description?.toLowerCase().includes(search.toLowerCase()),
          )
      : [];

  //   sort task
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress",
  );
  const doneTasks = sortedTasks.filter((task) => task.status === "Done");

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3 mt-4">
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <Badge variant="outline" className="hidden md:flex shrink-0">
              {sortedTasks?.length} tasks
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of all tasks assigned to you across your workspace
          </p>
        </div>

        <div className="flex flex-col items-start md:flex-row gap-2 shrink-0">
          <Button
            variant={"outline"}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <FilterIcon className="w-4 h-4" /> Filter
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("achieved")}>
                Achieved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        placeholder="Search tasks ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {sortedTasks?.length} tasks assigned to you
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <Link
                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                            >
                              {task.status}
                            </Badge>

                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {task.priority}
                              </Badge>
                            )}

                            {task.isArchived && (
                              <Badge variant={"outline"}>Archived</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {task.dueDate && (
                          <div>Due: {format(task.dueDate, "PPPP")}</div>
                        )}

                        <div>
                          Project:{" "}
                          <span className="font-medium">
                            {task.project.title}
                          </span>
                        </div>

                        <div>Modified on: {format(task.updatedAt, "PPPP")}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TO DO COLUMN */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    To Do
                  </h3>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-slate-100 text-slate-600 border-none"
                  >
                    {todoTasks?.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-3 min-h-[200px] p-2 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
                {todoTasks?.map((task) => (
                  <TaskBoardCard key={task._id} task={task} />
                ))}

                {todoTasks?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <Circle className="size-8 mb-2" />
                    <p className="text-xs">No tasks to do</p>
                  </div>
                )}
              </div>
            </div>

            {/* IN PROGRESS COLUMN */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    In Progress
                  </h3>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-600 border-none"
                  >
                    {inProgressTasks?.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-3 min-h-[200px] p-2 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
                {inProgressTasks?.map((task) => (
                  <TaskBoardCard key={task._id} task={task} />
                ))}

                {inProgressTasks?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <Clock className="size-8 mb-2" />
                    <p className="text-xs">No tasks in progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* DONE COLUMN */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    Done
                  </h3>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-600 border-none"
                  >
                    {doneTasks?.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-3 min-h-[200px] p-2 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
                {doneTasks?.map((task) => (
                  <TaskBoardCard key={task._id} task={task} />
                ))}

                {doneTasks?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <CheckCircle2 className="size-8 mb-2" />
                    <p className="text-xs">No completed tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TaskBoardCard = ({ task }: { task: Task }) => {
  return (
    <Card
      className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent group"
      style={{
        borderLeftColor:
          task.priority === "High"
            ? "#ef4444"
            : task.priority === "Medium"
              ? "#f59e0b"
              : "#3b82f6",
      }}
    >
      <Link
        to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
        className="block p-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-2 mt-auto">
            <div className="flex items-center text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <span className="font-medium">{task.project.title}</span>
            </div>

            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-[10px] px-2 py-1 rounded-md",
                  new Date(task.dueDate) < new Date() && task.status !== "Done"
                    ? "bg-red-50 text-red-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Calendar className="size-3" />
                {format(new Date(task.dueDate), "MMM d")}
              </div>
            )}

            <Badge
              className="text-[10px] h-5"
              variant={
                task.priority === "High"
                  ? "destructive"
                  : task.priority === "Medium"
                    ? "default"
                    : "secondary"
              }
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default MyTasks;
