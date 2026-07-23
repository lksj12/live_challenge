import { Moon, Sun } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/themeSlice';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`icon-button theme-toggle ${className}`.trim()}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
      aria-pressed={isDark}
      onClick={() => dispatch(toggleTheme())}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
