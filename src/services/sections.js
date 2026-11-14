import pool from "../config/db.js";
import { ForBiddenError, NotFoundError } from "../utils/error.js";
import { parseId, parseSection } from "../utils/api-validation.js";

class SectionService {
  async createSection(req) {
    const { course_id, title, description = null, position = 1 } = parseSection(req.body);
    const { rows: courses } = await pool.query("SELECT id, user_id FROM courses WHERE id=$1", [course_id]);
    if (!courses.length) throw new NotFoundError(404, "Course not found");
    if (req.user.role !== "admin" && Number(courses[0].user_id) !== Number(req.user.id)) {
      throw new ForBiddenError(403, "You can only add sections to your own courses");
    }
    const { rows } = await pool.query(
      `INSERT INTO sections (course_id, title, description, position)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [course_id, title, description, position]
    );
    return { status: 201, message: "Section added!", data: rows[0] };
  }

  async getCourseSections(courseId) {
    const id = parseId(courseId, "courseId");
    const { rows: courses } = await pool.query("SELECT id FROM courses WHERE id=$1", [id]);
    if (!courses.length) throw new NotFoundError(404, "Course not found");
    const { rows } = await pool.query(
      "SELECT * FROM sections WHERE course_id=$1 ORDER BY position ASC, id ASC",
      [id]
    );
    return { status: 200, data: rows };
  }
}

export default new SectionService();
