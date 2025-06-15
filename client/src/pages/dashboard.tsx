import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@/lib/api";
import Sidebar from "@/components/sidebar";
import ProjectModal from "@/components/project-modal";
import TaskModal from "@/components/task-modal";
import TaskItem from "@/components/task-item";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderPlus, ListChecks, Clock, CheckCircle, Circle } from "lucide-react";
import type { Project, Task } from "@shared/schema";

export default function Dashboard() {
  const [, params] = useRoute("/project/:id");
  const selectedProjectId = params?.id ? parseInt(params.id) : null;
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: api.getProjects,
  });

  const { data: selectedProject } = useQuery<Project>({
    queryKey: ["/api/projects", selectedProjectId],
    queryFn: () => api.getProject(selectedProjectId!),
    enabled: !!selectedProjectId,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", selectedProjectId, statusFilter, priorityFilter, assigneeFilter],
    queryFn: () => api.getTasks({
      projectId: selectedProjectId || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
    }),
  });

  // Get unique assignees for the filter dropdown
  const uniqueAssignees = Array.from(new Set(
    tasks.filter(task => task.assignedTo).map(task => task.assignedTo!)
  )).sort();

  // Filter tasks by assignee on the client side
  const filteredTasks = assigneeFilter === "all" 
    ? tasks 
    : tasks.filter(task => task.assignedTo === assigneeFilter);

  const { data: stats } = useQuery({
    queryKey: ["/api/projects", selectedProjectId, "stats"],
    queryFn: () => selectedProjectId ? api.getProjectStats(selectedProjectId) : null,
    enabled: !!selectedProjectId,
  });

  const currentProject = selectedProject || (projects.length > 0 ? projects[0] : null);
  const currentStats = stats || { total: 0, todo: 0, inProgress: 0, done: 0 };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        projects={projects}
        selectedProjectId={selectedProjectId}
        onCreateProject={() => setShowProjectModal(true)}
        isLoading={projectsLoading}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentProject?.name || "Select a Project"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentProject?.description || "Choose a project to view its tasks"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee!}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => setShowTaskModal(true)}
                disabled={!currentProject}
                className="bg-primary hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentProject ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-semibold text-gray-900">{currentStats.total}</p>
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Todo</p>
                        <p className="text-2xl font-semibold text-gray-700">{currentStats.todo}</p>
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Circle className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">In Progress</p>
                        <p className="text-2xl font-semibold text-warning">{currentStats.inProgress}</p>
                      </div>
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-warning" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Done</p>
                        <p className="text-2xl font-semibold text-success">{currentStats.done}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks List */}
              <Card>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {tasksLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No tasks found. Create your first task to get started.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))
                  )}
                </div>
              </Card>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
                <p className="text-gray-500 mb-4">Create a project to start managing your tasks</p>
                <Button onClick={() => setShowProjectModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProjectModal 
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
      />
      <TaskModal 
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        projectId={currentProject?.id}
      />
    </div>
  );
}
