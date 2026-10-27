const prisma = require("../db");

// validation helper
function parsePagination(query) {
  let page = query.page !== undefined ? Number(query.page) : 1;
  let limit = query.limit !== undefined ? Number(query.limit) : 10;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return { error: "page and limit must be positive integers" };
  }

  // cap limit at 50
  if (limit > 50) limit = 50;

  return { page, limit };
}

const ALLOWED_SORT_BY = ["createdAt", "username", "fullname"];
const ALLOWED_ORDER = ["asc", "desc"];

async function listUsers(query) {
  const pagination = parsePagination(query);
  if (pagination.error) return { error: pagination.error };

  const { page, limit } = pagination;

  // validate sortBy
  const sortBy = query.sortBy || "createdAt";
  if (!ALLOWED_SORT_BY.includes(sortBy)) {
    return { error: "sortBy must be one of: createdAt, username, fullname" };
  }

  // validate order
  const order = query.order || "desc";
  if (!ALLOWED_ORDER.includes(order)) {
    return { error: "order must be asc or desc" };
  }

  // validate isPrivate filter
  let isPrivateFilter = undefined;
  if (query.isPrivate !== undefined) {
    if (query.isPrivate === "true") isPrivateFilter = true;
    else if (query.isPrivate === "false") isPrivateFilter = false;
    else return { error: "isPrivate must be true or false" };
  }

  // build where clause
  const where = {};
  if (isPrivateFilter !== undefined) where.isPrivate = isPrivateFilter;
  if (query.search) {
    where.OR = [
      { username: { contains: query.search, mode: "insensitive" } },
      { fullname: { contains: query.search, mode: "insensitive" } },
    ];
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

  const totalPages = Math.ceil(total / limit);

  return {
    data: users,
    meta: { page, limit, total, totalPages },
  };
}

async function createUser(data) {
  return prisma.user.create({ data });
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id) {
  await prisma.user.delete({ where: { id } });
}

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };
