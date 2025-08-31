import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: 'home', label: 'Accueil', icon: Home, path: '/home' },
  { id: 'planning', label: 'Planning', icon: Calendar, path: '/planning' },
  { id: 'profile', label: 'Profil', icon: User, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around py-1 sm:py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center space-y-1 h-auto py-2 px-2 sm:px-3 transition-smooth min-w-[60px] active:scale-95",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6",
                  isActive && "text-primary"
                )} />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};