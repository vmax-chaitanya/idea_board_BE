const prisma = require("../config/prisma");

/** Shared filter for tag-based listing (count + paginated find). */
const buildIdeasWhere = (tagNames = []) =>
  tagNames.length > 0
    ? {
        tags: {
          some: {
            tag: {
              name: { in: tagNames },
            },
          },
        },
      }
    : {};

const createIdea = async ({ title, description, aiResponse, tags }) => {
  return prisma.idea.create({
    data: {
      title,
      description,
      aiResponse,
      tags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { likes: true } },
    },
  });
};

const findIdeas = async (tagNames = [], { skip = 0, take } = {}) => {
  const where = buildIdeasWhere(tagNames);
  return prisma.idea.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    ...(take === undefined ? {} : { take }),
  });
};

const countIdeas = async (tagNames = []) => {
  return prisma.idea.count({ where: buildIdeasWhere(tagNames) });
};

const createLike = async (ideaId, userAgent) => {
  return prisma.like.create({
    data: { ideaId, userAgent },
  });
};

const getIdeaById = async (ideaId) => {
  return prisma.idea.findUnique({
    where: { id: ideaId },
  });
};

module.exports = {
  createIdea,
  findIdeas,
  countIdeas,
  createLike,
  getIdeaById,
};
