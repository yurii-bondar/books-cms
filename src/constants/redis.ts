const REDIS_PREFIX: { [key: string]: string } = {
  USER_SESSION: 'userSession',
  REFRESH_TOKEN: 'refreshToken',
  REVOKED_ACCESS_TOKEN: 'revokedAccessToken',
};
const REFRESH_TOKEN_EXPIRY: number = 24 * 60 * 60;
const REVOKED_ACCESS_TOKEN_EXPIRY: number = 30 * 60;

export {
  REDIS_PREFIX,
  REFRESH_TOKEN_EXPIRY,
  REVOKED_ACCESS_TOKEN_EXPIRY
};
