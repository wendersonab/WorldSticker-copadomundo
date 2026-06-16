import { useState, useEffect } from 'react';
import { Heart, Flag, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommentRulesModal } from './CommentRulesModal';
import { ReportModal } from './ReportModal';

interface CommentSectionProps {
  stickerId: string;
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(comment.user_liked ?? false);
  const [likesCount, setLikesCount] = useState(comment.likes_count ?? 0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const profile = comment.profiles;
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile?.username?.[0]?.toUpperCase() ?? '?';
  const isOwner = currentUserId === comment.user_id;

  const handleLike = async () => {
    if (!currentUserId) return;
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) {
        await supabase.from('comment_likes').delete()
          .eq('comment_id', comment.id).eq('user_id', currentUserId);
        setLiked(false);
        setLikesCount(c => c - 1);
      } else {
        await supabase.from('comment_likes').insert({ comment_id: comment.id, user_id: currentUserId });
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
    if (!currentUserId) return;
    setDeleting(true);
    try {
      await supabase.from('comments').delete().eq('id', comment.id).eq('user_id', currentUserId);
      onDelete(comment.id);
      toast.success('Comentário excluído');
    } catch {
      toast.error('Erro ao excluir comentário');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 group">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{profile?.full_name ?? 'Usuário'}</span>
              <span className="text-xs text-muted-foreground">@{profile?.username}</span>
            </div>
            <p className="text-sm break-words">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
            </span>
            <button
              onClick={handleLike}
              disabled={loadingLike || !currentUserId}
              className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="text-xs text-muted-foreground hover:text-orange-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        commentId={comment.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}

export function CommentSection({ stickerId }: CommentSectionProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [pendingComment, setPendingComment] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(id, username, full_name, avatar_url)')
        .eq('sticker_id', stickerId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const withLikes = await Promise.all(
        (data ?? []).map(async (c) => {
          const [{ count }, { data: userLike }] = await Promise.all([
            supabase.from('comment_likes').select('*', { count: 'exact', head: true }).eq('comment_id', c.id),
            user ? supabase.from('comment_likes').select('id').eq('comment_id', c.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
          ]);
          return { ...c, likes_count: count ?? 0, user_liked: !!userLike } as Comment;
        })
      );

      setComments(withLikes);
    } catch {
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [stickerId, user]);

  const handleSubmitComment = async () => {
    if (!user) { toast.error('Faça login para comentar'); return; }
    if (!content.trim()) { toast.error('Digite um comentário'); return; }

    // Check if user has seen rules
    if (!profile?.has_seen_comment_rules) {
      setPendingComment(true);
      setRulesOpen(true);
      return;
    }

    await doSubmitComment();
  };

  const doSubmitComment = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          sticker_id: stickerId,
          user_id: user!.id,
          content: content.trim(),
        })
        .select('*, profiles:user_id(id, username, full_name, avatar_url)')
        .single();

      if (error) throw error;
      setComments(prev => [...prev, { ...(data as Comment), likes_count: 0, user_liked: false }]);
      setContent('');
      toast.success('Comentário publicado!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao publicar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRules = async () => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({ has_seen_comment_rules: true })
        .eq('id', user.id);
      await refreshProfile();
    } catch {
      // ignore
    }
    setRulesOpen(false);
    if (pendingComment) {
      setPendingComment(false);
      await doSubmitComment();
    }
  };

  const handleDelete = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Comentários ({comments.length})</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {user && (
        <div className="flex gap-2 pt-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Escreva um comentário..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={submitting || !content.trim()}
                className="cursor-pointer"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Comentar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CommentRulesModal open={rulesOpen} onAccept={handleAcceptRules} />
    </div>
  );
}
