const prisma = require("../db");
const { parsePagination } = require("../utils/pagination");

const ALLOWED_SORT_BY = ["createdAt", "updatedAt", "likes"];
const ALLOWED_ORDER = ["asc", "desc"];

async function createPost(data) {
  return prisma.post.create({
    data,
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } },
    },
  });
}

async function listPosts(query) {
  const pagination = parsePagination(query);
  if (pagination.error) return { error: pagination.error };
  const { page, limit } = pagination;

  const sortBy = query.sortBy || "createdAt";
  if (!ALLOWED_SORT_BY.includes(sortBy)) {
    return { error: "sortBy must be one of: createdAt, updatedAt, likes" };
  }

  const order = query.order || "desc";
  if (!ALLOWED_ORDER.includes(order)) {
    return { error: "order must be asc or desc" };
  }

  const where = {};

  if (query.location) {
    where.location = { equals: query.location, mode: "insensitive" };
  }
  if (query.search) {
    where.caption = { contains: query.search, mode: "insensitive" };
  }
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) {
      const fromDate = new Date(query.from);
      if (isNaN(fromDate.getTime())) return { error: "from and to must be valid dates" };
      where.createdAt.gte = fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      if (isNaN(toDate.getTime())) return { error: "from and to must be valid dates" };
      where.createdAt.lt = toDate;
    }
  }

  // build orderBy - likes sort needs special handling
  let orderBy;
  if (sortBy === "likes") {
    orderBy = [{ likes: { _count: order } }, { createdAt: "desc" }];
  } else {
    orderBy = [{ [sortBy]: order }];
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
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

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } },
    },
  });
}

async function updatePost(id, data) {
  return prisma.post.update({
    where: { id },
    data,
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } },
    },
  });
}

async function deletePost(id) {
  await prisma.post.delete({ where: { id } });
}

async function getPostLikes(postId) {
  const likes = await prisma.user.findMany({
    where: { likes: { some: { postId } } },
    select: { id: true, username: true, fullname: true },
    orderBy: { username: "asc" },
  });
  return likes;
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost, getPostLikes };
