const prisma = require("../db");
const { parsePagination } = require("../utils/pagination");

const ALLOWED_SORT_BY = ["createdAt", "username", "fullname"];
const ALLOWED_ORDER = ["asc", "desc"];

async function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers(query) {
  const pagination = parsePagination(query);
  if (pagination.error) return { error: pagination.error };
  const { page, limit } = pagination;

  const sortBy = query.sortBy || "createdAt";
  if (!ALLOWED_SORT_BY.includes(sortBy)) {
    return { error: "sortBy must be one of: createdAt, username, fullname" };
  }

  const order = query.order || "desc";
  if (!ALLOWED_ORDER.includes(order)) {
    return { error: "order must be asc or desc" };
  }

  let isPrivateFilter = undefined;
  if (query.isPrivate !== undefined) {
    if (query.isPrivate === "true") isPrivateFilter = true;
    else if (query.isPrivate === "false") isPrivateFilter = false;
    else return { error: "isPrivate must be true or false" };
  }

  let hasPostsFilter = undefined;
  if (query.hasPosts !== undefined) {
    if (query.hasPosts === "true") hasPostsFilter = true;
    else if (query.hasPosts === "false") hasPostsFilter = false;
    else return { error: "hasPosts must be true or false" };
  }

  const where = {};
  if (isPrivateFilter !== undefined) where.isPrivate = isPrivateFilter;
  if (query.search) {
    where.OR = [
      { username: { contains: query.search, mode: "insensitive" } },
      { fullname: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (hasPostsFilter === true) {
    where.posts = { some: {} };
  } else if (hasPostsFilter === false) {
    where.posts = { none: {} };
  }

  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { posts: true, likes: true } },
    },
  });
}

async function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id) {
  await prisma.user.delete({ where: { id } });
}

async function getUserPosts(userId, query) {
  const pagination = parsePagination(query);
  if (pagination.error) return { error: pagination.error };
  const { page, limit } = pagination;

  const skip = (page - 1) * limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { _count: { select: { likes: true } } },
    }),
    prisma.post.count({ where: { authorId: userId } }),
  ]);

  return {
    data: posts,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getUserLikedPosts(userId, query) {
  const pagination = parsePagination(query);
  if (pagination.error) return { error: pagination.error };
  const { page, limit } = pagination;

  const skip = (page - 1) * limit;

  const where = { likes: { some: { userId } } };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, username: true, fullname: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
};
