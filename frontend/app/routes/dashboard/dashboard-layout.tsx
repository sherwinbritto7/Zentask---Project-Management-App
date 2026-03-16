import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLoaderData,
  useSearchParams,
  useLocation,
  matchPath,
} from "react-router";

export const clientLoader = async () => {
  try {
    const [workspaces] = await Promise.all([fetchData("/workspaces")]);
    return { workspaces };
  } catch (error) {
    console.log(error);
    return { workspaces: [] };
  }
};
const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const loaderData = useLoaderData() as { workspaces: Workspace[] } | undefined;
  const workspaces = loaderData?.workspaces || [];

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Extract workspaceId from query param ?workspaceId=xyz
  const queryWorkspaceId = searchParams.get("workspaceId");

  // Extract workspaceId from any workspace-scoped URL path pattern
  const pathWorkspaceId = (
    matchPath(
      "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
      location.pathname,
    ) ??
    matchPath(
      "/workspaces/:workspaceId/projects/:projectId",
      location.pathname,
    ) ??
    matchPath("/workspaces/:workspaceId", location.pathname)
  )?.params.workspaceId;

  // The active ID can come from the path, query param, or fallback to null
  const workspaceId = pathWorkspaceId || queryWorkspaceId;

  const defaultWorkspace = workspaces.length > 0 ? workspaces[0] : null;

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    workspaceId
      ? workspaces.find((w) => w._id === workspaceId) || defaultWorkspace
      : defaultWorkspace,
  );

  useEffect(() => {
    // Only set default query param if not on a workspace detail page and no query param exists
    if (!workspaceId && !pathWorkspaceId && defaultWorkspace) {
      setSearchParams({ workspaceId: defaultWorkspace._id }, { replace: true });
    }
  }, [workspaceId, pathWorkspaceId, defaultWorkspace, setSearchParams]);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const ws = workspaces.find((w) => w._id === workspaceId);
      if (ws) setCurrentWorkspace(ws);
    }
  }, [workspaceId, workspaces]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarComponent currentWorkspace={currentWorkspace} />

      <div className="flex flex-1 flex-col h-full">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
        />

        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;
