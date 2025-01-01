import { CategoryCreationDTO } from '../dtos/category.dto.js';
import { Category } from '../models/category.model.js';

const getAllCategories = async () => {
  return await Category.find().populate('books');
};

const createCategory = async (category: CategoryCreationDTO) => {
  return await Category.create(category);
};

export default { getAllCategories, createCategory };
