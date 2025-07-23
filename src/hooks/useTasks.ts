import { useState, useEffect } from 'react';
import { Task } from '../types';

// Key for tracking if initial load has happened
const TASKS_LOADED_KEY = 'easybail_tasks_loaded';
const TASKS_STORAGE_KEY = 'easybail_tasks';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Sample tasks data
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Révision loyer annuelle',
      description: 'Appliquer l\'indice IRL pour la révision du loyer',
      dueDate: new Date('2024-12-15'),
      priority: 'high',
      status: 'pending',
      propertyId: '1',
      propertyName: 'Appartement Bastille',
      category: 'financial',
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-11-15')
    },
    {
      id: '2',
      title: 'Visite Studio Montmartre',
      description: 'Visite avec potentiel locataire',
      dueDate: new Date('2024-12-18'),
      priority: 'medium',
      status: 'pending',
      propertyId: '2',
      propertyName: 'Studio Montmartre',
      category: 'visit',
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20')
    },
    {
      id: '3',
      title: 'Entretien chaudière',
      description: 'Maintenance annuelle de la chaudière',
      dueDate: new Date('2024-12-20'),
      priority: 'low',
      status: 'pending',
      propertyId: '3',
      propertyName: 'Maison Vincennes',
      category: 'maintenance',
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-10')
    },
    {
      id: '4',
      title: 'Renouvellement assurance PNO',
      description: 'Renouveler le contrat d\'assurance propriétaire non occupant',
      dueDate: new Date('2025-01-15'),
      priority: 'high',
      status: 'pending',
      category: 'administrative',
      createdAt: new Date('2024-11-25'),
      updatedAt: new Date('2024-11-25')
    },
    {
      id: '5',
      title: 'Paiement taxe foncière',
      description: 'Payer la taxe foncière pour l\'année en cours',
      dueDate: new Date('2024-11-15'),
      priority: 'high',
      status: 'completed',
      completedAt: new Date('2024-11-14'),
      category: 'financial',
      createdAt: new Date('2024-10-15'),
      updatedAt: new Date('2024-11-14')
    }
  ];

  const loadTasks = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have stored tasks
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      
      if (storedTasks) {
        // Parse stored tasks and convert date strings to Date objects
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
        
        setTasks(parsedTasks);
      } else {
        // Use sample tasks for first load
        setTasks(sampleTasks);
        // Store sample tasks
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(sampleTasks));
      }
      
      setInitialLoadDone(true);
      localStorage.setItem(TASKS_LOADED_KEY, 'true');
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    try {
      const newTask: Task = {
        ...task,
        id: `task_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la tâche');
      console.error('Error adding task:', err);
    }
  };

  const updateTask = (id: string, taskUpdates: Partial<Task>) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              ...taskUpdates,
              updatedAt: new Date() 
            }
          : task
      );
      
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la tâche');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = (id: string) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche');
      console.error('Error deleting task:', err);
    }
  };

  const completeTask = (id: string) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              status: 'completed', 
              completedAt: new Date(),
              updatedAt: new Date() 
            }
          : task
      );
      
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } catch (err) {
      setError('Erreur lors du marquage de la tâche comme terminée');
      console.error('Error completing task:', err);
    }
  };

  useEffect(() => {
    // Check if we've already loaded tasks in this session
    const hasLoaded = localStorage.getItem(TASKS_LOADED_KEY) === 'true';
    
    if (!hasLoaded || !initialLoadDone) {
      loadTasks();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    completeTask
  };
};
