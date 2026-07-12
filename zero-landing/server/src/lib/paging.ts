/**
 * Shared paging helper for Express route handlers.
 * Extracts `page` and `limit` from query params with safe defaults.
 */

export function parsePaging(
  req: any,
  defaults: { page?: number; limit?: number; defaultLimit?: number; maxLimit?: number } = {}
) {
  const {
    page: defaultPage = 1,
    limit: limitFromAlias = undefined,
    defaultLimit: limitFromDefault = 12,
    maxLimit = 100,
  } = defaults;
  const defaultLimit = limitFromAlias ?? limitFromDefault;

  const page = Math.max(1, Number(req.query.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}
