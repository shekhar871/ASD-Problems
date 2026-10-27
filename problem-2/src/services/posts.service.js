const prisma = require("../db");

function parsePagination(query) {
  let page = query.page !== undefined ? Number(query.page) : 1;
  let limit = query.limit !== undefined ? Number(query.limit) : 10;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return { error: "page and limit must be positive integers" };
  }

  if (limit > 50) limit = 50;

  return { page, limit };
}

const ALLOWED_SORT_BY = ["createdAt", "updatedAt"];
const ALLOWED_ORDER = ["asc", "desc"];

async function listPosts(query) {
  const pagination = parsePagination(query);
  if (pagination.error) return { error: pagination.error };

  const { page, limit } = pagination;

  const sortBy = query.sortBy || "createdAt";
  if (!ALLOWED_SORT_BY.includes(sortBy)) {
    return { error: "sortBy must be one of: createdAt, updatedAt" };
  }

  const order = query.order || "desc";
  if (!ALLOWED_ORDER.includes(order)) {
    return { error: "order must be asc or desc" };
  }

  // build where clause
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
      if (isNaN(fromDate.getTime())) {
        return { error: "from and to must be valid dates" };
      }
      where.createdAt.gte = fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      if (isNaN(toDate.getTime())) {
        return { error: "from and to must be valid dates" };
      }
      where.createdAt.lt = toDate;
    }
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: posts,
    meta: { page, limit, total, totalPages },
  };
}

async function createPost(data) {
  return prisma.post.create({ data });
}

async function getPostById(id) {
  return prisma.post.findUnique({ where: { id } });
}

async function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}

async function deletePost(id) {
  await prisma.post.delete({ where: { id } });
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost };
