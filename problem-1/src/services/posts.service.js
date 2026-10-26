const prisma = require("../db");

async function createPost(data) {
  const post = await prisma.post.create({ data });
  return post;
}

async function listPosts() {
  const posts = await prisma.post.findMany();
  return posts;
}

async function getPostById(id) {
  const post = await prisma.post.findUnique({ where: { id } });
  return post;
}

async function updatePost(id, data) {
  const post = await prisma.post.update({ where: { id }, data });
  return post;
}

async function deletePost(id) {
  await prisma.post.delete({ where: { id } });
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost };
