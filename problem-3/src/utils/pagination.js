// shared pagination validation helper used by all controllers
function parsePagination(query) {
  let page = query.page !== undefined ? Number(query.page) : 1;
  let limit = query.limit !== undefined ? Number(query.limit) : 10;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return { error: "page and limit must be positive integers" };
  }

  if (limit > 50) limit = 50;

  return { page, limit };
}

module.exports = { parsePagination };
