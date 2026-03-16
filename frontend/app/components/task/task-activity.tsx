import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";
import { ScrollArea } from "../ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Clock, History, LayoutList } from "lucide-react";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as { data: ActivityLog[]; isPending: boolean };

  if (isPending)
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm">
        <Loader />
      </div>
    );

  return (
    <div className="bg-card rounded-xl flex flex-col h-[500px] border border-border/40 shadow-sm overflow-hidden group/activity">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h3 className="font-semibold text-sm tracking-tight capitalize">
            Activity Log
          </h3>
        </div>
        <LayoutList className="size-3.5 text-muted-foreground opacity-50" />
      </div>

      <div className="flex-1 min-h-0 bg-dot-pattern">
        <ScrollArea className="h-full pr-2">
          <div className="p-6 relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-10 top-8 bottom-8 w-px bg-linear-to-b from-primary/50 via-border/50 to-transparent" />
            
            <div className="space-y-8 relative">
              {data?.length > 0 ? (
                data.map((activity) => (
                  <div key={activity._id} className="flex gap-4 group/item">
                    {/* Icon Container */}
                    <div className="size-9 shrink-0 rounded-full bg-background border border-border/60 flex items-center justify-center text-primary z-10 shadow-sm group-hover/item:border-primary/30 group-hover/item:shadow-md transition-all duration-300">
                      <div className="size-5 opacity-80 group-hover/item:opacity-100 transition-opacity">
                        {getActivityIcon(activity.action)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        <span className="text-sm font-bold text-foreground/90">
                          {activity.user.name}
                        </span>
                        <span className="text-[13px] text-muted-foreground/80 leading-snug">
                          {activity.details?.description}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md border border-border/30">
                          <Clock className="size-2.5" />
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <History className="size-8 text-muted-foreground/20" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground/70 mb-1">No activity yet</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    All updates to this task will appear here in the timeline.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
