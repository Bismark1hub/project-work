import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validation';

export class TaskController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const tasks = await TaskService.getAll(req.userId!);
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await TaskService.create(req.userId!, data);
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = updateTaskStatusSchema.parse(req.body);
      const task = await TaskService.updateStatus(req.userId!, req.params.id, status);
      res.json({ success: true, data: task });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const data = updateTaskSchema.parse(req.body);
      const task = await TaskService.update(req.userId!, req.params.id, data);
      res.json({ success: true, data: task });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await TaskService.delete(req.userId!, req.params.id);
      res.json({ success: true, data: null, message: 'Task deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}