import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: '首页', path: '/', icon: 'fa-home' },
  { label: '战力装备', path: '/combat-power-equipment', icon: 'fa-shield-alt' },
  { label: '抽奖模拟', path: '/lottery-simulation', icon: 'fa-gift' },
];

export default function MainNavigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-gamepad text-blue-600 text-2xl"></i>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">冒冒守护平台</h1>
        </div>
        
        <ul className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <i className={`fa-solid ${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        <button className="md:hidden text-gray-700 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
      
      {/* Mobile navigation */}
      <div className="mt-4 md:hidden">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg transition-all duration-200 w-full",
                  location.pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <i className={`fa-solid ${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
