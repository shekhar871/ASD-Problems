const prisma = require("../db");

async function likePost(postId, userId) {
  try {
    const like = await prisma.like.create({
      data: { postId, userId },
    });
    return { data: like };
  } catch (err) {
    if (err.code === "P2002") {
      return { error: "Already liked", status: 409 };
    }
    if (err.code === "P2003") {
      // foreign key violation - which one?
      return { error: "FK_VIOLATION" };
    }
    throw err;
  }
}

async function unlikePost(postId, userId) {
  try {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return { error: "Like not found", status: 404 };
    }
    throw err;
  }
  return { success: true };
}

module.exports = { likePost, unlikePost };
