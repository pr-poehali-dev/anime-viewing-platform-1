import json
import os
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """
    API для аутентификации пользователей: регистрация, вход и проверка токена
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'register':
                return handle_register(cur, conn, body)
            elif action == 'login':
                return handle_login(cur, conn, body)
            elif action == 'verify':
                return handle_verify(body)
            else:
                return error_response('Unknown action', 400)
        
        return error_response('Method not allowed', 405)
        
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

def handle_register(cur, conn, body: dict) -> dict:
    """Регистрация нового пользователя"""
    username = body.get('username', '').strip()
    password = body.get('password', '')
    
    if not username or not password:
        return error_response('Username and password required', 400)
    
    if len(password) < 6:
        return error_response('Password must be at least 6 characters', 400)
    
    cur.execute("SELECT id FROM users WHERE username = %s", (username,))
    if cur.fetchone():
        return error_response('Username already exists', 400)
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    cur.execute(
        "INSERT INTO users (username, password_hash, is_admin) VALUES (%s, %s, %s) RETURNING id, is_admin",
        (username, password_hash, False)
    )
    user_id, is_admin = cur.fetchone()
    conn.commit()
    
    token = create_token(user_id, username, is_admin)
    
    return success_response({
        'token': token,
        'user': {
            'id': user_id,
            'username': username,
            'isAdmin': is_admin
        }
    })

def handle_login(cur, conn, body: dict) -> dict:
    """Вход пользователя"""
    username = body.get('username', '').strip()
    password = body.get('password', '')
    
    if not username or not password:
        return error_response('Username and password required', 400)
    
    cur.execute("SELECT id, password_hash, is_admin FROM users WHERE username = %s", (username,))
    row = cur.fetchone()
    
    if not row:
        return error_response('Invalid credentials', 401)
    
    user_id, password_hash, is_admin = row
    
    if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
        return error_response('Invalid credentials', 401)
    
    token = create_token(user_id, username, is_admin)
    
    return success_response({
        'token': token,
        'user': {
            'id': user_id,
            'username': username,
            'isAdmin': is_admin
        }
    })

def handle_verify(body: dict) -> dict:
    """Проверка токена"""
    token = body.get('token', '')
    
    if not token:
        return error_response('Token required', 400)
    
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
        return success_response({
            'valid': True,
            'user': {
                'id': payload['user_id'],
                'username': payload['username'],
                'isAdmin': payload['is_admin']
            }
        })
    except jwt.ExpiredSignatureError:
        return error_response('Token expired', 401)
    except jwt.InvalidTokenError:
        return error_response('Invalid token', 401)

def create_token(user_id: int, username: str, is_admin: bool) -> str:
    """Создание JWT токена"""
    payload = {
        'user_id': user_id,
        'username': username,
        'is_admin': is_admin,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm='HS256')

def get_jwt_secret() -> str:
    """Получение секретного ключа для JWT"""
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
