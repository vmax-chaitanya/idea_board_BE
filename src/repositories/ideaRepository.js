const { randomUUID } = require("node:crypto");
const supabase = require("../config/supabase");

const ideaSelect = `
  id,
  title,
  description,
  ai_response,
  created_at,
  idea_tags (
    tags (
      id,
      name
    )
  ),
  likes(count)
`;

const likeCountFromRow = (row) => {
  if (!Array.isArray(row.likes) || row.likes.length === 0) return 0;
  const first = row.likes[0];
  if (first && typeof first.count === "number") return first.count;
  return row.likes.length;
};

const toServiceShape = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  aiResponse: row.ai_response,
  createdAt: new Date(row.created_at),
  tags: (row.idea_tags || [])
    .filter((it) => it.tags)
    .map((it) => ({
      tag: { id: it.tags.id, name: it.tags.name },
    })),
  _count: { likes: likeCountFromRow(row) },
});

const fetchIdeaWithRelations = async (ideaId) => {
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaSelect)
    .eq("id", ideaId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toServiceShape(data);
};

/** Ideas that have at least one of the given tag names (same semantics as previous Prisma `some` + `in`). */
const ideaIdsMatchingAnyTag = async (tagNames) => {
  const { data: tagRows, error: tagErr } = await supabase
    .from("tags")
    .select("id")
    .in("name", tagNames);

  if (tagErr) throw tagErr;
  if (!tagRows?.length) return [];

  const tagIds = tagRows.map((t) => t.id);
  const { data: linkRows, error: linkErr } = await supabase
    .from("idea_tags")
    .select("idea_id")
    .in("tag_id", tagIds);

  if (linkErr) throw linkErr;
  if (!linkRows?.length) return [];

  return [...new Set(linkRows.map((r) => r.idea_id))];
};

const ensureTagId = async (name) => {
  const { data: existing, error: selErr } = await supabase
    .from("tags")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing) return existing.id;

  const { data: inserted, error: insErr } = await supabase
    .from("tags")
    .insert({ id: randomUUID(), name })
    .select("id")
    .single();

  if (!insErr) return inserted.id;

  if (insErr.code === "23505") {
    const { data: again, error: againErr } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name)
      .single();
    if (againErr) throw againErr;
    return again.id;
  }

  throw insErr;
};

const createIdea = async ({ title, description, aiResponse, tags }) => {
  const ideaId = randomUUID();
  const { error: ideaErr } = await supabase.from("ideas").insert({
    id: ideaId,
    title,
    description,
    ai_response: aiResponse,
  });

  if (ideaErr) throw ideaErr;

  try {
    for (const name of tags) {
      const tagId = await ensureTagId(name);

      const { error: linkErr } = await supabase.from("idea_tags").insert({
        idea_id: ideaId,
        tag_id: tagId,
      });

      if (linkErr) throw linkErr;
    }
  } catch (e) {
    await supabase.from("ideas").delete().eq("id", ideaId);
    throw e;
  }

  return fetchIdeaWithRelations(ideaId);
};

const findIdeas = async (tagNames = [], { skip = 0, take } = {}) => {
  let query = supabase.from("ideas").select(ideaSelect).order("created_at", {
    ascending: false,
  });

  if (tagNames.length > 0) {
    const ideaIds = await ideaIdsMatchingAnyTag(tagNames);
    if (ideaIds.length === 0) return [];
    query = query.in("id", ideaIds);
  }

  if (take !== undefined) {
    const end = skip + take - 1;
    query = query.range(skip, end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toServiceShape);
};

const countIdeas = async (tagNames = []) => {
  if (tagNames.length === 0) {
    const { count, error } = await supabase
      .from("ideas")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }

  const ideaIds = await ideaIdsMatchingAnyTag(tagNames);
  if (ideaIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true })
    .in("id", ideaIds);

  if (error) throw error;
  return count ?? 0;
};

const createLike = async (ideaId, userAgent) => {
  const { error } = await supabase.from("likes").insert({
    id: randomUUID(),
    idea_id: ideaId,
    user_agent: userAgent,
  });

  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
};

const getIdeaById = async (ideaId) => {
  const { data, error } = await supabase
    .from("ideas")
    .select("id")
    .eq("id", ideaId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

module.exports = {
  createIdea,
  findIdeas,
  countIdeas,
  createLike,
  getIdeaById,
};
