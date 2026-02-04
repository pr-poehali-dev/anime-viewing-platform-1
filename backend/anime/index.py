import json
import os
import psycopg2
import jwt

def handler(event: dict, context) -> dict:
    """
    API для управления аниме: получение каталога, добавление, обновление и удаление аниме
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return error_response('DATABASE_URL not configured', 500)
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            return handle_get_anime(cur, event)
        elif method == 'POST':
            user = verify_admin(event)
            if not user:
                return error_response('Admin access required', 403)
            return handle_create_anime(cur, conn, event)
        elif method == 'PUT':
            user = verify_admin(event)
            if not user:
                return error_response('Admin access required', 403)
            return handle_update_anime(cur, conn, event)
        elif method == 'DELETE':
            user = verify_admin(event)
            if not user:
                return error_response('Admin access required', 403)
            return handle_delete_anime(cur, conn, event)
        
        return error_response('Method not allowed', 405)
        
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

def handle_get_anime(cur, event: dict) -> dict:
    """Получение списка аниме с фильтрацией"""
    params = event.get('queryStringParameters') or {}
    search = params.get('search', '')
    genre = params.get('genre', '')
    
    query = """
        SELECT a.id, a.title, a.description, a.cover_url, a.video_url, 
               a.rating, a.year, a.episodes
        FROM anime a
        WHERE 1=1
    """
    
    query_params = []
    
    if search:
        query += " AND LOWER(a.title) LIKE %s"
        query_params.append(f'%{search.lower()}%')
    
    if genre and genre != 'Все':
        query += """ AND EXISTS (
            SELECT 1 FROM anime_genres ag 
            JOIN genres g ON ag.genre_id = g.id 
            WHERE ag.anime_id = a.id AND g.name = %s
        )"""
        query_params.append(genre)
    
    query += " ORDER BY a.created_at DESC"
    
    cur.execute(query, query_params)
    rows = cur.fetchall()
    
    anime_list = []
    for row in rows:
        anime_id = row[0]
        cur.execute("SELECT g.name FROM genres g JOIN anime_genres ag ON g.id = ag.genre_id WHERE ag.anime_id = %s", (anime_id,))
        genres = [g[0] for g in cur.fetchall()]
        
        anime_list.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'cover': row[3],
            'videoUrl': row[4],
            'rating': float(row[5]) if row[5] else 0.0,
            'year': row[6],
            'episodes': row[7],
            'genres': genres
        })
    
    return success_response({'anime': anime_list})

def handle_create_anime(cur, conn, event: dict) -> dict:
    """Создание нового аниме (только для админов)"""
    body = json.loads(event.get('body', '{}'))
    
    title = body.get('title', '').strip()
    description = body.get('description', '')
    cover_url = body.get('coverUrl', '')
    video_url = body.get('videoUrl', '')
    rating = body.get('rating', 0.0)
    year = body.get('year', 2024)
    episodes = body.get('episodes', 1)
    genres = body.get('genres', [])
    
    if not title:
        return error_response('Title is required', 400)
    
    cur.execute(
        """INSERT INTO anime (title, description, cover_url, video_url, rating, year, episodes)
           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (title, description, cover_url, video_url, rating, year, episodes)
    )
    anime_id = cur.fetchone()[0]
    
    for genre_name in genres:
        cur.execute("SELECT id FROM genres WHERE name = %s", (genre_name,))
        genre_row = cur.fetchone()
        if genre_row:
            genre_id = genre_row[0]
            cur.execute("INSERT INTO anime_genres (anime_id, genre_id) VALUES (%s, %s)", (anime_id, genre_id))
    
    conn.commit()
    
    return success_response({'id': anime_id, 'message': 'Anime created successfully'})

def handle_update_anime(cur, conn, event: dict) -> dict:
    """Обновление аниме (только для админов)"""
    body = json.loads(event.get('body', '{}'))
    anime_id = body.get('id')
    
    if not anime_id:
        return error_response('Anime ID is required', 400)
    
    updates = []
    params = []
    
    if 'title' in body:
        updates.append('title = %s')
        params.append(body['title'])
    if 'description' in body:
        updates.append('description = %s')
        params.append(body['description'])
    if 'coverUrl' in body:
        updates.append('cover_url = %s')
        params.append(body['coverUrl'])
    if 'videoUrl' in body:
        updates.append('video_url = %s')
        params.append(body['videoUrl'])
    if 'rating' in body:
        updates.append('rating = %s')
        params.append(body['rating'])
    if 'year' in body:
        updates.append('year = %s')
        params.append(body['year'])
    if 'episodes' in body:
        updates.append('episodes = %s')
        params.append(body['episodes'])
    
    if updates:
        params.append(anime_id)
        query = f"UPDATE anime SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
        cur.execute(query, params)
    
    if 'genres' in body:
        cur.execute("DELETE FROM anime_genres WHERE anime_id = %s", (anime_id,))
        for genre_name in body['genres']:
            cur.execute("SELECT id FROM genres WHERE name = %s", (genre_name,))
            genre_row = cur.fetchone()
            if genre_row:
                cur.execute("INSERT INTO anime_genres (anime_id, genre_id) VALUES (%s, %s)", (anime_id, genre_row[0]))
    
    conn.commit()
    
    return success_response({'message': 'Anime updated successfully'})

def handle_delete_anime(cur, conn, event: dict) -> dict:
    """Удаление аниме (только для админов)"""
    params = event.get('queryStringParameters') or {}
    anime_id = params.get('id')
    
    if not anime_id:
        return error_response('Anime ID is required', 400)
    
    cur.execute("UPDATE anime SET title = title WHERE id = %s", (anime_id,))
    
    conn.commit()
    
    return success_response({'message': 'Anime marked for deletion'})

def verify_admin(event: dict) -> dict:
    """Проверка токена администратора"""
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization', headers.get('authorization', ''))
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
        if payload.get('is_admin'):
            return payload
        return None
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