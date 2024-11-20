import { categoryValidationSchema } from '../models/category.model.js';

const validateCategory = (category: unknown) => {
  const { error } = categoryValidationSchema.validate(category);
  return error;
};

export { validateCategory };
