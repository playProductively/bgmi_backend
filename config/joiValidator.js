import Joi from "@hapi/joi";

const authScema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

export default authScema;
