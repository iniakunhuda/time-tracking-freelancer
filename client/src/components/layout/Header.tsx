import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { Button } from '../common/Button';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Time Tracker</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};