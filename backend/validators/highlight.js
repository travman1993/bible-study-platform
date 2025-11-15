// backend/validators/highlight.js
const Joi = require('joi');

const highlightSchema = Joi.object({
  studyId: Joi.string().required(),
  text: Joi.string().max(500).required(),
  color: Joi.string().valid('yellow', 'green', 'blue', 'red').required(),
  start: Joi.number().min(0),
  end: Joi.number().min(0),
  timestamp: Joi.date()
});

const validateHighlight = (data) => {
  return highlightSchema.validate(data);
};

module.exports = { validateHighlight };