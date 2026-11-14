import service from "../services/courses.js";
class CourseController {
  createCourse = async (req, res, next) => { try { const data = await service.createCourse(req); res.status(data.status).json(data); } catch (e) { next(e); } };
  getCourses = async (req, res, next) => { try { const data = await service.getCourses(); res.status(data.status).json(data); } catch (e) { next(e); } };
  getCourse = async (req, res, next) => { try { const data = await service.getCourse(req.params.id); res.status(data.status).json(data); } catch (e) { next(e); } };
  updateCourse = async (req, res, next) => { try { const data = await service.updateCourse(req); res.status(data.status).json(data); } catch (e) { next(e); } };
  deleteCourse = async (req, res, next) => { try { const data = await service.deleteCourse(req); res.status(data.status).json(data); } catch (e) { next(e); } };
}
export default new CourseController();
