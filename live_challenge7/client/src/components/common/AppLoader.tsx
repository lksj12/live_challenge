import { FileText } from 'lucide-react';

export function AppLoader() {
  return (
    <main className="app-loading" aria-busy="true">
      <p className="sr-only" role="status">
        로그인 상태 확인 중
      </p>
      <div className="brand-mark" aria-hidden="true">
        <FileText size={26} strokeWidth={2.2} />
      </div>
      <p className="brand-name">Keeply</p>
      <div className="loading-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}
