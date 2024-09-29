import Joi, { ObjectSchema } from 'joi';

const loginValidationSchema: ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const validateLogin = (login: unknown) => {
  const { error } = loginValidationSchema.validate(login);
  return error;
};

export { validateLogin };
