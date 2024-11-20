import mongoose from 'mongoose';

const validateId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export { validateId };
