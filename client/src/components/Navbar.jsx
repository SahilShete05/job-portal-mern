import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../context/DarkModeContext';
import { Menu, X, Sun, Moon, ChevronDown, LogOut, Settings, User, Bell } from 'lucide-react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationService';
import { connectSocket } from '../services/socket';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Jobs', path: '/jobs' },
  ];

  if (user) {
    navLinks.push({ label: 'Dashboard', path: '/dashboard' });
    if (user.role === 'jobseeker') {
      navLinks.push({ label: 'Applied Jobs', path: '/applied-jobs' });
      navLinks.push({ label: 'Saved Jobs', path: '/saved-jobs' });
    } else if (user.role === 'employer') {
      navLinks.push({ label: 'My Jobs', path: '/my-jobs' });
    }
    navLinks.push({ label: 'Messages', path: '/messages' });
    navLinks.push({ label: 'Interviews', path: '/interviews' });
  }

  const getRoleDisplay = () => {
    const roleMap = {
      jobseeker: 'Job Seeker',
      employer: 'Employer',
      admin: 'Admin'
    };
    return roleMap[user?.role] || user?.role;
  };

  const getInitials = () => {
    return (user?.name || 'U')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profilePath = user?.role === 'employer' ? '/employer/profile' : '/profile';

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadNotifications = async () => {
      try {
        const result = await getNotifications({ limit: 10 });
        if (!mounted) return;
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      } catch (err) {
        console.warn('Failed to load notifications', err);
      }
    };

    loadNotifications();

    const socket = connectSocket();
    const handleNotification = (notification) => {
      if (!mounted) return;
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
      setUnreadCount((prev) => prev + 1);
    };

    const handleUnread = (payload) => {
      if (!mounted) return;
      setUnreadCount(payload.count || 0);
    };

    if (socket) {
      socket.on('notification:new', handleNotification);
      socket.on('notifications:unread', handleUnread);
    }

    return () => {
      mounted = false;
      if (socket) {
        socket.off('notification:new', handleNotification);
        socket.off('notifications:unread', handleUnread);
      }
    };
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification._id);
      }
      setIsNotificationOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.warn('Failed to update notification', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const result = await getNotifications({ limit: 10 });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.warn('Failed to mark notifications read', err);
    }
  };

  return (
    <nav className="bg-surface text-primary shadow-soft border-b border-subtle transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold text-[color:var(--app-accent)] hover:brightness-110 transition-all duration-200"
          >
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-[color:var(--app-accent)]">
              JP
            </span>
            JobPortal
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-muted hover:text-primary font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-all duration-200 transform hover:scale-110 bg-card text-primary border border-subtle"
              title="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-lg transition-all duration-200 bg-card text-primary border border-subtle relative"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[color:var(--app-danger)] text-white text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-card z-50 transition-all duration-200 bg-card border border-subtle">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
                      <p className="text-sm font-semibold text-primary">Notifications</p>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium text-[color:var(--app-accent)] hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-muted text-center">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left px-4 py-3 border-b border-subtle transition-colors ${
                              notification.isRead
                                ? 'bg-card'
                                : 'bg-[color:var(--app-accent-soft)]'
                            }`}
                          >
                            <p className="text-sm font-semibold text-primary">
                              {notification.title}
                            </p>
                            {notification.body && (
                              <p className="text-xs text-muted mt-1 line-clamp-2">
                                {notification.body}
                              </p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-[color:var(--app-accent-soft)]"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[color:var(--app-accent)] flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials()}
                  </div>

                  {/* User Info - Hidden on mobile */}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-primary">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-xs text-muted">
                      {getRoleDisplay()}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-card z-50 transition-all duration-200 bg-card border border-subtle">
                    {/* Dropdown Header */}
                    <div className="px-4 py-3 border-b border-subtle">
                      <p className="text-sm font-semibold text-primary">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted">
                        {user.email}
                      </p>
                    </div>

                    {/* Dropdown Menu Items */}
                    <div className="py-2 divide-y divide-[color:var(--app-border)]">
                      <Link
                        to={profilePath}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-primary hover:bg-[color:var(--app-accent-soft)] transition-colors duration-150"
                      >
                        <User size={16} />
                        View Profile
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-primary hover:bg-[color:var(--app-accent-soft)] transition-colors duration-150"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger-soft transition-colors duration-150"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-muted hover:text-primary"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-[color:var(--app-accent)] text-white hover:brightness-110"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-[color:var(--app-accent-soft)]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-subtle bg-surface">
            <div className="py-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg transition-colors duration-200 text-muted hover:text-primary hover:bg-[color:var(--app-accent-soft)]"
                >
                  {link.label}
                </Link>
              ))}

              {!user && (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 text-muted hover:text-primary hover:bg-[color:var(--app-accent-soft)]"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-[color:var(--app-accent)] text-white hover:brightness-110"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}

      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
