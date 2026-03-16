import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Eye } from "lucide-react";

export const Watchers = ({ watchers }: { watchers: User[] }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight">Watchers</h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          <Eye className="size-3" />
          {watchers?.length || 0}
        </div>
      </div>

      <div className="space-y-3">
        {watchers && watchers.length > 0 ? (
          watchers.map((watcher) => (
            <div key={watcher._id} className="flex items-center gap-3">
              <Avatar className="size-7">
                <AvatarImage src={watcher.profilePicture} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {watcher.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{watcher.name}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Eye className="size-6 mb-1 opacity-20" />
            <p className="text-xs">No watchers yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
