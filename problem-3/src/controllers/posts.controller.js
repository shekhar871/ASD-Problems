const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostLikes,
} = require("../services/posts.service");
const { getUserById } = require("../services/users.service");

async function create(req, res) {
  const { imageUrl, authorId, caption, location } = req.body;

  if (!imageUrl || !authorId) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  // check author exists
  const author = await getUserById(parseInt(authorId));
  if (!author) return res.status(404).json({ error: "User not found" });

  const post = await createPost({ imageUrl, caption, location, authorId: parseInt(authorId) });
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
  // authorId and imageUrl are not editable
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

async function getPostLikesHandler(req, res) {
  const id = parseInt(req.params.id);
  const post = await getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const users = await getPostLikes(id);
  return res.status(200).json(users);
}

module.exports = { create, list, getOne, update, remove, getPostLikesHandler };
