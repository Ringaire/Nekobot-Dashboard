import { Outlet } from 'react-router-dom';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function AppShell() {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 flex h-svh w-60 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <img src="/logo.svg" alt="NekoBot" className="size-6" />
          <span className="font-semibold tracking-tight">NekoBot</span>
        </div>
        <ScrollArea className="flex-1">
          <Sidebar />
        </ScrollArea>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
