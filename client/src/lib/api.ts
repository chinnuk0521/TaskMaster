import { apiRequest } from "./queryClient";
import type { Project, Task, InsertProject, InsertTask, TaskWithProject } from "@shared/schema";

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await apiRequest("GET", "/api/projects");
    return res.json();
  },

  getProject: async (id: number): Promise<Project> => {
    const res = await apiRequest("GET", `/api/projects/${id}`);
    return res.json();
  },

  createProject: async (project: InsertProject): Promise<Project> => {
    const res = await apiRequest("POST", "/api/projects", project);
    return res.json();
  },

  updateProject: async (id: number, project: Partial<InsertProject>): Promise<Project> => {
    const res = await apiRequest("PUT", `/api/projects/${id}`, project);
    return res.json();
  },

  deleteProject: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/projects/${id}`);
  },

  // Tasks
  getTasks: async (filters?: { projectId?: number; status?: string; priority?: string; withProject?: boolean }): Promise<Task[] | TaskWithProject[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append("projectId", filters.projectId.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.withProject) params.append("withProject", "true");
    
    const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await apiRequest("GET", url);
    return res.json();
  },

  getTask: async (id: number): Promise<Task> => {
    const res = await apiRequest("GET", `/api/tasks/${id}`);
    return res.json();
  },

  createTask: async (task: InsertTask): Promise<Task> => {
    const res = await apiRequest("POST", "/api/tasks", task);
    return res.json();
  },

  updateTask: async (id: number, task: Partial<InsertTask>): Promise<Task> => {
    const res = await apiRequest("PUT", `/api/tasks/${id}`, task);
    return res.json();
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/tasks/${id}`);
  },

  getProjectStats: async (projectId: number) => {
    const res = await apiRequest("GET", `/api/projects/${projectId}/stats`);
    return res.json();
  },
};
