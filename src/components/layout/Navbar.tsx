import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, MessageCircle, LogOut, User, Settings, Package, Menu, X } from 'lucide-react';
import iconImg from '@/icone.png';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile?.username?.[0]?.toUpperCase() ?? '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={user ? '/feed' : '/'} className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center">
              {/* Use local site icon */}
              <img src={iconImg} alt="WorldSticker" className="h-10 w-10 object-contain" />
            </div>
            <span className="font-bold text-xl hidden sm:block">
              <span className="text-green-600">World</span>
              <span className="text-yellow-500">Sticker</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/feed">
                <Button variant="ghost" size="sm" className="cursor-pointer">Feed</Button>
              </Link>
              <Link to="/collection">
                <Button variant="ghost" size="sm" className="cursor-pointer">Minha Coleção</Button>
              </Link>
              <Link to="/conversations">
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                {/* Mobile menu toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden cursor-pointer"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.full_name ?? 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">@{profile?.username ?? 'usuario'}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/collection')} className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Minha Coleção
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/conversations')} className="cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Mensagens
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="cursor-pointer">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="cursor-pointer">Criar conta</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileOpen && (
          <div className="md:hidden border-t border-border py-2 pb-4 space-y-1">
            <Link to="/feed" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">Feed</Button>
            </Link>
            <Link to="/collection" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <Package className="mr-2 h-4 w-4" /> Minha Coleção
              </Button>
            </Link>
            <Link to="/conversations" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <MessageCircle className="mr-2 h-4 w-4" /> Mensagens
              </Button>
            </Link>
            <Link to={`/profile/${user.id}`} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Meu Perfil
              </Button>
            </Link>
            <Link to="/settings" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
