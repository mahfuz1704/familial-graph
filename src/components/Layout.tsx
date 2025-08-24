import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Home, Users, FileBarChart, LogOut, UserPlus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: '/', label: 'ড্যাশবোর্ড', icon: Home },
    { path: '/members', label: 'সদস্যগণ', icon: Users },
    { path: '/add-member', label: 'সদস্য যোগ করুন', icon: UserPlus },
    { path: '/reports', label: 'রিপোর্ট', icon: FileBarChart },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">পারিবারিক প্রোফাইল</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;