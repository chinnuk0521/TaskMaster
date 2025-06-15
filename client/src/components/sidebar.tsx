import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus, User, ListChecks } from "lucide-react";
import type { Project } from "@shared/schema";

interface SidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  onCreateProject: () => void;
  isLoading: boolean;
}

const projectColors: Record<string, string> = {
  "#3B82F6": "bg-blue-500",
  "#10B981": "bg-green-500", 
  "#F59E0B": "bg-yellow-500",
  "#8B5CF6": "bg-purple-500",
  "#EC4899": "bg-pink-500",
};

export default function Sidebar({ projects, selectedProjectId, onCreateProject, isLoading }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">TaskFlow</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "ghost"} 
              className="w-full justify-start"
            >
              <FolderKanban className="w-4 h-4 mr-3" />
              Projects
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start" disabled>
            <ListChecks className="w-4 h-4 mr-3" />
            All Tasks
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Projects List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Projects
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onCreateProject}
              className="text-primary hover:text-blue-600 h-6 w-6 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-gray-500">No projects yet</div>
            ) : (
              projects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <div
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedProjectId === project.id
                        ? "bg-primary text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        projectColors[project.color] || "bg-blue-500"
                      }`}
                    />
                    <span className="text-sm font-medium flex-1 truncate">
                      {project.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      0
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Personal Workspace</p>
            <p className="text-xs text-gray-500">{projects.length} Projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}
