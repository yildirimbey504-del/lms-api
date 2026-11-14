import Joi from "joi";
import { BadRequestError } from "./error.js";

const requiredId = Joi.number().integer().positive().required();
const courseFields = {
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().allow("", null),
  level: Joi.string().trim().max(50).allow("", null),
  price: Joi.number().min(0),
  category_id: requiredId,
};
const sectionFields = {
  course_id: requiredId,
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().allow("", null),
  position: Joi.number().integer().min(1).default(1),
};

function validate(schema, value) {
  const { error, value: cleaned } = schema.validate(value, {
    abortEarly: false,
    convert: true,
    allowUnknown: false,
  });
  if (error) throw new BadRequestError(400, error.details.map(d => d.message).join("; "));
  return cleaned;
}

export function parseId(value, label = "id") {
  return validate(requiredId.label(label), value);
}

export function parseCourse(value, partial = false) {
  const schema = Joi.object({
    ...courseFields,
    name: partial ? courseFields.name : courseFields.name.required(),
    category_id: partial ? requiredId.optional() : requiredId,
  });
  return validate(schema, value ?? {});
}

export function parseSection(value) {
  return validate(Joi.object(sectionFields), value ?? {});
}
