import type { ActionType } from "@/types";
import {
  Building2,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Eye,
  EyeOff,
  FileEdit,
  FolderEdit,
  FolderPlus,
  History,
  LogIn,
  MessageSquare,
  Upload,
  UserMinus,
  UserPlus,
} from "lucide-react";

export const getActivityIcon = (action: ActionType) => {
  switch (action) {
    case "created_task":
      return <CheckSquare className="size-full text-green-600" />;
    case "created_subtask":
      return <CheckSquare className="size-full text-emerald-600" />;
    case "updated_task":
    case "updated_subtask":
      return <FileEdit className="size-full text-blue-600" />;
    case "completed_task":
      return <CheckCircle className="size-full text-green-600" />;
    case "created_project":
      return <FolderPlus className="size-full text-blue-600" />;
    case "updated_project":
      return <FolderEdit className="size-full text-blue-600" />;
    case "completed_project":
      return <CheckCircle2 className="size-full text-green-600" />;
    case "created_workspace":
      return <Building2 className="size-full text-blue-600" />;
    case "added_comment":
      return <MessageSquare className="size-full text-blue-600" />;
    case "added_member":
    case "joined_workspace":
      return <UserPlus className="size-full text-blue-600" />;
    case "removed_member":
      return <UserMinus className="size-full text-red-600" />;
    case "added_attachment":
      return <Upload className="size-full text-blue-600" />;
    case "archived_task":
    case "archived_project":
      return <EyeOff className="size-full text-amber-600" />;
    case "unarchived_task":
    case "unarchived_project":
      return <Eye className="size-full text-blue-600" />;
    case "deleted_task":
    case "deleted_project":
      return <UserMinus className="size-full text-red-600" />;
    default:
      return <History className="size-full text-muted-foreground" />;
  }
};
