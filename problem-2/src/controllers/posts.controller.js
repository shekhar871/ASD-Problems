const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../services/posts.service");

async function create(req, res) {
  const { imageUrl, caption, location } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  const post = await createPost({ imageUrl, caption, location });
  return res.status(201).json(post);
}

async function list(req, res) {
  const result = await listPosts(req.query);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(200).json(result);
}

async function getOne(req, res) {
  const id = parseInt(req.params.id);
  const post = await getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  return res.status(200).json(post);
}

async function update(req, res) {
  const id = parseInt(req.params.id);
  const { caption, location } = req.body;

  try {
    const post = await updatePost(id, { caption, location });
    return res.status(200).json(post);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id);
  try {
    await deletePost(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { create, list, getOne, update, remove };
