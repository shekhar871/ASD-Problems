const { likePost, unlikePost } = require("../services/likes.service");
const { getPostById } = require("../services/posts.service");
const { getUserById } = require("../services/users.service");

async function like(req, res) {
  const postId = parseInt(req.params.id);
  const { userId } = req.body;

  // 400 check first
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  // post 404 check
  const post = await getPostById(postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  // user 404 check
  const user = await getUserById(parseInt(userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const result = await likePost(postId, parseInt(userId));

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(201).json(result.data);
}

async function unlike(req, res) {
  const postId = parseInt(req.params.postId);
  const userId = parseInt(req.params.userId);

  const result = await unlikePost(postId, userId);

  if (result && result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(204).send();
}

module.exports = { like, unlike };
