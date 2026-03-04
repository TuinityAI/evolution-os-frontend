'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
} from '@heroui/react';
import {
  Search,
  Bell,
  Eye,
  LogOut,
  User,
  Settings,
  Check,
  Keyboard,
  Menu,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CommandPalette } from '@/components/ui/command-palette';
import { NotificationsPanel } from '@/components/ui/notifications-panel';
import { motion } from 'framer-motion';
import { useAuth, MOCK_USERS } from '@/lib/contexts/auth-context';
import { useSidebar } from '@/lib/contexts/sidebar-context';
import { ROLE_LABELS } from '@/lib/constants/roles';

export function Header() {
  const router = useRouter();
  const { user, logout, loginAsUser } = useAuth();
  const { sidebarWidth, isMobile, toggleMobileOpen } = useSidebar();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for toggle-notifications event (from Ctrl+Shift+N shortcut)
  useEffect(() => {
    const handler = () => setIsNotificationsOpen((prev) => !prev);
    window.addEventListener('toggle-notifications', handler);
    return () => window.removeEventListener('toggle-notifications', handler);
  }, []);

  // Group users by role for the switcher
  const usersByRole = MOCK_USERS.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {} as Record<string, typeof MOCK_USERS>);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ left: sidebarWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed right-0 top-0 z-30 flex h-12 items-center justify-between px-4 md:justify-end"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {/* Mobile hamburger button */}
        {isMobile && (
          <button
            onClick={toggleMobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Center - Search Bar (opens Command Palette) - hidden on mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative flex items-center"
          >
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <div className="flex h-8 w-80 items-center rounded-lg bg-[#2a2a2a] pl-9 pr-16 text-sm text-gray-400 transition-colors hover:bg-[#333]">
              Buscar...
            </div>
            <div className="absolute right-2 flex items-center gap-1">
              <kbd className="rounded bg-[#333] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                CTRL
              </kbd>
              <kbd className="rounded bg-[#333] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* View as dropdown - User Switcher for Demo */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button className="flex h-8 items-center gap-1.5 rounded-lg bg-[#2a2a2a] px-3 text-sm text-gray-300 transition-colors hover:bg-[#333]">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {user ? ROLE_LABELS[user.role] : 'Ver como'}
                </span>
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Cambiar usuario"
              classNames={{
                base: 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] shadow-lg min-w-[220px] max-h-[70vh] overflow-y-auto',
              }}
              onAction={(key) => {
                const selectedUser = MOCK_USERS.find((u) => u.id === key);
                if (selectedUser) {
                  loginAsUser(selectedUser);
                  router.refresh();
                }
              }}
            >
              {Object.entries(usersByRole).map(([role, users]) => (
                <DropdownSection
                  key={role}
                  title={ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                  classNames={{
                    heading: 'text-xs font-semibold text-gray-500 dark:text-gray-400 px-2',
                  }}
                >
                  {users.map((u) => (
                    <DropdownItem
                      key={u.id}
                      startContent={
                        <Avatar
                          name={u.name}
                          size="sm"
                          classNames={{
                            base: 'h-6 w-6 bg-brand-600 text-white text-[10px]',
                          }}
                        />
                      }
                      endContent={
                        user?.id === u.id && (
                          <Check className="h-4 w-4 text-brand-600" />
                        )
                      }
                      className={user?.id === u.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''}
                    >
                      {u.name}
                    </DropdownItem>
                  ))}
                </DropdownSection>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts-help'))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white"
            title="Atajos de teclado (Ctrl+/)"
          >
            <Keyboard className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button
            ref={bellRef}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {/* Unread indicator dot */}
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}
