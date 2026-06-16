import { Moon, Sun, User, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function Settings() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Ajuste sua experiência na WorldSticker.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
          <CardDescription>Alterne entre tema claro e escuro. A preferência fica salva no navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={toggleTheme} className="cursor-pointer">
            Usar tema {theme === 'dark' ? 'claro' : 'escuro'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Comunidade
          </CardTitle>
          <CardDescription>Informações de segurança e regras de comentários.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            O aviso de regras antes do primeiro comentário está {profile?.has_seen_comment_rules ? 'marcado como lido' : 'pendente'} para seu perfil.
          </p>
          <Separator />
          <p>
            Não são permitidos spam, racismo, ofensas, violações dos direitos humanos, pornografia, incentivo à automutilação, incentivo ao abuso infantil ou conteúdos derivados dessas práticas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dados do projeto
          </CardTitle>
          <CardDescription>Esta aplicação usa Supabase Auth, Database e Storage para persistência real.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
