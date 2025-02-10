module.exports = {
  type: 'postgres',
  host: process.env.POSTGRES_DB_HOSTNAME,
  port: process.env.POSTGRES_DB_PORT,
  username: process.env.POSTGRES_DB_USERNAME,
  password: process.env.POSTGRES_DB_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  synchronize: false,
  logging: false,
};
