import { useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';

import { ChangePasswordDialog } from '@/components/auth/change-password-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const { user, logout } = useAuth();
  const username = user?.username ?? 'user';
  const initial = username.charAt(0).toUpperCase();
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="" className="size-6 md:hidden" />
        <span className="text-sm font-semibold tracking-tight">NekoBot Dashboard</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuLabel className="font-normal">{username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
              <KeyRound className="mr-2 size-4" />
              修改密码
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </header>
  );
}
