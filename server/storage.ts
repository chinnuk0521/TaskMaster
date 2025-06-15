import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { projects, tasks, type Project, type Task, type InsertProject, type InsertTask, type TaskWithProject } from "@shared/schema";

// Configure postgres connection with better error handling and timeouts
const sql = postgres(process.env.DATABASE_URL!, { 
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: {
    undefined: null
  }
});
const db = drizzle(sql);

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksWithProject(): Promise<TaskWithProject[]>;
}

export class DrizzleStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects).orderBy(projects.createdAt);
    } catch (error) {
      console.error('Database error in getProjects:', error);
      throw error;
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, id));
      return result[0];
    } catch (error) {
      console.error('Database error in getProject:', error);
      throw error;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      const result = await db.insert(projects).values(insertProject).returning();
      return result[0];
    } catch (error) {
      console.error('Database error in createProject:', error);
      throw error;
    }
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const result = await db
        .update(projects)
        .set(updates)
        .where(eq(projects.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database error in updateProject:', error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id));
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteProject:', error);
      throw error;
    }
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      return await db.select().from(tasks).orderBy(tasks.createdAt);
    } catch (error) {
      console.error('Database error in getTasks:', error);
      throw error;
    }
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    try {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(tasks.createdAt);
    } catch (error) {
      console.error('Database error in getTasksByProject:', error);
      throw error;
    }
  }

  async getTask(id: number): Promise<Task | undefined> {
    try {
      const result = await db.select().from(tasks).where(eq(tasks.id, id));
      return result[0];
    } catch (error) {
      console.error('Database error in getTask:', error);
      throw error;
    }
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    try {
      const result = await db.insert(tasks).values(insertTask).returning();
      return result[0];
    } catch (error) {
      console.error('Database error in createTask:', error);
      throw error;
    }
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    try {
      const result = await db
        .update(tasks)
        .set(updates)
        .where(eq(tasks.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database error in updateTask:', error);
      throw error;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const result = await db.delete(tasks).where(eq(tasks.id, id));
      return result.length > 0;
    } catch (error) {
      console.error('Database error in deleteTask:', error);
      throw error;
    }
  }

  async getTasksWithProject(): Promise<TaskWithProject[]> {
    try {
      const result = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          assignedTo: tasks.assignedTo,
          dueDate: tasks.dueDate,
          projectId: tasks.projectId,
          createdAt: tasks.createdAt,
          project: projects,
        })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .orderBy(tasks.createdAt);
      
      return result;
    } catch (error) {
      console.error('Database error in getTasksWithProject:', error);
      throw error;
    }
  }
}

export const storage = new DrizzleStorage();
