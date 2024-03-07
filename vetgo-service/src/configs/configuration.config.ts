export interface RedisConfig {
  host: string;
  port: number;
}

export const database_config = () => ({
  database: {
    uri: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
});
