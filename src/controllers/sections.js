import sectionService from "../services/sections.js";

class SectionController {
  async createSection(req, res, next) {
    try { const result = await sectionService.createSection(req); return res.status(result.status).json(result); } catch (e) { next(e); }
  }

  async getCourseSections(req, res, next) {
    try { const result = await sectionService.getCourseSections(req.params.courseId); return res.status(result.status).json(result); } catch (e) { next(e); }
  }
}

export default new SectionController();
