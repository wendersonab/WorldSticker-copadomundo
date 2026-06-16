import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface CommentRulesModalProps {
  open: boolean;
  onAccept: () => void;
}

export function CommentRulesModal({ open, onAccept }: CommentRulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <DialogTitle>Regras da Comunidade</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p>
              Antes de comentar, lembre-se das regras da comunidade. Não são permitidos comentários com:
            </p>
            <ul className="list-none space-y-1.5 text-sm">
              {[
                '🚫 Spam',
                '🚫 Racismo',
                '🚫 Ofensas pessoais',
                '🚫 Violações dos direitos humanos',
                '🚫 Pornografia',
                '🚫 Incentivo à automutilação',
                '🚫 Incentivo ao abuso infantil',
                '🚫 Qualquer conteúdo derivado dessas práticas',
              ].map(rule => (
                <li key={rule} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                  <span className="text-sm">{rule}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium text-foreground">
              Comentários que violem essas regras poderão ser denunciados e removidos.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onAccept} className="w-full cursor-pointer">
            ✅ Entendi, vou seguir as regras
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
