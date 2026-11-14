import pool from "../config/db.js";
import { parseId, parseCourse } from "../utils/api-validation.js";
import { checkCourseFiles, storeCourseFiles, removeCourseFiles } from "../utils/course-uploads.js";
import { NotFoundError, ForBiddenError, BadRequestError } from "../utils/error.js";

class CourseService {
  async ownedCourse(id, user) {
    const { rows } = await pool.query("SELECT * FROM courses WHERE id=$1", [parseId(id)]);
    if (!rows.length) throw new NotFoundError(404, "Course not found");
    if (user.role !== "admin" && Number(rows[0].user_id) !== Number(user.id))
      throw new ForBiddenError(403, "You can only modify your own courses");
    return rows[0];
  }
  async createCourse(req) {
    const fields = parseCourse(req.body);
    const files = checkCourseFiles(req.files);
    if (!files.banner || !files.intro_video) throw new BadRequestError(400, "banner and intro_video are required");
    const saved = await storeCourseFiles(files);
    try {
      const { rows } = await pool.query(
        `INSERT INTO courses (banner,intro_video,name,description,level,price,category_id,user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [saved.banner,saved.intro_video,fields.name,fields.description ?? null,fields.level ?? null,fields.price ?? 0,fields.category_id,req.user.id]
      );
      return { status: 201, message: "Course added!", data: rows[0] };
    } catch (e) { await removeCourseFiles(Object.values(saved)); throw e; }
  }
  async getCourses() {
    const { rows } = await pool.query("SELECT * FROM courses ORDER BY id DESC");
    return { status: 200, data: rows };
  }
  async getCourse(id) {
    const { rows } = await pool.query("SELECT * FROM courses WHERE id=$1", [parseId(id)]);
    if (!rows.length) throw new NotFoundError(404, "Course not found");
    return { status: 200, data: rows[0] };
  }
  async updateCourse(req) {
    const old = await this.ownedCourse(req.params.id, req.user);
    const fields = parseCourse(req.body, true);
    const files = checkCourseFiles(req.files);
    if (!Object.keys(fields).length && !Object.keys(files).length)
      throw new BadRequestError(400, "No fields to update");
    const saved = await storeCourseFiles(files);
    try {
      const changes = { ...fields, ...saved };
      const keys = Object.keys(changes);
      const sets = keys.map((key, i) => `"${key}"=$${i + 1}`).join(", ");
      const { rows } = await pool.query(
        `UPDATE courses SET ${sets} WHERE id=$${keys.length + 1} RETURNING *`,
        [...keys.map(key => changes[key]), old.id]
      );
      await removeCourseFiles(Object.keys(saved).map(key => old[key]));
      return { status: 200, message: "Course updated!", data: rows[0] };
    } catch (e) { await removeCourseFiles(Object.values(saved)); throw e; }
  }
  async deleteCourse(req) {
    const old = await this.ownedCourse(req.params.id, req.user);
    await pool.query("DELETE FROM courses WHERE id=$1", [old.id]);
    await removeCourseFiles([old.banner, old.intro_video]);
    return { status: 200, message: "Course deleted!" };
  }
}
export default new CourseService();
