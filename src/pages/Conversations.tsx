import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationItem {
  id: string;
  otherUser?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  lastMessage?: string;
  updated_at: string;
}

export function Conversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: mine, error: mineError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (mineError) throw mineError;

        const ids = mine?.map(item => item.conversation_id) ?? [];
        if (ids.length === 0) {
          setConversations([]);
          return;
        }

        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', ids)
          .order('updated_at', { ascending: false });

        if (conversationsError) throw conversationsError;

        const hydrated = await Promise.all((conversationsData ?? []).map(async (conversation) => {
          const [{ data: participants, error: participantsError }, { data: lastMessages, error: messagesError }] = await Promise.all([
            supabase
              .from('conversation_participants')
              .select('profiles:user_id(id, username, full_name, avatar_url)')
              .eq('conversation_id', conversation.id),
            supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(1),
          ]);

          if (participantsError) throw participantsError;
          if (messagesError) throw messagesError;

          const profiles = (participants ?? []).map((item: any) => item.profiles).flat().filter(Boolean);
          const otherUser = profiles.find((profile: any) => profile.id !== user.id) ?? profiles[0];

          return {
            id: conversation.id,
            otherUser,
            lastMessage: lastMessages?.[0]?.content,
            updated_at: conversation.updated_at,
          } as ConversationItem;
        }));

        setConversations(hydrated);
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <p className="text-sm text-muted-foreground">Converse com outros colecionadores da WorldSticker.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)}
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <h2 className="font-semibold text-lg">Nenhuma conversa ainda</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Abra o perfil de um colecionador e clique no botão de mensagem para iniciar um direct.
              </p>
            </div>
            <Link to="/feed">
              <Button className="cursor-pointer">
                <Search className="h-4 w-4 mr-2" />
                Encontrar colecionadores
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map(conversation => {
            const initials = conversation.otherUser?.full_name
              ? conversation.otherUser.full_name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
              : conversation.otherUser?.username?.[0]?.toUpperCase() ?? '?';

            return (
              <Link key={conversation.id} to={`/chat/${conversation.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={conversation.otherUser?.avatar_url ?? undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{conversation.otherUser?.full_name ?? 'Colecionador'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage ?? 'Conversa criada. Envie a primeira mensagem.'}
                      </p>
                    </div>
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
