import express from "express";
import sectionController from "../controllers/sections.js";
import authGuard from "../guards/auth-guard.js";
import { roleGuard } from "../guards/role-guard.js";

const router = express.Router();

router
  .post("/sections", authGuard, roleGuard("teacher", "admin"), sectionController.createSection)
  .get("/sections/course/:courseId", sectionController.getCourseSections);

export default router;
