import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { POSITIONS, STICKER_RARITIES, STICKER_STATUSES, Sticker, StickerRarity } from '@/types';
import { getOrderedWorldCupTeams } from '@/utils/teams';
import { RARITY_CONFIG, normalizeRarity } from '@/utils/rarity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormData {
  athlete_name: string;
  team: string;
  position: string;
  shirt_number: string;
  status: 'Quero' | 'Tenho' | 'Repetida';
  rarity: StickerRarity;
  description?: string;
  image_url?: string;
}

const schema = z.object({
  athlete_name: z.string().min(2, 'Nome muito curto').max(80),
  team: z.string().min(1, 'Selecione uma seleção'),
  position: z.string().min(1, 'Selecione uma posição'),
  shirt_number: z.string().min(1, 'Número obrigatório'),
  status: z.enum(['Quero', 'Tenho', 'Repetida']),
  rarity: z.enum(['Ouro', 'Prata', 'Bronze', 'Lilás']),
  description: z.string().max(300).optional(),
  image_url: z.string().optional(),
});

export function EditSticker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [useUrl, setUseUrl] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
  });

  const imageUrl = watch('image_url');

  useEffect(() => {
    const fetchSticker = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('stickers')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data.user_id !== user?.id) {
          toast.error('Você não tem permissão para editar esta figurinha');
          navigate('/feed');
          return;
        }
        setSticker(data as Sticker);
        reset({
          athlete_name: data.athlete_name,
          team: data.team,
          position: data.position,
          shirt_number: String(data.shirt_number),
          status: data.status,
          rarity: normalizeRarity(data.rarity),
          description: data.description ?? '',
          image_url: data.image_url ?? '',
        });
        if (data.image_url) setImagePreview(data.image_url);
      } catch (err) {
        toast.error('Erro ao carregar figurinha');
        navigate('/collection');
      } finally {
        setFetching(false);
      }
    };
    fetchSticker();
  }, [id, user, navigate, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setValue('image_url', '');
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('stickers')
        .upload(path, imageFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('stickers').getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      let finalImageUrl = data.image_url || sticker?.image_url || null;
      if (imageFile) {
        const uploaded = await uploadImage();
        if (uploaded) finalImageUrl = uploaded;
      }

      const { error } = await supabase
        .from('stickers')
        .update({
          athlete_name: data.athlete_name,
          team: data.team,
          position: data.position,
          shirt_number: parseInt(data.shirt_number),
          status: data.status,
          rarity: data.rarity,
          description: data.description || null,
          image_url: finalImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Figurinha atualizada!');
      navigate(`/sticker/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar figurinha');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Figurinha</h1>
          <p className="text-sm text-muted-foreground">{sticker?.athlete_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da Figurinha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Nome do Atleta *</Label>
              <Input placeholder="Ex: Vinicius Junior" {...register('athlete_name')} />
              {errors.athlete_name && <p className="text-xs text-red-500">{errors.athlete_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seleção *</Label>
                <Select defaultValue={sticker?.team} onValueChange={(v) => setValue('team', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {getOrderedWorldCupTeams().map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.team && <p className="text-xs text-red-500">{errors.team.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Posição *</Label>
                <Select defaultValue={sticker?.position} onValueChange={(v) => setValue('position', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número da Camisa *</Label>
                <Input type="number" min={1} max={99} {...register('shirt_number')} />
                {errors.shirt_number && <p className="text-xs text-red-500">{errors.shirt_number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select defaultValue={sticker?.status} onValueChange={(v) => setValue('status', v as 'Quero' | 'Tenho' | 'Repetida')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STICKER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Classificação da Figurinha *</Label>
              <Select
                defaultValue={normalizeRarity(sticker?.rarity)}
                onValueChange={(v) => setValue('rarity', v as StickerRarity)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STICKER_RARITIES.map(rarity => {
                    const config = RARITY_CONFIG[rarity];
                    return (
                      <SelectItem key={rarity} value={rarity}>
                        {config.emoji} {config.label} — {config.odds}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                A classificação define a moldura visual da figurinha.
              </p>
              {errors.rarity && <p className="text-xs text-red-500">{errors.rarity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant={!useUrl ? 'default' : 'outline'} size="sm" onClick={() => setUseUrl(false)} className="cursor-pointer">
                  <Upload className="h-3 w-3 mr-1" /> Upload
                </Button>
                <Button type="button" variant={useUrl ? 'default' : 'outline'} size="sm" onClick={() => setUseUrl(true)} className="cursor-pointer">
                  <ImageIcon className="h-3 w-3 mr-1" /> URL Externa
                </Button>
              </div>
              {!useUrl ? (
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Clique para trocar a imagem</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              ) : (
                <div>
                  <Input placeholder="https://..." {...register('image_url')} />
                  {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 max-h-32 rounded-lg" onError={() => {}} />}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={3} {...register('description')} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="cursor-pointer flex-1">Cancelar</Button>
              <Button type="submit" disabled={loading} className="cursor-pointer flex-1">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
