import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Heart, Edit, Trash2, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Sticker } from '@/types';
import { RARITY_CONFIG, normalizeRarity } from '@/utils/rarity';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from '@/components/comments/CommentSection';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_CONFIG = {
  'Quero': { label: 'Quero', variant: 'want' as const, emoji: '⭐' },
  'Tenho': { label: 'Tenho', variant: 'have' as const, emoji: '✅' },
  'Repetida': { label: 'Repetida', variant: 'duplicate' as const, emoji: '🔄' },
};

export function StickerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSticker = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('stickers')
          .select('*, profiles:user_id(id, username, full_name, avatar_url)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setSticker(data as Sticker);

        const [{ count }, { data: userLike }] = await Promise.all([
          supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('sticker_id', id),
          user ? supabase.from('post_likes').select('id').eq('sticker_id', id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        ]);
        setLikesCount(count ?? 0);
        setLiked(!!userLike);
      } catch {
        toast.error('Figurinha não encontrada');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };
    fetchSticker();
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!user) { toast.error('Faça login para curtir'); return; }
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) {
        await supabase.from('post_likes').delete().eq('sticker_id', id!).eq('user_id', user.id);
        setLiked(false);
        setLikesCount(c => c - 1);
      } else {
        await supabase.from('post_likes').insert({ sticker_id: id!, user_id: user.id });
        setLiked(true);
        setLikesCount(c => c + 1);
      }
    } catch {
      toast.error('Erro ao processar curtida');
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDelete = async () => {
    if (!sticker || !user) return;
    setDeleting(true);
    try {
      await supabase.from('stickers').delete().eq('id', sticker.id).eq('user_id', user.id);
      toast.success('Figurinha excluída!');
      navigate('/feed');
    } catch {
      toast.error('Erro ao excluir figurinha');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!sticker) return null;

  const isOwner = user?.id === sticker.user_id;
  const profile = sticker.profiles;
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const statusConfig = STATUS_CONFIG[sticker.status];
  const rarity = normalizeRarity(sticker.rarity);
  const rarityConfig = RARITY_CONFIG[rarity];

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 cursor-pointer">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card className="overflow-hidden">
        {/* Image */}
        {sticker.image_url ? (
          <div className={`relative rounded-t-xl p-1 ${rarityConfig.frameClass}`}>
            <div className={`relative overflow-hidden rounded-t-lg ${rarityConfig.glowClass}`}>
              <img
                src={sticker.image_url}
                alt={sticker.athlete_name}
                className="w-full max-h-96 object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant={statusConfig.variant}>{statusConfig.emoji} {statusConfig.label}</Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className={`border shadow-sm backdrop-blur ${rarityConfig.badgeClass}`}>
                  {rarityConfig.emoji} {rarityConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className={`relative rounded-t-xl p-1 ${rarityConfig.frameClass}`}>
            <div className={`h-64 rounded-t-lg bg-gradient-to-br from-green-600 to-blue-900 flex items-center justify-center relative overflow-hidden ${rarityConfig.glowClass}`}>
              <div className="absolute top-3 left-3">
                <Badge variant={statusConfig.variant}>{statusConfig.emoji} {statusConfig.label}</Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className={`border shadow-sm backdrop-blur ${rarityConfig.badgeClass}`}>
                  {rarityConfig.emoji} {rarityConfig.label}
                </Badge>
              </div>
              <div className="text-white text-center">
                <Trophy className="w-16 h-16 mx-auto opacity-30 mb-2" />
                <p className="font-black text-3xl">{sticker.athlete_name}</p>
              </div>
            </div>
          </div>
        )}

        <CardContent className="p-6 space-y-4">
          {/* Header info */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{sticker.athlete_name}</h1>
              <p className="text-muted-foreground">{sticker.team} · {sticker.position} · Camisa #{sticker.shirt_number}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={statusConfig.variant}>{statusConfig.emoji} {statusConfig.label}</Badge>
                <Badge variant="outline" className={`border ${rarityConfig.badgeClass}`}>
                  {rarityConfig.emoji} {rarityConfig.label} · {rarityConfig.odds}
                </Badge>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigate(`/sticker/edit/${sticker.id}`)} className="cursor-pointer">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteOpen(true)} className="cursor-pointer text-red-500 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {sticker.description && (
            <p className="text-muted-foreground">{sticker.description}</p>
          )}

          {/* Author */}
          <div className="flex items-center justify-between">
            <Link to={`/profile/${sticker.user_id}`} className="flex items-center gap-2 cursor-pointer group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium group-hover:text-green-600 transition-colors">
                  {profile?.full_name ?? 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(sticker.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </Link>

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={loadingLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer ${
                liked
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'border-border hover:border-red-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
          </div>

          <Separator />

          {/* Comments */}
          <CommentSection stickerId={sticker.id} />
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir figurinha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600 cursor-pointer">
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
