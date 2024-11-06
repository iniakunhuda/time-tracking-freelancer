import { NavLink } from 'react-router-dom';
import { 
  Clock, 
  BarChart2, 
  Folder, 
  CheckSquare, 
  FileText 
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: "/", label: "Time Tracking", icon: Clock },
    { to: "/projects", label: "Projects", icon: Folder },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/analytics", label: "Analytics", icon: BarChart2 },
    { to: "/invoices", label: "Invoices", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};