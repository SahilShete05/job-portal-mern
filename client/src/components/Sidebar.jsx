import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  Calendar,
  Settings,
  Plus,
  BookmarkPlus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { isRole } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Job Seeker Menu Items
  const jobSeekerMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { label: 'My Profile', path: '/profile', icon: FileText },
    { label: 'Applied Jobs', path: '/applied-jobs', icon: Briefcase },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: BookmarkPlus },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Employer Menu Items
  const employerMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Post Job', path: '/post-job', icon: Plus },
    { label: 'My Jobs', path: '/my-jobs', icon: Briefcase },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Company Profile', path: '/employer/profile', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const menuItems = isRole('jobseeker') ? jobSeekerMenu : employerMenu;

  const isActive = (path) => location.pathname === path;

  const handleNavigation = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-[color:var(--app-accent)] text-white rounded-lg hover:brightness-110 transition-colors duration-200 shadow-soft"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-surface
          border-r border-subtle shadow-soft lg:shadow-none
          transform transition-transform duration-300 z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="h-full overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      active
                        ? 'bg-[color:var(--app-accent-soft)] text-primary border border-[color:var(--app-border)]'
                        : 'text-muted hover:text-primary hover:bg-[color:var(--app-accent-soft)]'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
