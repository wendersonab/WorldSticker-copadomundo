import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { POSITIONS, STICKER_RARITIES, STICKER_STATUSES, StickerRarity } from '@/types';
import { getOrderedWorldCupTeams } from '@/utils/teams';
import { RARITY_CONFIG } from '@/utils/rarity';
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
  athlete_name: z.string().min(2, 'Nome muito curto').max(80, 'Nome muito longo'),
  team: z.string().min(1, 'Selecione uma seleção'),
  position: z.string().min(1, 'Selecione uma posição'),
  shirt_number: z.string().min(1, 'Número obrigatório'),
  status: z.enum(['Quero', 'Tenho', 'Repetida']),
  rarity: z.enum(['Ouro', 'Prata', 'Bronze', 'Lilás']),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
  image_url: z.string().optional(),
});

export function CreateSticker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [useUrl, setUseUrl] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { status: 'Tenho', rarity: 'Lilás' },
  });

  const imageUrl = watch('image_url');

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
    setUploading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('stickers')
        .upload(path, imageFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('stickers').getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      toast.error('Erro ao fazer upload da imagem. Usando URL externa.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      let finalImageUrl = data.image_url || null;

      if (imageFile) {
        const uploaded = await uploadImage();
        if (uploaded) finalImageUrl = uploaded;
      }

      const { error } = await supabase
        .from('stickers')
        .insert({
          user_id: user.id,
          athlete_name: data.athlete_name,
          team: data.team,
          position: data.position,
          shirt_number: parseInt(data.shirt_number),
          status: data.status,
          rarity: data.rarity,
          description: data.description || null,
          image_url: finalImageUrl,
        });

      if (error) throw error;
      toast.success('Figurinha criada com sucesso!');
      navigate('/feed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar figurinha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nova Figurinha</h1>
          <p className="text-sm text-muted-foreground">Adicione um atleta à sua coleção</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da Figurinha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Athlete Name */}
            <div className="space-y-2">
              <Label htmlFor="athlete_name">Nome do Atleta *</Label>
              <Input
                id="athlete_name"
                placeholder="Ex: Vinicius Junior"
                {...register('athlete_name')}
              />
              {errors.athlete_name && <p className="text-xs text-red-500">{errors.athlete_name.message}</p>}
            </div>

            {/* Team & Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seleção *</Label>
                <Select onValueChange={(v) => setValue('team', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOrderedWorldCupTeams().map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.team && <p className="text-xs text-red-500">{errors.team.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Posição *</Label>
                <Select onValueChange={(v) => setValue('position', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
              </div>
            </div>

            {/* Shirt Number & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shirt_number">Número da Camisa *</Label>
                <Input
                  id="shirt_number"
                  type="number"
                  min={1}
                  max={99}
                  placeholder="Ex: 7"
                  {...register('shirt_number')}
                />
                {errors.shirt_number && <p className="text-xs text-red-500">{errors.shirt_number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  defaultValue="Tenho"
                  onValueChange={(v) => setValue('status', v as 'Quero' | 'Tenho' | 'Repetida')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STICKER_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            {/* Rarity */}
            <div className="space-y-2">
              <Label>Classificação da Figurinha *</Label>
              <Select
                defaultValue="Lilás"
                onValueChange={(v) => setValue('rarity', v as StickerRarity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a raridade" />
                </SelectTrigger>
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
                Essa classificação cria uma moldura visual diferente na figurinha.
              </p>
              {errors.rarity && <p className="text-xs text-red-500">{errors.rarity.message}</p>}
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={!useUrl ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseUrl(false)}
                  className="cursor-pointer"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant={useUrl ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseUrl(true)}
                  className="cursor-pointer"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  URL Externa
                </Button>
              </div>

              {!useUrl ? (
                <div>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                      ) : (
                        <div className="text-muted-foreground">
                          <Upload className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Clique para selecionar imagem</p>
                          <p className="text-xs mt-1">PNG, JPG, WEBP até 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <Input
                    placeholder="https://exemplo.com/imagem.jpg"
                    {...register('image_url')}
                  />
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="mt-2 max-h-32 rounded-lg object-cover" onError={() => {}} />
                  )}
                  {errors.image_url && <p className="text-xs text-red-500">{errors.image_url.message}</p>}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Conte algo sobre esse atleta ou sua figurinha..."
                rows={3}
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="cursor-pointer flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploading} className="cursor-pointer flex-1">
                {loading || uploading ? 'Salvando...' : 'Criar Figurinha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
