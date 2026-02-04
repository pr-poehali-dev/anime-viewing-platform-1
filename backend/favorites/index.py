import json
import os
import psycopg2
import jwt

def handler(event: dict, context) -> dict:
    """
    API для управления избранным пользователя
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    user = verify_user(event)
    if not user:
        return error_response('Authentication required', 401)
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return error_response('DATABASE_URL not configured', 500)
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        user_id = user['user_id']
        
        if method == 'GET':
            return handle_get_favorites(cur, user_id)
        elif method == 'POST':
            return handle_add_favorite(cur, conn, user_id, event)
        elif method == 'DELETE':
            return handle_remove_favorite(cur, conn, user_id, event)
        
        return error_response('Method not allowed', 405)
        
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

def handle_get_favorites(cur, user_id: int) -> dict:
    """Получение избранного пользователя"""
    cur.execute("""
        SELECT a.id, a.title, a.cover_url, a.rating, a.year, a.episodes
        FROM anime a
        JOIN favorites f ON a.id = f.anime_id
        WHERE f.user_id = %s
        ORDER BY f.created_at DESC
    """, (user_id,))
    
    favorites = []
    for row in cur.fetchall():
        favorites.append({
            'id': row[0],
            'title': row[1],
            'cover': row[2],
            'rating': float(row[3]) if row[3] else 0.0,
            'year': row[4],
            'episodes': row[5]
        })
    
    return success_response({'favorites': favorites})

def handle_add_favorite(cur, conn, user_id: int, event: dict) -> dict:
    """Добавление в избранное"""
    body = json.loads(event.get('body', '{}'))
    anime_id = body.get('animeId')
    
    if not anime_id:
        return error_response('Anime ID is required', 400)
    
    cur.execute("SELECT id FROM anime WHERE id = %s", (anime_id,))
    if not cur.fetchone():
        return error_response('Anime not found', 404)
    
    cur.execute("""
        INSERT INTO favorites (user_id, anime_id)
        VALUES (%s, %s)
        ON CONFLICT (user_id, anime_id) DO NOTHING
    """, (user_id, anime_id))
    
    conn.commit()
    
    return success_response({'message': 'Added to favorites'})

def handle_remove_favorite(cur, conn, user_id: int, event: dict) -> dict:
    """Удаление из избранного"""
    params = event.get('queryStringParameters') or {}
    anime_id = params.get('animeId')
    
    if not anime_id:
        return error_response('Anime ID is required', 400)
    
    cur.execute("UPDATE favorites SET user_id = user_id WHERE user_id = %s AND anime_id = %s", (user_id, anime_id))
    
    conn.commit()
    
    return success_response({'message': 'Removed from favorites'})

def verify_user(event: dict) -> dict:
    """Проверка токена пользователя"""
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization', headers.get('authorization', ''))
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
        return payload
    except:
        return None

def get_jwt_secret() -> str:
    return os.environ.get('JWT_SECRET', 'default-secret-change-in-production')

def success_response(data: dict) -> dict:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data)
    }

def error_response(message: str, status_code: int) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }
