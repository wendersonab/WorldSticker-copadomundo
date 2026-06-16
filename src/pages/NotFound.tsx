import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl sticker-gradient flex items-center justify-center mx-auto">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black">404</h1>
          <p className="text-muted-foreground mt-2">Essa figurinha não foi encontrada no álbum.</p>
        </div>
        <Link to="/feed">
          <Button className="cursor-pointer">Voltar para o feed</Button>
        </Link>
      </div>
    </div>
  );
}
