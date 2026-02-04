import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api, Anime, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const allGenres = ['Все', 'Экшен', 'Фэнтези', 'Драма', 'Комедия', 'Романтика', 'Сёнен', 'Приключения', 'Фантастика', 'Сверхъестественное', 'Супергерои'];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Все');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddAnime, setShowAddAnime] = useState(false);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newAnime, setNewAnime] = useState({
    title: '',
    description: '',
    cover: '',
    videoUrl: '',
    rating: 0,
    year: 2024,
    episodes: 1,
    genres: [] as string[]
  });
  
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadAnime();
  }, []);

  useEffect(() => {
    loadAnime();
  }, [searchQuery, selectedGenre]);

  const checkAuth = async () => {
    const result = await api.verifyToken();
    if (result.valid && result.user) {
      setUser(result.user);
    }
  };

  const loadAnime = async () => {
    try {
      setLoading(true);
      const anime = await api.getAnime(searchQuery || undefined, selectedGenre);
      setAnimeList(anime);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аниме',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await api.login(loginForm.username, loginForm.password);
      setUser(result.user);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      toast({
        title: 'Успешно',
        description: `Добро пожаловать, ${result.user.username}!`
      });
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: error instanceof Error ? error.message : 'Неверные данные',
        variant: 'destructive'
      });
    }
  };

  const handleRegister = async () => {
    try {
      const result = await api.register(loginForm.username, loginForm.password);
      setUser(result.user);
      setShowRegister(false);
      setLoginForm({ username: '', password: '' });
      toast({
        title: 'Успешно',
        description: 'Аккаунт создан!'
      });
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error instanceof Error ? error.message : 'Не удалось создать аккаунт',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    toast({
      title: 'Выход',
      description: 'Вы вышли из аккаунта'
    });
  };

  const handleAddAnime = async () => {
    try {
      await api.createAnime(newAnime);
      setShowAddAnime(false);
      setNewAnime({
        title: '',
        description: '',
        cover: '',
        videoUrl: '',
        rating: 0,
        year: 2024,
        episodes: 1,
        genres: []
      });
      loadAnime();
      toast({
        title: 'Успешно',
        description: 'Аниме добавлено!'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить аниме',
        variant: 'destructive'
      });
    }
  };

  const handleAddToFavorites = async (animeId: number) => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы добавить в избранное',
        variant: 'destructive'
      });
      return;
    }

    try {
      await api.addToFavorites(animeId);
      toast({
        title: 'Успешно',
        description: 'Добавлено в избранное'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary">AnimeHub</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-foreground">
                  <Icon name="Home" className="mr-2 h-4 w-4" />
                  Главная
                </Button>
                <Button variant="ghost" className="text-foreground">
                  <Icon name="Film" className="mr-2 h-4 w-4" />
                  Каталог
                </Button>
                {user && (
                  <Button variant="ghost" className="text-foreground">
                    <Icon name="Heart" className="mr-2 h-4 w-4" />
                    Избранное
                  </Button>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {user.username} {user.isAdmin && '(Админ)'}
                  </span>
                  <Button variant="outline" onClick={handleLogout}>
                    <Icon name="LogOut" className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowLogin(true)}>
                    <Icon name="User" className="mr-2 h-4 w-4" />
                    Войти
                  </Button>
                  <Button onClick={() => setShowRegister(true)}>
                    Регистрация
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск аниме..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Жанры</h2>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {user?.isAdmin && (
          <Card className="mb-8 border-primary/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Админ-панель</h3>
                  <p className="text-muted-foreground">Управление контентом платформы</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddAnime(true)}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить аниме
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {searchQuery || selectedGenre !== 'Все' ? 'Результаты' : 'Популярное аниме'}
          </h2>
          <p className="text-muted-foreground">
            {loading ? 'Загрузка...' : `Найдено аниме: ${animeList.length}`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <Card
              key={anime.id}
              className="group cursor-pointer overflow-hidden border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20 animate-fade-in"
              onClick={() => setSelectedAnime(anime)}
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={anime.cover}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                  <Icon name="Star" className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold">{anime.rating}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Icon name="Play" className="mr-2 h-4 w-4" />
                    Смотреть
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{anime.title}</h3>
                <p className="text-xs text-muted-foreground">{anime.year} • {anime.episodes} эп.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={!!selectedAnime} onOpenChange={() => setSelectedAnime(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAnime && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAnime.title}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="watch" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="watch">Смотреть</TabsTrigger>
                  <TabsTrigger value="info">Информация</TabsTrigger>
                </TabsList>
                <TabsContent value="watch" className="space-y-4">
                  <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedAnime.videoUrl}
                      title={selectedAnime.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleAddToFavorites(selectedAnime.id)}>
                      <Icon name="Heart" className="mr-2 h-4 w-4" />
                      В избранное
                    </Button>
                    <Button variant="outline">
                      <Icon name="Share2" className="mr-2 h-4 w-4" />
                      Поделиться
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="info" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Описание</h4>
                      <p className="text-muted-foreground">{selectedAnime.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Жанры</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnime.genres.map((genre) => (
                          <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-1">Рейтинг</h4>
                        <div className="flex items-center gap-1">
                          <Icon name="Star" className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-lg font-bold">{selectedAnime.rating}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Эпизодов</h4>
                        <span className="text-lg">{selectedAnime.episodes}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Год</h4>
                        <span className="text-lg">{selectedAnime.year}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Логин</label>
              <Input
                placeholder="Введите логин"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <Input
                type="password"
                placeholder="Введите пароль"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Войти
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Демо админ: admin / admin123
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Регистрация</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Логин</label>
              <Input
                placeholder="Придумайте логин"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <Input
                type="password"
                placeholder="Придумайте пароль (минимум 6 символов)"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleRegister}>
              Зарегистрироваться
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAnime} onOpenChange={setShowAddAnime}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить аниме</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название</label>
              <Input
                placeholder="Название аниме"
                value={newAnime.title}
                onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Описание</label>
              <Input
                placeholder="Краткое описание"
                value={newAnime.description}
                onChange={(e) => setNewAnime({ ...newAnime, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">URL обложки</label>
              <Input
                placeholder="https://..."
                value={newAnime.cover}
                onChange={(e) => setNewAnime({ ...newAnime, cover: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">URL видео</label>
              <Input
                placeholder="https://www.youtube.com/embed/..."
                value={newAnime.videoUrl}
                onChange={(e) => setNewAnime({ ...newAnime, videoUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Рейтинг</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newAnime.rating}
                  onChange={(e) => setNewAnime({ ...newAnime, rating: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Год</label>
                <Input
                  type="number"
                  value={newAnime.year}
                  onChange={(e) => setNewAnime({ ...newAnime, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Эпизоды</label>
                <Input
                  type="number"
                  value={newAnime.episodes}
                  onChange={(e) => setNewAnime({ ...newAnime, episodes: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Жанры</label>
              <div className="flex flex-wrap gap-2">
                {allGenres.filter(g => g !== 'Все').map((genre) => (
                  <Badge
                    key={genre}
                    variant={newAnime.genres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (newAnime.genres.includes(genre)) {
                        setNewAnime({ ...newAnime, genres: newAnime.genres.filter(g => g !== genre) });
                      } else {
                        setNewAnime({ ...newAnime, genres: [...newAnime.genres, genre] });
                      }
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleAddAnime}>
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
