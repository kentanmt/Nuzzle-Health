import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, PawPrint, Calendar, FolderOpen, Home, MessageCircle, Footprints } from 'lucide-react';
import { NuzzleLogo } from './NuzzleLogo';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/diagnostics', label: 'Labs', icon: Activity },
  { path: '/pet', label: 'Pet', icon: PawPrint },
  { path: '/timeline', label: 'Care', icon: Calendar },
  { path: '/activity', label: 'Activity', icon: Footprints },
  { path: '/records', label: 'Records', icon: FolderOpen },
  { path: '/ask-vet', label: 'Ask Vet', icon: MessageCircle },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 flex-col border-r border-border bg-card z-40">
        <div className="p-5 border-b border-border">
          <Link to="/">
            <NuzzleLogo size="sm" />
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sage-light text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Home className="h-4.5 w-4.5" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.08)]">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] rounded-lg transition-colors ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-sage-light' : ''}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Keep BottomNav as alias for backward compat
export function BottomNav() {
  return <AppSidebar />;
}
