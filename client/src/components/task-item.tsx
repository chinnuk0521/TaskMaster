import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-green-100 text-green-800", 
  high: "bg-orange-100 text-orange-800",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
};

const statusLabels = {
  todo: "Todo",
  "in-progress": "In Progress", 
  done: "Done",
};

export default function TaskItem({ task }: TaskItemProps) {
  const [isChecked, setIsChecked] = useState(task.status === "done");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) => 
      api.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", task.projectId, "stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
      // Revert checkbox state on error
      setIsChecked(task.status === "done");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", task.projectId, "stats"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleStatusToggle = (checked: boolean) => {
    setIsChecked(checked);
    const newStatus = checked ? "done" : "todo";
    updateTaskMutation.mutate({
      id: task.id,
      updates: { status: newStatus },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const isDone = task.status === "done";

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleStatusToggle}
            disabled={updateTaskMutation.isPending}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className={`text-sm font-medium ${isDone ? "line-through text-gray-500" : "text-gray-900"}`}>
              {task.title}
            </h4>
            <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <Badge className={statusColors[task.status as keyof typeof statusColors]}>
              {statusLabels[task.status as keyof typeof statusLabels]}
            </Badge>
          </div>
          
          {task.description && (
            <p className={`text-sm mb-2 ${isDone ? "line-through text-gray-500" : "text-gray-600"}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center text-xs space-x-4">
            {task.assignedTo && (
              <span className={`flex items-center space-x-1 ${isDone ? "text-gray-400" : "text-gray-500"}`}>
                <User className="w-3 h-3" />
                <span>Assigned to {task.assignedTo}</span>
              </span>
            )}
            {task.dueDate && (
              <span className={`flex items-center space-x-1 ${isDone ? "text-gray-400" : "text-gray-500"}`}>
                <Calendar className="w-3 h-3" />
                <span>
                  {isDone ? "Completed" : "Due"} {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-primary h-8 w-8 p-0"
              disabled
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
              className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
