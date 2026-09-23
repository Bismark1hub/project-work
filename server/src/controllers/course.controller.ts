import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CourseService } from '../services/course.service';
import { createCourseSchema, updateCourseSchema } from '../validation';

export class CourseController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const courses = await CourseService.getAll(req.userId!);
      res.json({ success: true, data: courses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const data = createCourseSchema.parse(req.body);
      const course = await CourseService.create(req.userId!, data);
      res.status(201).json({ success: true, data: course });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const data = updateCourseSchema.parse(req.body);
      const course = await CourseService.update(req.userId!, req.params.id, data);
      res.json({ success: true, data: course });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await CourseService.delete(req.userId!, req.params.id);
      res.json({ success: true, data: null, message: 'Course deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}