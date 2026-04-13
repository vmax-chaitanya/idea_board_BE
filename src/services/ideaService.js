const { Prisma } = require("@prisma/client");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { generateIdeaSuggestion } = require("./aiService");
const ideaRepository = require("../repositories/ideaRepository");

const normalizeTags = (tags = []) =>
  [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];

const formatIdea = (idea) => ({
  id: idea.id,
  title: idea.title,
  description: idea.description,
  ai_response: idea.aiResponse,
  created_at: idea.createdAt,
  tags: idea.tags.map((ideaTag) => ({ id: ideaTag.tag.id, name: ideaTag.tag.name })),
  like_count: idea._count.likes,
});

const createIdea = async ({ title, description, tags }) => {
  const normalizedTags = normalizeTags(tags);
  const aiResponse = await generateIdeaSuggestion(`${title}. ${description}`);

  const idea = await ideaRepository.createIdea({
    title,
    description,
    aiResponse,
    tags: normalizedTags,
  });

  logger.info({ ideaId: idea.id }, "Idea created");
  return formatIdea(idea);
};

const getAllIdeas = async (tagFilter, { page, limit }) => {
  const tagNames = tagFilter
    ? tagFilter
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const skip = (page - 1) * limit;
  const [total, ideas] = await Promise.all([
    ideaRepository.countIdeas(tagNames),
    ideaRepository.findIdeas(tagNames, { skip, take: limit }),
  ]);

  const total_pages = Math.ceil(total / limit) || 1;

  return {
    ideas: ideas.map(formatIdea),
    pagination: {
      page,
      limit,
      total,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    },
  };
};

const likeIdea = async (ideaId, userAgent) => {
  const idea = await ideaRepository.getIdeaById(ideaId);
  if (!idea) {
    throw new AppError("Idea not found", 404, "Not Found");
  }

  try {
    await ideaRepository.createLike(ideaId, userAgent);
    logger.info({ ideaId, userAgent }, "Idea liked");
    return { idea_id: ideaId, liked: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("You have already liked this idea", 409, "Conflict");
    }
    throw error;
  }
};

module.exports = {
  createIdea,
  getAllIdeas,
  likeIdea,
};
