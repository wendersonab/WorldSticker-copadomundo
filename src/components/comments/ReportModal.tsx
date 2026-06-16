import { useState } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { REPORT_REASONS, ReportReason } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface ReportModalProps {
  commentId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportModal({ commentId, open, onClose }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) {
      toast.error('Selecione um motivo');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          description: description || null,
        });
      if (error) {
        if (error.code === '23505') {
          toast.error('Você já denunciou este comentário');
        } else {
          throw error;
        }
      } else {
        toast.success('Denúncia enviada. Obrigado por manter a comunidade segura!');
        onClose();
        setReason('');
        setDescription('');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar denúncia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Denunciar comentário</DialogTitle>
          </div>
          <DialogDescription>
            Selecione o motivo da denúncia. Sua denúncia será analisada pela equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Motivo *</Label>
          <div className="grid grid-cols-1 gap-2">
            {REPORT_REASONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                  reason === r
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'border-border hover:border-red-300 hover:bg-muted/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Descrição adicional (opcional)</Label>
            <Textarea
              placeholder="Descreva o problema com mais detalhes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
          >
            {loading ? 'Enviando...' : 'Enviar denúncia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
