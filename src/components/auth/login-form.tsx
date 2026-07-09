import { useState, type FormEvent } from 'react';
import { KeyRound, Loader2, LogIn, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';
import { AuthField, AuthPasswordField } from './auth-field';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    setSubmitting(true);
    try {
      await login({ username, password }, remember);
      toast.success('登录成功');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <AuthField
        id="username"
        label="用户名"
        icon={User}
        autoComplete="username"
        placeholder="user"
        value={username}
        onChange={setUsername}
        disabled={submitting}
      />
      <AuthPasswordField
        id="password"
        label="密码"
        icon={KeyRound}
        value={password}
        onChange={setPassword}
        disabled={submitting}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(value) => setRemember(value === true)}
          disabled={submitting}
        />
        <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
          记住我
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <LogIn />}
        登录
      </Button>
    </form>
  );
}
