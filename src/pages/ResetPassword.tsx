import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import logoImg from '@/icone.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'As senhas não coincidem',
});

type FormData = z.infer<typeof schema>;

export function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checked, setChecked] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      // If Supabase uses a code in the query params (OAuth-like flow)
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          setLoading(true);
          // exchange code for session if available (some Supabase setups use this)
          try {
            // exchangeCodeForSession may not exist depending on supabase-js version; guard it
            // @ts-ignore
            if (typeof supabase.auth.exchangeCodeForSession === 'function') {
              // @ts-ignore
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (!error && data?.session) {
                if (mounted) setIsRecovery(true);
              }
            }
          } catch (err) {
            // ignore — we'll rely on auth state change
          } finally {
            setLoading(false);
          }
        }

        // Check hash for access_token & type=recovery (typical Supabase recovery link)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        if (accessToken && type === 'recovery') {
          if (mounted) setIsRecovery(true);
        }

        // Check current session
        try {
          // supabase.auth.getSession exists on newer SDKs (v2)
          // Use runtime checks to avoid TypeScript errors in different SDK versions
          // @ts-ignore
          if (supabase?.auth && typeof supabase.auth.getSession === 'function') {
            // @ts-ignore
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
              if (mounted) setIsRecovery(true);
            }
          } else if (supabase?.auth && typeof (supabase.auth as any).session === 'function') {
            // older SDK
            // @ts-ignore
            const session = (supabase.auth as any).session();
            if (session) if (mounted) setIsRecovery(true);
          }
        } catch (e) {
          // ignore
        }

        // Listen for PASSWORD_RECOVERY event
        try {
          // supabase.auth.onAuthStateChange returns { data: { subscription } } in v2
          const { data } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
              if (mounted) setIsRecovery(true);
            }
          });
          return () => {
            if (!data) return;
            // v2 shape: data.subscription.unsubscribe()
            // v1 shape: data.unsubscribe()
            try {
              // @ts-ignore
              if (data.subscription && typeof data.subscription.unsubscribe === 'function') {
                // @ts-ignore
                data.subscription.unsubscribe();
                return;
              }
              // @ts-ignore
              if (typeof data.unsubscribe === 'function') {
                // @ts-ignore
                data.unsubscribe();
                return;
              }
            } catch (e) {
              // ignore
            }
          };
        } catch (err) {
          // ignore
        }
      } finally {
        if (mounted) setChecked(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const onSubmit = async (vals: FormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: vals.password });
      if (error) throw error;
      toast.success('Senha atualizada com sucesso');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src={logoImg} alt="WorldSticker" className="h-8 w-8 object-contain" />
            </div>
            <span className="font-black text-2xl">
              <span className="text-green-600">World</span>
              <span className="text-yellow-500">Sticker</span>
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Redefinir senha</CardTitle>
            <CardDescription>
              Digite a nova senha para sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!checked ? (
              <p className="text-sm text-muted-foreground">Verificando link de recuperação...</p>
            ) : !isRecovery ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Link de recuperação inválido ou expirado.</p>
                <div className="flex items-center gap-2">
                  <Link to="/forgot-password">
                    <Button variant="outline" className="cursor-pointer">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Reenviar link
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input id="password" type="password" {...register('password')} aria-invalid={!!errors.password} />
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input id="confirmPassword" type="password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-green-600 hover:underline cursor-pointer flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
