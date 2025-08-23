from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from .config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# Configurazione rate limiter con fallback per Redis
def create_limiter():
    """Crea un limiter con fallback se Redis non è disponibile"""
    try:
        # Tenta di usare Redis se REDIS_URL è configurato
        if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL and not settings.REDIS_URL.startswith('redis://localhost'):
            try:
                import redis
                redis_client = redis.from_url(settings.REDIS_URL)
                # Test connessione Redis
                redis_client.ping()
                logger.info("Rate limiter: Using Redis backend")
                return Limiter(
                    key_func=get_remote_address, 
                    default_limits=[settings.RATE_LIMIT],
                    storage_uri=settings.REDIS_URL
                )
            except Exception as e:
                logger.warning(f"Redis non disponibile per rate limiting, uso memoria: {e}")
        
        # Fallback: usa memoria in-process
        logger.info("Rate limiter: Using in-memory backend")
        return Limiter(
            key_func=get_remote_address, 
            default_limits=[settings.RATE_LIMIT]
        )
    except Exception as e:
        logger.error(f"Errore creazione rate limiter: {e}")
        # Fallback finale con limiti molto basici
        return Limiter(
            key_func=get_remote_address, 
            default_limits=["1000/hour"]
        )

limiter = create_limiter()

async def rate_limit_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except RateLimitExceeded as e:
        return Response(status_code=429, content="Rate limit exceeded")
