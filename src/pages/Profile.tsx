import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, UserCheck, UserPlus, Edit, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Profile as ProfileType, Sticker } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StickerCard } from '@/components/stickers/StickerCard';
import { Skeleton } from '@/components/ui/skeleton';

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [{ data: profileData }, { data: stickersData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.from('stickers')
            .select('*, profiles:user_id(id, username, full_name, avatar_url)')
            .eq('user_id', id)
            .order('created_at', { ascending: false }),
        ]);

        if (!profileData) {
          toast.error('Perfil não encontrado');
          navigate(-1);
          return;
        }

        setProfile(profileData as ProfileType);

        // Fetch likes for stickers
        const withLikes = await Promise.all(
          (stickersData ?? []).map(async (s) => {
            const [{ count }, { data: userLike }, { count: commentsCount }] = await Promise.all([
              supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('sticker_id', s.id),
              user ? supabase.from('post_likes').select('id').eq('sticker_id', s.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
              supabase.from('comments').select('*', { count: 'exact', head: true }).eq('sticker_id', s.id),
            ]);
            return { ...s, likes_count: count ?? 0, user_liked: !!userLike, comments_count: commentsCount ?? 0 } as Sticker;
          })
        );
        setStickers(withLikes);

        // Followers/following counts
        const [{ count: fwCount }, { count: fgCount }, { data: followRow }] = await Promise.all([
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
          user && !isOwnProfile
            ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        setFollowersCount(fwCount ?? 0);
        setFollowingCount(fgCount ?? 0);
        setIsFollowing(!!followRow);
      } catch (err) {
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, user, isOwnProfile, navigate]);

  const handleFollow = async () => {
    if (!user || !id || isOwnProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete()
          .eq('follower_id', user.id).eq('following_id', id);
        setIsFollowing(false);
        setFollowersCount(c => c - 1);
        toast.success('Você deixou de seguir');
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: id });
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
        toast.success('Seguindo!');
      }
    } catch {
      toast.error('Erro ao processar ação');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user || !id || isOwnProfile) return;

    try {
      const { data: conversationId, error } = await supabase.rpc(
        'create_or_get_direct_conversation',
        { other_user_id: id }
      );

      if (error) throw error;

      if (!conversationId) {
        throw new Error('A conversa não foi criada.');
      }

      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Erro ao abrir conversa:', error);
      toast.error('Erro ao abrir conversa. Confira se o SQL atualizado foi executado no Supabase.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile.username?.[0]?.toUpperCase() ?? '?';

  const statusCounts = {
    'Tenho': stickers.filter(s => s.status === 'Tenho').length,
    'Quero': stickers.filter(s => s.status === 'Quero').length,
    'Repetida': stickers.filter(s => s.status === 'Repetida').length,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="cursor-pointer">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-green-500">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{profile.full_name ?? 'Usuário'}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.favorite_team && (
                <div className="flex items-center gap-1 mt-1">
                  <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-sm">{profile.favorite_team}</span>
                </div>
              )}
              {profile.bio && <p className="text-sm mt-2 text-muted-foreground">{profile.bio}</p>}
              <p className="text-xs text-muted-foreground mt-2">
                Membro desde {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => navigate('/edit-profile')} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
              ) : user && (
                <>
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="cursor-pointer"
                  >
                    {isFollowing ? (
                      <><UserCheck className="h-4 w-4 mr-1" /> Seguindo</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-1" /> Seguir</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleMessage} className="cursor-pointer">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stickers.length}</p>
              <p className="text-xs text-muted-foreground">Figurinhas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{followersCount}</p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Seguindo</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{statusCounts['Tenho']}</p>
              <p className="text-xs text-muted-foreground">Tenho</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="have">✅ {statusCounts['Tenho']} Tenho</Badge>
            <Badge variant="want">⭐ {statusCounts['Quero']} Quero</Badge>
            <Badge variant="duplicate">🔄 {statusCounts['Repetida']} Repetida</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stickers */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          {isOwnProfile ? 'Minhas figurinhas' : 'Figurinhas'} ({stickers.length})
        </h2>
        {stickers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>Nenhuma figurinha ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stickers.map(s => (
              <StickerCard
                key={s.id}
                sticker={s}
                onDelete={(deleted) => setStickers(prev => prev.filter(st => st.id !== deleted))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
