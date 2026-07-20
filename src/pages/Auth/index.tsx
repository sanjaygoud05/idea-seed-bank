import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const emailSchema = z.string().trim().email({ message: 'Enter a valid email' }).max(255);
const passwordSchema = z.string().min(8, { message: 'At least 8 characters' }).max(72);
const nameSchema = z.string().trim().min(1, { message: 'Required' }).max(100);

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const from = (location.state as { from?: string })?.from || '/dashboard';

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const emailR = emailSchema.safeParse(login.email);
    const passR = passwordSchema.safeParse(login.password);
    if (!emailR.success) return toast.error(emailR.error.issues[0].message);
    if (!passR.success) return toast.error(passR.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailR.data, password: passR.data });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success('Welcome back');
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const fn = nameSchema.safeParse(signup.firstName);
    const ln = nameSchema.safeParse(signup.lastName);
    const em = emailSchema.safeParse(signup.email);
    const pw = passwordSchema.safeParse(signup.password);
    for (const r of [fn, ln, em, pw]) if (!r.success) return toast.error(r.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: em.data!,
      password: pw.data!,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { first_name: fn.data, last_name: ln.data },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success('Account created — check your email if confirmation is required.');
  }

async function handleGoogle() {
  setLoading(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  setLoading(false);

  if (error) {
    toast.error(error.message);
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="p-2 rounded-lg bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">EcoTwin AI</h1>
            <p className="text-xs text-muted-foreground">Sustainability Intelligence</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-3 pt-4">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="li-email">Email</Label>
                    <Input id="li-email" type="email" autoComplete="email"
                      value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="li-pass">Password</Label>
                    <Input id="li-pass" type="password" autoComplete="current-password"
                      value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Log in</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 pt-4">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="su-fn">First name</Label>
                      <Input id="su-fn" value={signup.firstName}
                        onChange={(e) => setSignup({ ...signup, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-ln">Last name</Label>
                      <Input id="su-ln" value={signup.lastName}
                        onChange={(e) => setSignup({ ...signup, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" autoComplete="email"
                      value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pass">Password</Label>
                    <Input id="su-pass" type="password" autoComplete="new-password"
                      value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Create account</Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
