import categoryService from '../services/category.service.js';
import { Request, Response } from 'express';
import { validateCategory } from '../validations/category.validation.js';

const getCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  categories.map((category) => {
    category.imageUrl = `${req.protocol}://${req.get('host')}${category.imageUrl}`;
  });
  res.json(categories).status(200);
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const error = validateCategory(req.body);
    if (error) {
      return res.status(400).json({ message: 'Category is not valid' + error });
    }
    const newCategory = await categoryService.createCategory(req.body);
    if (!newCategory)
      return res.json({ message: 'Something went wrong' }).status(500);
    res.json(newCategory).status(200);
  } catch (error) {
    console.log(error);
    res.json({ message: 'Something went wrong' }).status(500);
  }
};

export default { getCategories, createCategory };
