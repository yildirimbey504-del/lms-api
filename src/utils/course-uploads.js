import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { extname, basename, join } from "node:path";
import { BadRequestError } from "./error.js";

const uploadPath = join(process.cwd(), "src", "uploads");
const formats = {
  banner: new Set([".jpg", ".jpeg", ".png", ".webp"]),
  intro_video: new Set([".mp4", ".webm"]),
};

export function checkCourseFiles(files = {}) {
  const found = {};
  for (const [field, allowed] of Object.entries(formats)) {
    const file = files?.[field];
    if (!file) continue;
    if (Array.isArray(file)) throw new BadRequestError(400, `Only one ${field} is allowed`);
    const ext = extname(file.name || "").toLowerCase();
    if (!allowed.has(ext)) throw new BadRequestError(400, `Unsupported ${field} extension`);
    if (field === "banner" && !file.mimetype?.startsWith("image/")) {
      throw new BadRequestError(400, "banner must be an image");
    }
    if (field === "intro_video" && !file.mimetype?.startsWith("video/")) {
      throw new BadRequestError(400, "intro_video must be a video");
    }
    found[field] = { file, ext };
  }
  return found;
}

export async function storeCourseFiles(validatedFiles) {
  const paths = {};
  await mkdir(uploadPath, { recursive: true });
  try {
    for (const [field, { file, ext }] of Object.entries(validatedFiles)) {
      const fileName = `${randomUUID()}${ext}`;
      await file.mv(join(uploadPath, fileName));
      paths[field] = fileName;
    }
    return paths;
  } catch (error) {
    await removeCourseFiles(Object.values(paths));
    throw error;
  }
}

export async function removeCourseFiles(names) {
  for (const name of names) {
    if (typeof name === "string" && basename(name) === name) {
      await rm(join(uploadPath, name), { force: true }).catch(() => {});
    }
  }
}
