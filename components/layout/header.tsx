'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react';
import {
  Search,
  Bell,
  Eye,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useSidebar } from '@/lib/contexts/sidebar-context';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sidebarWidth } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.header
      initial={false}
      animate={{ left: sidebarWidth }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed right-0 top-0 z-30 flex h-12 items-center justify-end px-4"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Center - Search Bar */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-80 rounded-lg bg-[#2a2a2a] pl-9 pr-16 text-sm text-white placeholder:text-gray-400 focus:bg-[#333] focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="rounded bg-[#333] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
              CTRL
            </kbd>
            <kbd className="rounded bg-[#333] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* View as button */}
        <button className="flex h-8 items-center gap-1.5 rounded-lg bg-[#2a2a2a] px-3 text-sm text-gray-300 transition-colors hover:bg-[#333]">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Ver como</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white">
          <Bell className="h-4 w-4" />
        </button>

        {/* User Avatar */}
        {user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#2a2a2a]">
                <Avatar
                  name={user.name}
                  size="sm"
                  classNames={{
                    base: 'h-7 w-7 bg-emerald-600 text-white text-xs',
                  }}
                />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="User menu"
              classNames={{
                base: 'bg-white border border-gray-200 shadow-lg',
              }}
            >
              <DropdownItem
                key="profile"
                startContent={<User className="h-4 w-4" />}
              >
                Mi Perfil
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={<Settings className="h-4 w-4" />}
              >
                Configuración
              </DropdownItem>
              <DropdownItem
                key="logout"
                startContent={<LogOut className="h-4 w-4" />}
                className="text-danger"
                color="danger"
                onPress={handleLogout}
              >
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </motion.header>
  );
}
