import { Loader2 } from 'lucide-react';

export function PageLoading({ label = '加载中…' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
