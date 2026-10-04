from typing import Any

import redis

from app.core.config import settings


class RedisClient:
    def __init__(self, url: str | None = None) -> None:
        self.client = redis.from_url(url or settings.redis_url, decode_responses=True)

    def ping(self) -> bool:
        try:
            return bool(self.client.ping())
        except redis.RedisError:
            return False

    def set_value(self, key: str, value: Any, expire_seconds: int | None = None) -> None:
        self.client.set(key, value, ex=expire_seconds)

    def get_value(self, key: str) -> str | None:
        return self.client.get(key)


redis_client = RedisClient()


def get_redis_client() -> RedisClient:
    return redis_client
