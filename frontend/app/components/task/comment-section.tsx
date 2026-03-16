import { useState } from "react";
import type { Comment, User } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  useAddCommentMutation,
  useGetCommentsByTaskIdQuery,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Loader } from "../loader";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { SendHorizontal, MessageSquare, CornerDownRight } from "lucide-react";

export const CommentSection = ({
  taskId,
}: {
  taskId: string;
  members: User[];
}) => {
  const [newComment, setNewComment] = useState("");
  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Error");
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm">
        <Loader />
      </div>
    );

  return (
    <div className="bg-card rounded-xl flex flex-col h-[600px] border border-border/40 shadow-sm overflow-hidden group/container">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <h3 className="font-semibold text-sm tracking-tight capitalize">
            Comments
          </h3>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full tracking-wider uppercase">
          {comments?.length || 0} comment{comments?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Message Area */}
      <div className="flex-1 min-h-0 bg-dot-pattern">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-8">
            {comments?.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4 group/comment">
                  <Avatar className="size-9 shrink-0 ring-2 ring-background ring-offset-1 ring-offset-border/20">
                    <AvatarImage src={comment.author.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-sm text-foreground/90 leading-none">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="bg-muted/30 rounded-2xl rounded-tl-none p-4 border border-border/40 group-hover/comment:bg-muted/40 transition-colors duration-300">
                        <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap wrap-break-word">
                          {comment.text}
                        </p>
                      </div>
                      <CornerDownRight className="absolute -left-2 -top-1 size-3 text-border/40" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <MessageSquare className="size-8 text-muted-foreground/20" />
                </div>
                <h4 className="font-medium text-sm text-foreground/70 mb-1">
                  No conversation yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Be the first to share your thoughts on this task.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-muted/20 border-t border-border/40 shrink-0">
        <div className="relative bg-background rounded-xl border border-border/60 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300 shadow-sm">
          <Textarea
            placeholder="Write a comment..."
            className="min-h-[100px] w-full resize-none border-0 focus-visible:ring-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="text-[10px] text-muted-foreground/40 font-medium">
              Press Enter to post, Shift+Enter for new line
            </div>
            <Button
              size="sm"
              disabled={!newComment.trim() || isPending}
              onClick={handleAddComment}
              className="gap-2 px-4 shadow-sm hover:shadow-md active:scale-95 transition-all h-8"
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                Post
              </span>
              <SendHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
