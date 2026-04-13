const { z } = require("zod");

const createIdeaSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    tags: z.array(z.string().trim().min(1)).max(10).optional().default([]),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const likeIdeaSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Idea ID must be a valid UUID"),
  }),
  query: z.object({}).optional(),
});

const getIdeasSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    tag: z.string().optional(),
    page: z.coerce.number().int().min(1, "page must be at least 1").optional().default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "limit must be at least 1")
      .max(100, "limit cannot exceed 100")
      .optional()
      .default(10),
  }),
});

module.exports = {
  createIdeaSchema,
  likeIdeaSchema,
  getIdeasSchema,
};
