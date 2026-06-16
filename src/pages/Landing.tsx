import { Link } from 'react-router-dom';
import { Trophy, Star, Users, Heart, MessageCircle, Package, Shield, Zap, ChevronRight } from 'lucide-react';
import logoImg from '@/icone.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import mbappeImg from '@/players/mbappe.jpg';
import messiImg from '@/players/messi.jpg';
import vinjrImg from '@/players/vinjr.jpg';
import { RARITY_CONFIG, normalizeRarity } from '@/utils/rarity';

const EXAMPLE_CARDS = [
  // Follow existing rarity color pattern: Lilás, Bronze, Ouro
  { name: 'Vinicius Jr.', team: 'Brasil', position: 'Atacante', number: 7, status: 'Tenho', color: 'from-violet-300 to-violet-700', image: vinjrImg, rarity: 'Lilás', likes: 37, comments: 12 },
  { name: 'Messi', team: 'Argentina', position: 'Atacante', number: 10, status: 'Quero', color: 'from-amber-300 to-amber-700', image: messiImg, rarity: 'Bronze', likes: 58, comments: 19 },
  { name: 'Mbappé', team: 'França', position: 'Atacante', number: 10, status: 'Repetida', color: 'from-yellow-200 to-yellow-500', image: mbappeImg, rarity: 'Ouro', likes: 44, comments: 15 },
];

const FEATURES = [
  { icon: Package, title: 'Coleção Digital', desc: 'Cadastre suas figurinhas digitais com todos os detalhes do atleta.' },
  { icon: Heart, title: 'Curtidas', desc: 'Curta as figurinhas de outros colecionadores e receba curtidas.' },
  { icon: MessageCircle, title: 'Comentários', desc: 'Comente e interaja com a comunidade de colecionadores.' },
  { icon: Users, title: 'Conexões', desc: 'Siga outros colecionadores e acompanhe suas coleções.' },
  { icon: Zap, title: 'Chat Privado', desc: 'Envie mensagens diretas para negociar figurinhas.' },
  { icon: Shield, title: 'Comunidade Segura', desc: 'Denuncie comentários inadequados e mantenha a comunidade saudável.' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente e configure seu perfil de colecionador.' },
  { step: '2', title: 'Adicione figurinhas', desc: 'Cadastre suas figurinhas digitais com foto, nome do atleta e status.' },
  { step: '3', title: 'Conecte-se', desc: 'Siga outros colecionadores, curta postagens e troque mensagens.' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Tenho': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Quero': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Repetida': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? ''}`}>{status}</span>
  );
}

export function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();

  const authenticated = !authLoading && !!user;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center">
              <img src={logoImg} alt="WorldSticker" className="h-8 w-8 object-contain" />
            </div>
            <span className="font-bold text-xl">
              <span className="text-green-600">World</span>
              <span className="text-yellow-500">Sticker</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="cursor-pointer">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="cursor-pointer">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button className="cursor-pointer">Criar conta</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 opacity-5 dark:opacity-10"
          style={{ backgroundImage: 'radial-gradient(#009739 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800 px-4 py-1.5 text-sm">
            🏆 Copa do Mundo
          </Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className="text-green-600">World</span>
            <span className="text-yellow-500">Sticker</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-4 font-medium">
            A rede social para colecionadores de figurinhas da Copa do Mundo
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
            Cadastre suas figurinhas digitais, conecte-se com outros colecionadores, curta postagens e 
            encontre as figurinhas que você precisa para completar sua coleção.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {authenticated ? (
              <>
                <Button size="lg" className="w-full sm:w-auto cursor-pointer text-base px-8" onClick={() => window.location.assign('/feed')}>
                  <Star className="mr-2 h-5 w-5" />
                  Ir para minha coleção
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto cursor-pointer text-base px-8" onClick={() => window.location.assign('/feed')}>
                  Voltar ao feed
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto cursor-pointer text-base px-8">
                    <Star className="mr-2 h-5 w-5" />
                    Criar minha conta grátis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto cursor-pointer text-base px-8">
                    Já tenho conta
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Example Cards */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Figurinhas Digitais</h2>
          <p className="text-muted-foreground text-center mb-10">Veja como ficam as figurinhas na plataforma</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {EXAMPLE_CARDS.map((card) => {
              const r = normalizeRarity(card.rarity as any);
              return (
                <Card key={card.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-36 bg-gradient-to-br ${card.color} flex items-center justify-center relative`}>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={card.status} />
                    </div>
                    {card.image ? (
                      <div className={`absolute inset-1 ${RARITY_CONFIG[r].frameClass} rounded-xl overflow-hidden ${RARITY_CONFIG[r].glowClass}`}>
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <div className="text-4xl font-black opacity-20 absolute bottom-2 right-3">#{card.number}</div>
                        <Trophy className="w-12 h-12 opacity-40" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">{card.team} · {card.position}</p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {card.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {card.comments}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Funcionalidades</h2>
          <p className="text-muted-foreground text-center mb-10">Tudo que você precisa para gerenciar sua coleção</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Como funciona</h2>
          <p className="text-muted-foreground text-center mb-10">Simples e intuitivo</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 rounded-full sticker-gradient flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-black text-xl">{step.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block rounded-2xl sticker-gradient p-px">
            <div className="rounded-2xl bg-background px-8 sm:px-16 py-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Pronto para colecionar? 🏆
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Junte-se à comunidade WorldSticker e complete sua coleção da Copa do Mundo.
              </p>
              {authenticated ? (
                <Button size="lg" className="cursor-pointer text-base px-10" onClick={() => window.location.assign('/feed')}>
                  Ir para o feed
                </Button>
              ) : (
                <Link to="/register">
                  <Button size="lg" className="cursor-pointer text-base px-10">
                    Começar agora — é grátis
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded sticker-gradient flex items-center justify-center">
              <img src={logoImg} alt="WorldSticker" className="h-6 w-6 object-contain" />
            </div>
            <span className="font-bold text-sm">
              <span className="text-green-600">World</span>
              <span className="text-yellow-500">Sticker</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 WorldSticker · A rede social para colecionadores de figurinhas da Copa do Mundo
          </p>
        </div>
      </footer>
    </div>
  );
}
