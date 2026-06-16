import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Frown, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Sticker } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StickerCard } from '@/components/stickers/StickerCard';

export function Feed() {
  const { user } = useAuth();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('stickers')
        .select(`
          *,
          profiles:user_id(id, username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch likes counts and user likes
      const stickersWithMeta = await Promise.all(
        (data ?? []).map(async (s) => {
          const [{ count: likesCount }, { data: userLike }, { count: commentsCount }] = await Promise.all([
            supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('sticker_id', s.id),
            user ? supabase.from('post_likes').select('id').eq('sticker_id', s.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('sticker_id', s.id),
          ]);

          return {
            ...s,
            likes_count: likesCount ?? 0,
            user_liked: !!userLike,
            comments_count: commentsCount ?? 0,
          } as Sticker;
        })
      );

      setStickers(stickersWithMeta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [user]);

  const handleDelete = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-sm text-muted-foreground">Figurinhas da comunidade</p>
        </div>
        <Link to="/sticker/create">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-1" />
            Nova figurinha
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <Frown className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-semibold">Erro ao carregar o feed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={fetchFeed} variant="outline" className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stickers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl sticker-gradient flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <p className="font-semibold text-lg">Nenhuma figurinha ainda!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Seja o primeiro a compartilhar uma figurinha da Copa do Mundo.
            </p>
          </div>
          <Link to="/sticker/create">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira figurinha
            </Button>
          </Link>
        </div>
      )}

      {/* Feed */}
      {!loading && !error && stickers.length > 0 && (
        <div className="space-y-4">
          {stickers.map(sticker => (
            <StickerCard
              key={sticker.id}
              sticker={sticker}
              onDelete={handleDelete}
            />
          ))}
          <div className="flex justify-center py-6">
            <Button variant="ghost" onClick={fetchFeed} className="cursor-pointer text-muted-foreground">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar feed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
