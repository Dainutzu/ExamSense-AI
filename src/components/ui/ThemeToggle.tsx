import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${theme}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{ display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer' }}
    >
      <div className="theme-toggle-knob">
        {theme === 'dark'
          ? <Moon size={10} color="white" />
          : <Sun size={10} color="white" />
        }
      </div>
    </button>
  );
}
