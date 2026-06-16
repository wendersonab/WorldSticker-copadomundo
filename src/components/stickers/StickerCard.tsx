import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Sticker } from '@/types';
import { RARITY_CONFIG, normalizeRarity } from '@/utils/rarity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StickerCardProps {
  sticker: Sticker;
  onDelete?: (id: string) => void;
  onLikeChange?: (id: string, liked: boolean, count: number) => void;
  showActions?: boolean;
}

const STATUS_CONFIG = {
  'Quero': { label: 'Quero', variant: 'want' as const, emoji: '⭐' },
  'Tenho': { label: 'Tenho', variant: 'have' as const, emoji: '✅' },
  'Repetida': { label: 'Repetida', variant: 'duplicate' as const, emoji: '🔄' },
};

const TEAM_COLORS: Record<string, string> = {
  'Brasil': 'from-green-500 to-green-700',
  'Argentina': 'from-sky-400 to-sky-600',
  'França': 'from-blue-700 to-red-600',
  'Alemanha': 'from-gray-700 to-gray-900',
  'Espanha': 'from-red-500 to-yellow-500',
  'Portugal': 'from-red-700 to-green-700',
  'Inglaterra': 'from-red-600 to-blue-800',
  'Itália': 'from-blue-500 to-blue-700',
};

function getTeamColor(team: string) {
  return TEAM_COLORS[team] ?? 'from-slate-500 to-slate-700';
}

export function StickerCard({ sticker, onDelete, onLikeChange, showActions = true }: StickerCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(sticker.user_liked ?? false);
  const [likesCount, setLikesCount] = useState(sticker.likes_count ?? 0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === sticker.user_id;
  const profile = sticker.profiles;
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile?.username?.[0]?.toUpperCase() ?? '?';

  const statusConfig = STATUS_CONFIG[sticker.status];
  const rarity = normalizeRarity(sticker.rarity);
  const rarityConfig = RARITY_CONFIG[rarity];

  const handleLike = async () => {
    if (!user) { toast.error('Faça login para curtir'); return; }
    if (loadingLike) return;
    setLoadingLike(true);

    try {
      if (liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('sticker_id', sticker.id)
          .eq('user_id', user.id);
        const newCount = likesCount - 1;
        setLiked(false);
        setLikesCount(newCount);
        onLikeChange?.(sticker.id, false, newCount);
      } else {
        await supabase
          .from('post_likes')
          .insert({ sticker_id: sticker.id, user_id: user.id });
        const newCount = likesCount + 1;
        setLiked(true);
        setLikesCount(newCount);
        onLikeChange?.(sticker.id, true, newCount);
      }
    } catch {
      toast.error('Erro ao processar curtida');
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('stickers')
        .delete()
        .eq('id', sticker.id)
        .eq('user_id', user!.id);
      if (error) throw error;
      toast.success('Figurinha excluída!');
      onDelete?.(sticker.id);
    } catch {
      toast.error('Erro ao excluir figurinha');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(sticker.created_at), { addSuffix: true, locale: ptBR });

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-0">
          <Link to={`/profile/${sticker.user_id}`} className="flex items-center gap-2 cursor-pointer group">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold group-hover:text-green-600 transition-colors">
                {profile?.full_name ?? 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">@{profile?.username ?? 'usuario'} · {timeAgo}</p>
            </div>
          </Link>

          {showActions && isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/sticker/edit/${sticker.id}`)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Sticker Image */}
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/sticker/${sticker.id}`)}
        >
          {sticker.image_url ? (
            <div className={`relative mx-4 mt-3 rounded-2xl p-1 ${rarityConfig.frameClass}`}>
              <div className={`relative rounded-xl overflow-hidden aspect-[4/3] ${rarityConfig.glowClass}`}>
                <img
                  src={sticker.image_url}
                  alt={sticker.athlete_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.classList.add('sticker-fallback');
                  }}
                />
                <div className="absolute top-2 left-2">
                  <Badge variant={statusConfig.variant}>{statusConfig.emoji} {statusConfig.label}</Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className={`border shadow-sm backdrop-blur ${rarityConfig.badgeClass}`}>
                    {rarityConfig.emoji} {rarityConfig.shortLabel}
                  </Badge>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white">
                    <p className="font-bold text-lg leading-tight">{sticker.athlete_name}</p>
                    <p className="text-sm opacity-80">{sticker.team} · {sticker.position} · #{sticker.shirt_number}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`relative mx-4 mt-3 rounded-2xl p-1 ${rarityConfig.frameClass}`}>
              <div className={`rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-br ${getTeamColor(sticker.team)} relative flex items-center justify-center ${rarityConfig.glowClass}`}>
                <div className="absolute top-2 left-2">
                  <Badge variant={statusConfig.variant}>{statusConfig.emoji} {statusConfig.label}</Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className={`border shadow-sm backdrop-blur ${rarityConfig.badgeClass}`}>
                    {rarityConfig.emoji} {rarityConfig.shortLabel}
                  </Badge>
                </div>
                <div className="text-center text-white p-4">
                  <Trophy className="w-12 h-12 mx-auto opacity-30 mb-2" />
                  <p className="font-black text-xl">{sticker.athlete_name}</p>
                  <p className="text-sm opacity-80 mt-1">{sticker.team} · #{sticker.shirt_number}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Description */}
          {sticker.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{sticker.description}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="outline" className="text-xs">{sticker.team}</Badge>
            <Badge variant="outline" className="text-xs">{sticker.position}</Badge>
            <Badge variant="outline" className="text-xs">#{sticker.shirt_number}</Badge>
            <Badge variant={statusConfig.variant} className="text-xs">{statusConfig.emoji} {statusConfig.label}</Badge>
            <Badge variant="outline" className={`text-xs border ${rarityConfig.badgeClass}`}>{rarityConfig.emoji} {rarityConfig.shortLabel}</Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={loadingLike}
              className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
                liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''} ${loadingLike ? 'animate-pulse' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => navigate(`/sticker/${sticker.id}`)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{sticker.comments_count ?? 0}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/sticker/${sticker.id}`);
                toast.success('Link copiado!');
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-green-500 transition-colors cursor-pointer ml-auto"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir figurinha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a figurinha de <strong>{sticker.athlete_name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
