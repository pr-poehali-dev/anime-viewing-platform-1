import { useState } from 'react';
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

const mockAnime = [
  {
    id: 1,
    title: 'Sword Art Online',
    cover: 'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/5a0fab5f-7ffd-42c0-ae48-f5f2d231fe67.jpg',
    rating: 8.5,
    year: 2024,
    episodes: 24,
    genres: ['Экшен', 'Фэнтези', 'Приключения'],
    description: 'Киригая Кадзуто попадает в виртуальную реальность, где единственный способ выжить — победить всех боссов.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 2,
    title: 'Attack on Titan',
    cover: 'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/a9ee8f94-bcbc-499d-8016-eebee0a657d4.jpg',
    rating: 9.1,
    year: 2024,
    episodes: 12,
    genres: ['Экшен', 'Драма', 'Фантастика'],
    description: 'Человечество оказалось на грани вымирания из-за появления гигантских титанов.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Demon Slayer',
    cover: 'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/9e7dcc3b-0027-456f-8188-8af82d361ff8.jpg',
    rating: 8.7,
    year: 2023,
    episodes: 26,
    genres: ['Экшен', 'Сёнен', 'Драма'],
    description: 'История мальчика, который становится охотником на демонов после трагедии.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 4,
    title: 'Jujutsu Kaisen',
    cover: 'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/5a0fab5f-7ffd-42c0-ae48-f5f2d231fe67.jpg',
    rating: 8.9,
    year: 2024,
    episodes: 24,
    genres: ['Экшен', 'Сверхъестественное', 'Сёнен'],
    description: 'Юджи Итадори вступает в тайный мир магов-заклинателей.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 5,
    title: 'My Hero Academia',
    cover: 'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/a9ee8f94-bcbc-499d-8016-eebee0a657d4.jpg',
    rating: 8.4,
    year: 2024,
    episodes: 25,
    genres: ['Экшен', 'Супергерои', 'Приключения'],
    description: 'В мире, где у большинства людей есть суперспособности, мальчик без них мечтает стать героем.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 6,
    title: 'One Punch Man',
    cover: 'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/9e7dcc3b-0027-456f-8188-8af82d361ff8.jpg',
    rating: 8.8,
    year: 2023,
    episodes: 12,
    genres: ['Экшен', 'Комедия', 'Сёнен'],
    description: 'Сайтама настолько силён, что побеждает любого врага одним ударом.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

const allGenres = ['Все', 'Экшен', 'Фэнтези', 'Драма', 'Комедия', 'Романтика', 'Сёнен'];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Все');
  const [selectedAnime, setSelectedAnime] = useState<typeof mockAnime[0] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const filteredAnime = mockAnime.filter(anime => {
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'Все' || anime.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

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
                <Button variant="ghost" className="text-foreground">
                  <Icon name="Heart" className="mr-2 h-4 w-4" />
                  Избранное
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isAdmin ? "default" : "outline"}
                onClick={() => setShowLogin(true)}
              >
                <Icon name="User" className="mr-2 h-4 w-4" />
                {isAdmin ? 'Админ' : 'Войти'}
              </Button>
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

        {isAdmin && (
          <Card className="mb-8 border-primary/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Админ-панель</h3>
                  <p className="text-muted-foreground">Управление контентом платформы</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
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
          <p className="text-muted-foreground">Найдено аниме: {filteredAnime.length}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredAnime.map((anime) => (
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
                    <Button className="flex-1">
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
              <Input placeholder="Введите логин" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <Input type="password" placeholder="Введите пароль" />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setIsAdmin(true);
                setShowLogin(false);
              }}
            >
              Войти
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Демо: введите любые данные для входа как администратор
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
