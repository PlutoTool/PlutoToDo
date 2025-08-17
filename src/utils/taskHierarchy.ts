import { Task, TaskHierarchy } from '../types';

export const buildTaskHierarchy = (tasks: Task[]): TaskHierarchy[] => {
  const taskMap = new Map<string, Task>();
  const children = new Map<string, Task[]>();
  const rootTasks: Task[] = [];

  // Build maps
  tasks.forEach(task => {
    taskMap.set(task.id, task);
    if (!task.parent_id) {
      rootTasks.push(task);
    } else {
      if (!children.has(task.parent_id)) {
        children.set(task.parent_id, []);
      }
      children.get(task.parent_id)!.push(task);
    }
  });

  // Build hierarchy recursively
  const buildNode = (task: Task, depth: number = 0): TaskHierarchy => {
    const taskChildren = children.get(task.id) || [];
    const hierarchyChildren = taskChildren.map(child => buildNode(child, depth + 1));

    return {
      task: { ...task, depth },
      children: hierarchyChildren,
      depth
    };
  };

  return rootTasks.map(rootTask => buildNode(rootTask));
};

export const flattenHierarchy = (hierarchy: TaskHierarchy[]): Task[] => {
  const flattened: Task[] = [];

  const flatten = (nodes: TaskHierarchy[]) => {
    nodes.forEach(node => {
      flattened.push(node.task);
      if (node.children.length > 0) {
        flatten(node.children);
      }
    });
  };

  flatten(hierarchy);
  return flattened;
};

export const getTaskDepth = (task: Task, allTasks: Task[]): number => {
  if (!task.parent_id) return 0;
  
  const parent = allTasks.find(t => t.id === task.parent_id);
  if (!parent) return 0;
  
  return 1 + getTaskDepth(parent, allTasks);
};

export const getSubtaskCount = (taskId: string, allTasks: Task[]): number => {
  return allTasks.filter(task => task.parent_id === taskId).length;
};

export const getTotalSubtaskCount = (taskId: string, allTasks: Task[]): number => {
  const directSubtasks = allTasks.filter(task => task.parent_id === taskId);
  let total = directSubtasks.length;
  
  directSubtasks.forEach(subtask => {
    total += getTotalSubtaskCount(subtask.id, allTasks);
  });
  
  return total;
};

export const getCompletedSubtaskCount = (taskId: string, allTasks: Task[]): number => {
  const directSubtasks = allTasks.filter(task => task.parent_id === taskId);
  let completed = directSubtasks.filter(task => task.completed).length;
  
  directSubtasks.forEach(subtask => {
    completed += getCompletedSubtaskCount(subtask.id, allTasks);
  });
  
  return completed;
};

export const calculateProgressPercentage = (taskId: string, allTasks: Task[]): number => {
  const total = getTotalSubtaskCount(taskId, allTasks);
  if (total === 0) return 0;
  
  const completed = getCompletedSubtaskCount(taskId, allTasks);
  return Math.round((completed / total) * 100);
};

export const isAncestorOf = (ancestorId: string, descendantId: string, allTasks: Task[]): boolean => {
  const descendant = allTasks.find(t => t.id === descendantId);
  if (!descendant || !descendant.parent_id) return false;
  
  if (descendant.parent_id === ancestorId) return true;
  
  return isAncestorOf(ancestorId, descendant.parent_id, allTasks);
};

export const getAllDescendants = (taskId: string, allTasks: Task[]): Task[] => {
  const descendants: Task[] = [];
  const directChildren = allTasks.filter(task => task.parent_id === taskId);
  
  directChildren.forEach(child => {
    descendants.push(child);
    descendants.push(...getAllDescendants(child.id, allTasks));
  });
  
  return descendants;
};

export const getRootTask = (task: Task, allTasks: Task[]): Task => {
  if (!task.parent_id) return task;
  
  const parent = allTasks.find(t => t.id === task.parent_id);
  if (!parent) return task;
  
  return getRootTask(parent, allTasks);
};
