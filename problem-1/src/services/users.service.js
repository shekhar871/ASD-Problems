const prisma = require("../db");

async function createUser(data) {
  const user = await prisma.user.create({ data });
  return user;
}

async function listUsers() {
  const users = await prisma.user.findMany();
  return users;
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

async function updateUser(id, data) {
  const user = await prisma.user.update({ where: { id }, data });
  return user;
}

async function deleteUser(id) {
  await prisma.user.delete({ where: { id } });
}

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };
