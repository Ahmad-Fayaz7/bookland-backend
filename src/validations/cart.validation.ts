import { cartValidationSchema } from '../models/cart.model.js';

const validateCart = (cart: unknown) => {
  const { error } = cartValidationSchema.validate(cart);
  return error;
};

export { validateCart };
