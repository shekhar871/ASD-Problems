const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
} = require("../services/users.service");

async function create(req, res) {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({ error: "username, email and fullname are required" });
  }

  try {
    const user = await createUser({ username, email, fullname, bio });
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  const result = await listUsers(req.query);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(200).json(result);
}

async function getOne(req, res) {
  const id = parseInt(req.params.id);
  const user = await getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json(user);
}

async function update(req, res) {
  const id = parseInt(req.params.id);
  const { fullname, bio, isPrivate } = req.body;

  try {
    const user = await updateUser(id, { fullname, bio, isPrivate });
    return res.status(200).json(user);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  const id = parseInt(req.params.id);
  try {
    await deleteUser(id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getUserPostsHandler(req, res) {
  const id = parseInt(req.params.id);

  // check user exists first
  const user = await getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const result = await getUserPosts(id, req.query);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(200).json(result);
}

async function getUserLikedPostsHandler(req, res) {
  const id = parseInt(req.params.id);

  const user = await getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const result = await getUserLikedPosts(id, req.query);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(200).json(result);
}

module.exports = { create, list, getOne, update, remove, getUserPostsHandler, getUserLikedPostsHandler };
