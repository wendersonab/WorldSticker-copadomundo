import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Sticker, StickerStatus, STICKER_STATUSES } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StickerCard } from '@/components/stickers/StickerCard';

const ALL = 'Todas';
type FilterStatus = StickerStatus | typeof ALL;

export function Collection() {
  const { user } = useAuth();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [filter, setFilter] = useState<FilterStatus>(ALL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('stickers')
        .select('*, profiles:user_id(id, username, full_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setStickers((data ?? []) as Sticker[]);
      setLoading(false);
    };
    fetchCollection();
  }, [user]);

  const filtered = useMemo(() => {
    if (filter === ALL) return stickers;
    return stickers.filter(sticker => sticker.status === filter);
  }, [stickers, filter]);

  const counts = {
    Todas: stickers.length,
    Quero: stickers.filter(s => s.status === 'Quero').length,
    Tenho: stickers.filter(s => s.status === 'Tenho').length,
    Repetida: stickers.filter(s => s.status === 'Repetida').length,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Minha Coleção</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas figurinhas por status.</p>
        </div>
        <Link to="/sticker/create">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Nova figurinha
          </Button>
        </Link>
      </div>

      <Tabs value={filter} onValueChange={value => setFilter(value as FilterStatus)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="Todas">Todas ({counts.Todas})</TabsTrigger>
          {STICKER_STATUSES.map(status => (
            <TabsTrigger key={status} value={status}>{status} ({counts[status]})</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-80 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl sticker-gradient flex items-center justify-center mx-auto">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Nenhuma figurinha encontrada</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cadastre uma figurinha ou altere o filtro da coleção.
              </p>
            </div>
            <Link to="/sticker/create">
              <Button className="cursor-pointer">Cadastrar figurinha</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(sticker => (
            <StickerCard
              key={sticker.id}
              sticker={sticker}
              onDelete={(id) => setStickers(prev => prev.filter(item => item.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
