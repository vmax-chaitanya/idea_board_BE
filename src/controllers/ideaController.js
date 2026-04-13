const ideaService = require("../services/ideaService");
const { sendSuccess } = require("../utils/responseHandler");

const createIdea = async (req, res) => {
  const idea = await ideaService.createIdea(req.validated.body);
  return sendSuccess(res, idea, "Idea created successfully", 201);
};

const getAllIdeas = async (req, res) => {
  const { tag, page, limit } = req.validated.query;
  const payload = await ideaService.getAllIdeas(tag, { page, limit });
  return sendSuccess(res, payload, "Ideas fetched successfully");
};

const likeIdea = async (req, res) => {
  const userAgent = req.get("user-agent") || "unknown";
  const payload = await ideaService.likeIdea(req.validated.params.id, userAgent);
  return sendSuccess(res, payload, "Idea liked successfully", 201);
};

module.exports = {
  createIdea,
  getAllIdeas,
  likeIdea,
};
