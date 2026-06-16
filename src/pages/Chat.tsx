import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!id || !user) return;
    if (!silent) setLoading(true);

    try {
      const { data: participant, error: participantError } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participantError) throw participantError;

      if (!participant) {
        toast.error('Você não participa desta conversa');
        navigate('/conversations');
        return;
      }

      // fetch messages with sender profile joined
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select('*, profiles:sender_id(id, username, full_name, avatar_url)')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // update messages; replace state to avoid duplicates — when silent we still
      // replace but avoid showing loading UI to prevent flicker
      setMessages((data ?? []) as Message[]);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar conversa. Confira se o SQL atualizado foi executado.');
      navigate('/conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
  // initial full load (show loading skeleton)
  fetchMessages();

    // Realtime subscription for new messages on this conversation
    let channel: any = null;
    let pollingInterval: any = null;

    const setupRealtime = async () => {
      if (!id) return;
      try {
        channel = supabase
          .channel(`messages-${id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${id}`,
            },
            (_payload: any) => {
              // When a new message arrives via Realtime, refetch messages so we get
              // the joined profile data (avatar, username, full_name).
              // payload.new by itself doesn't include related profiles.
              try {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          fetchMessages(true);
              } catch (e) {
                console.warn('Failed to refetch messages on realtime event', e);
              }
            }
          );

        await channel.subscribe();
      } catch (err) {
        // If realtime not available, fallback to polling
        console.warn('Realtime subscription failed, falling back to polling', err);
        pollingInterval = setInterval(() => {
          fetchMessages(true);
        }, 3000);
      }
    };

    setupRealtime();

    return () => {
      try {
        if (channel) {
          // v2 API uses removeChannel
          // @ts-ignore
          if (typeof supabase.removeChannel === 'function') {
            // @ts-ignore
            supabase.removeChannel(channel);
          } else if (channel.unsubscribe) {
            channel.unsubscribe();
          }
        }
      } catch (e) {
        // ignore
      }
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!id || !user || !content.trim() || sending) return;
    setSending(true);
    const text = content.trim();
    setContent('');

    try {
  const { data: _data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: id, sender_id: user.id, content: text })
        .select('*, profiles:sender_id(id, username, full_name, avatar_url)')
        .single();

      if (error) throw error;

  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', id);
  // refetch silently to get joined profile data without visual flicker
  await fetchMessages(true);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      setContent(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => navigate('/conversations')} className="cursor-pointer">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para conversas
      </Button>

      <Card className="min-h-[70vh] flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold">Chat privado</h1>
            <p className="text-sm text-muted-foreground">Mensagens salvas no Supabase.</p>
          </div>

          <div className="flex-1 rounded-xl border border-border p-3 overflow-y-auto max-h-[55vh] space-y-3 bg-muted/20">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)}
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                Nenhuma mensagem ainda. Envie a primeira mensagem para iniciar a conversa.
              </div>
            ) : (
              messages.map(message => {
                const isMine = message.sender_id === user?.id;
                const profile = message.profiles;
                const initials = profile?.full_name?.[0]?.toUpperCase() ?? profile?.username?.[0]?.toUpperCase() ?? '?';

                return (
                  <div key={message.id} className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMine ? 'bg-green-600 text-white' : 'bg-background border border-border'}`}>
                      <p className="break-words">{message.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {new Date(message.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={content}
              onChange={event => setContent(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') handleSend();
              }}
            />
            <Button onClick={handleSend} disabled={sending || !content.trim()} className="cursor-pointer">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
