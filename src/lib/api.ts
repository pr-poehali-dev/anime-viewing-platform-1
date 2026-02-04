const API_URLS = {
  auth: 'https://functions.poehali.dev/8b9baa62-747d-489a-a415-6b5c1e4c8717',
  anime: 'https://functions.poehali.dev/da42ffe0-b5c7-4145-bbc3-da34ef785dbb',
  favorites: 'https://functions.poehali.dev/a19646c5-2bab-4982-92a3-2acc7b1878ff'
};

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface Anime {
  id: number;
  title: string;
  description: string;
  cover: string;
  videoUrl: string;
  rating: number;
  year: number;
  episodes: number;
  genres: string[];
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async register(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action: 'register', username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action: 'login', username, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    const token = this.getToken();
    if (!token) return { valid: false };

    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ action: 'verify', token })
      });

      if (!response.ok) return { valid: false };

      return await response.json();
    } catch {
      return { valid: false };
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  async getAnime(search?: string, genre?: string): Promise<Anime[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre && genre !== 'Все') params.append('genre', genre);

    const response = await fetch(`${API_URLS.anime}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch anime');
    }

    const data = await response.json();
    return data.anime || [];
  }

  async createAnime(anime: Omit<Anime, 'id'>): Promise<{ id: number; message: string }> {
    const response = await fetch(API_URLS.anime, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        title: anime.title,
        description: anime.description,
        coverUrl: anime.cover,
        videoUrl: anime.videoUrl,
        rating: anime.rating,
        year: anime.year,
        episodes: anime.episodes,
        genres: anime.genres
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create anime');
    }

    return await response.json();
  }

  async updateAnime(anime: Anime): Promise<{ message: string }> {
    const response = await fetch(API_URLS.anime, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        id: anime.id,
        title: anime.title,
        description: anime.description,
        coverUrl: anime.cover,
        videoUrl: anime.videoUrl,
        rating: anime.rating,
        year: anime.year,
        episodes: anime.episodes,
        genres: anime.genres
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update anime');
    }

    return await response.json();
  }

  async getFavorites(): Promise<Anime[]> {
    const response = await fetch(API_URLS.favorites, {
      headers: this.getHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    const data = await response.json();
    return data.favorites || [];
  }

  async addToFavorites(animeId: number): Promise<{ message: string }> {
    const response = await fetch(API_URLS.favorites, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ animeId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to favorites');
    }

    return await response.json();
  }

  async removeFromFavorites(animeId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_URLS.favorites}?animeId=${animeId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from favorites');
    }

    return await response.json();
  }
}

export const api = new ApiClient();
