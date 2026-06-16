import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getOrderedWorldCupTeams } from '@/utils/teams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const schema = z.object({
  full_name: z.string().min(2, 'Nome muito curto').max(60),
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30).regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _'),
  bio: z.string().max(200, 'Máximo 200 caracteres').optional(),
  favorite_team: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        bio: profile.bio ?? '',
        favorite_team: profile.favorite_team ?? '',
      });
      if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
    }
  }, [profile, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar deve ter no máximo 2MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    try {
      const ext = avatarFile.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      return data.publicUrl + `?t=${Date.now()}`;
    } catch {
      toast.error('Erro ao fazer upload do avatar');
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      // Check username uniqueness (if changed)
      if (data.username !== profile?.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', data.username)
          .neq('id', user.id)
          .maybeSingle();

        if (existing) {
          toast.error('Nome de usuário já está em uso');
          setLoading(false);
          return;
        }
      }

      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const uploaded = await uploadAvatar();
        if (uploaded) avatarUrl = uploaded;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          username: data.username,
          bio: data.bio || null,
          favorite_team: data.favorite_team || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Perfil atualizado!');
      navigate(`/profile/${user.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-sm text-muted-foreground">Atualize suas informações</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-green-500">
                  <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-full p-1.5 transition-colors">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Foto de perfil</p>
                <p>PNG, JPG até 2MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input id="full_name" placeholder="Seu nome" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input id="username" placeholder="seu_usuario" className="pl-7" {...register('username')} />
              </div>
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea id="bio" placeholder="Conte um pouco sobre você..." rows={3} {...register('bio')} />
              {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Seleção favorita</Label>
              <Select defaultValue={profile?.favorite_team ?? undefined} onValueChange={(v) => setValue('favorite_team', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua seleção favorita" />
                </SelectTrigger>
                <SelectContent>
                  {getOrderedWorldCupTeams().map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="cursor-pointer flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="cursor-pointer flex-1">
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
