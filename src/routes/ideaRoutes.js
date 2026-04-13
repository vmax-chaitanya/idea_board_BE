const express = require("express");
const ideaController = require("../controllers/ideaController");
const validate = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");
const {
  createIdeaSchema,
  likeIdeaSchema,
  getIdeasSchema,
} = require("../validators/ideaValidator");

const router = express.Router();

/**
 * @swagger
 * /ideas:
 *   post:
 *     summary: Create a new idea with AI suggestion
 *     tags: [Ideas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Idea created
 */
router.post("/", validate(createIdeaSchema), asyncHandler(ideaController.createIdea));

/**
 * @swagger
 * /ideas:
 *   get:
 *     summary: Get ideas (paginated) with tags and like count
 *     tags: [Ideas]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag name(s), comma-separated
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of ideas
 */
router.get("/", validate(getIdeasSchema), asyncHandler(ideaController.getAllIdeas));

/**
 * @swagger
 * /ideas/{id}/like:
 *   post:
 *     summary: Like an idea (prevents duplicate likes per user-agent)
 *     tags: [Ideas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Idea liked
 *       409:
 *         description: Duplicate like prevented
 */
router.post("/:id/like", validate(likeIdeaSchema), asyncHandler(ideaController.likeIdea));

module.exports = router;
