'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import AuthModal from "../auth/AuthForms";
import { CircleUser, LogOut, Settings2, Gift, Home, Grid, Phone, Info, Tag } from "lucide-react";
import { AuthAPI, clearAuthTokens } from '../../services/auth';


// User type for local state
interface User {
  name: string;
  avatarUrl: string;
}

// Lightweight menu item type for mobile rendering
type MenuItemLike = { labelKey: string; path: string; submenuItems?: { labelKey: string; path: string }[] };

const menuItems = [
  { labelKey: "Home", path: "/" },
  { labelKey: "About", path: "/pages/about" },
  {
    labelKey: "Services",
    path: "/pages/services",
    submenuItems: [
      { labelKey: "cosmetic_porcelain_teeth", path: "/pages/services/cosmetic_porcelain_teeth" },
      { labelKey: "porcelain_veneer", path: "/pages/services/porcelain_veneer" },
      { labelKey: "invisalign_orthodontics", path: "/pages/services/invisalign_orthodontics" },
      { labelKey: "individual_implants", path: "/pages/services/individual_implants" },
      { labelKey: "full_mouth_dental_implants", path: "/pages/services/full_mouth_dental_implants" },
      { labelKey: "in_office_zoom_teeth_whitening", path: "/pages/services/in_office_zoom_teeth_whitening" },
      { labelKey: "periodontic_gum_diseases", path: "/pages/services/periodontic_gum_diseases" },
    ],
  },
  {
    labelKey: "Pricing",
    path: "/pages/pricing",
    submenuItems: [
      { labelKey: "dental_exam_pricing", path: "/pages/pricing/dental_exam_pricing" },
      { labelKey: "veneer_porcelain_pricing", path: "/pages/pricing/veneer_porcelain_pricing" },
      { labelKey: "minor_surgery_pricing", path: "/pages/pricing/minor_surgery_pricing" },
      { labelKey: "orthodontic_pricing", path: "/pages/pricing/orthodontic_pricing" },
      { labelKey: "children_dental_pricing", path: "/pages/pricing/children_dental_pricing" },
      { labelKey: "implant_surgery_pricing", path: "/pages/pricing/implant_surgery_pricing" },
      { labelKey: "fixed_removable_prosthetics_pricing", path: "/pages/pricing/fixed_removable_prosthetics_pricing" },
    ],
  },
  { labelKey: "Contact", path: "/pages/contact" },
  { labelKey: "Special Offers", path: "" },
];


const Menu: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownTimerRef = useRef<number | null>(null);
  const profileDropdownTimerRef = useRef<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({
          name: parsed.username || parsed.name || '',
          avatarUrl: parsed.avatar_url || parsed.avatarUrl || '/images/default-avatar.jpg'
        });
        setRole(parsed.role || null);
        setIsLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          const stored = e.newValue;
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser({ name: parsed.username || parsed.name || '', avatarUrl: parsed.avatarUrl || '/penguin.png' });
            setRole(parsed.role || null);
            setIsLoggedIn(true);
          } else {
            setUser(null);
            setRole(null);
            setIsLoggedIn(false);
          }
        } catch {
          setUser(null);
          setRole(null);
          setIsLoggedIn(false);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleAuthSuccess = (userObj: { username?: string; email?: string; role?: string; avatar_url?: string; [k: string]: unknown }) => {
    // Use the standardized format directly from AuthForms, don't convert to legacy format
    const standardizedUser = {
      username: userObj.username || '',
      email: userObj.email || '',
      role: userObj.role || 'USER',
      avatar_url: userObj.avatar_url || '/images/default-avatar.jpg'
    };

    // Update local state for Menu display
    setUser({
      name: standardizedUser.username,
      avatarUrl: standardizedUser.avatar_url
    });
    setRole(standardizedUser.role || null);
    setIsLoggedIn(true);
    try { localStorage.setItem('user', JSON.stringify(userObj)); } catch {}
    setShowAuthModal(false);
  };


  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
    try { await AuthAPI.clearCookies(); } catch {}
    try {
      // Optionally call backend to invalidate session
      const refreshToken = localStorage.getItem('refreshToken') || '';
      if (refreshToken) {
        try { await AuthAPI.logout({ refreshToken }); } catch {}
      }
      // Call backend to clear cookies
    } catch {}
    clearAuthTokens();
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimerRef.current) {
      window.clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = window.setTimeout(() => setActiveDropdown(null), 200) as unknown as number;
  };

  const handleMouseEnterProfile = () => {
    if (profileDropdownTimerRef.current) {
      window.clearTimeout(profileDropdownTimerRef.current);
      profileDropdownTimerRef.current = null;
    }
    setShowProfileDropdown(true);
  };

  const handleMouseLeaveProfile = () => {
    profileDropdownTimerRef.current = window.setTimeout(() => setShowProfileDropdown(false), 200) as unknown as number;
  };


  

  const getIcon = (labelKey: string) => {
    switch (labelKey) {
      case 'Home': return <Home size={18} />;
      case 'About': return <Info size={18} />;
      case 'Services': return <Grid size={18} />;
      case 'Pricing': return <Tag size={18} />;
      case 'Contact': return <Phone size={18} />;
      case 'Special Offers': return <Gift size={18} />;
      default: return <Grid size={18} />;
    }
  };

  // For mobile rendering: hide 'Special Offers' and 'About' and replace with a single 'User' slot
  const mobileRenderItems = React.useMemo<MenuItemLike[]>(() => {
    // remove Special Offers and About
    const filtered = menuItems.filter(m => m.labelKey !== 'Special Offers' && m.labelKey !== 'About');
    const mid = Math.ceil(filtered.length / 2);
    const userItem = { labelKey: 'User', path: '/pages/profile' };
    return [...filtered.slice(0, mid), userItem, ...filtered.slice(mid)];
  }, []);

  // Portal container for mobile bottom nav to avoid being trapped by ancestor transforms
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [portalMounted, setPortalMounted] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.createElement('div');
    el.id = 'mobile-nav-portal';
    // ensure portal sits above other content
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.right = '0';
    el.style.bottom = '0';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    setPortalContainer(el);
    setPortalMounted(true);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

  return (
      <div className="h-20 flex justify-between  md:gap-60 items-center p-3 sticky top-0 z-50 text-gray-600 bg-white backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 justify-center ml-3 cursor-pointer">
          <Link href="/">
            <div className="flex items-center gap-2 justify-center">
              <Image src="/LOGO/tooth.png" width={30} height={20} alt="logo" priority />
              <h1 className="text-xl font-bold text-gray-600">HoangBinh Dental</h1>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-center gap-4 mr-10 w-[]">
          {menuItems.map((item, i) => {
              const isActive = !!pathname && (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path));
              return (
                <div key={item.labelKey} className="relative group" onMouseEnter={() => handleMouseEnter(item.labelKey)} onMouseLeave={handleMouseLeave}>
                  <Link href={item.path} className="h-full" aria-current={isActive ? 'page' : undefined}>
                    <motion.div
                      variants={{ hidden: { opacity: 0, x: '100%' }, animate: { opacity: 1, x: 0 }, hover: { scale: 1.03 }, tap: { scale: 0.98 } }}
                      className={`h-full font-bold text-[14px] px-4 py-1 rounded-lg relative overflow-hidden transition-colors duration-200 ${isActive ? 'text-purple-600' : 'text-gray-600 group-hover:text-purple-600'}`}
                      initial="hidden"
                      animate="animate"
                      whileHover="hover"
                      whileTap="tap"
                      custom={i}
                    >
                        {item.labelKey === 'Special Offers' ? (
                          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md transform transition duration-200 hover:scale-105">
                            <Gift size={16} />
                            <span className="relative z-10 select-none">{t(item.labelKey)}</span>
                          </div>
                        ) : (
                          <>
                            <span className="relative z-10 select-none">{t(item.labelKey)}</span>
                            <span className={`absolute left-0 bottom-0 h-0.5 bg-purple-600 transition-all duration-200 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                          </>
                        )}
                    </motion.div>
                  </Link>

                  {item.submenuItems && activeDropdown === item.labelKey && (
                      <motion.div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-2 w-70 z-50 flex flex-col items-start" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {item.submenuItems.map((subItem) => (
                            <Link href={subItem.path} key={subItem.labelKey} className="w-full">
                              <div className="w-full text-left py-4 px-4 hover:bg-gray-100 hover:border-b-2 hover:border-b-purple-500 rounded-md transition-colors duration-200 cursor-pointer">{t(subItem.labelKey)}</div>
                            </Link>
                        ))}
                      </motion.div>
                  )}
                </div>
              );
          })}

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
                <div className="relative" onMouseEnter={handleMouseEnterProfile} onMouseLeave={handleMouseLeaveProfile}>
                  <button className="flex items-center gap-2 cursor-pointer">
                    <motion.img src={user?.avatarUrl || '/images/default-avatar.jpg'} alt="User Avatar" className="rounded-full w-10 h-10 border-2 border-purple-500" />
                  </button>
                  <AnimatePresence>
                    {showProfileDropdown && (
                        <motion.div
                            className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-2 w-60 z-50 flex flex-col items-start"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.1 }}
                        >
                          <div className="w-full py-2 px-4 text-sm font-semibold text-gray-800">
                            {user?.name || "User"}
                          </div>
                          <div className="w-full h-px bg-gray-200 my-1" />
                          <button onClick={() => { router.push('/pages/profile'); setShowProfileDropdown(false); }} className="w-full flex items-center text-left text-sm text-gray-600 py-2 px-4 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <CircleUser className="mr-2 text-gray-400" /> {t('profile') || 'Profile'}
                          </button>
                          <div className="w-full h-px bg-gray-200 my-1" />
                          {/* <button onClick={() => { router.push('/settings'); setShowProfileDropdown(false); }} className="w-full flex items-center text-left text-sm text-gray-600 py-2 px-4 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <Settings2 className="mr-2 text-gray-400" /> {t('settings') || 'Settings'}
                          </button> */}
                          <div className="w-full h-px bg-gray-200 my-1" />
                          {role === 'DENTIST' && (
                            <button onClick={() => { router.push('/pages/dentist/appointments'); setShowProfileDropdown(false); }} className="w-full flex items-center text-left text-sm text-gray-600 py-2 px-4 hover:bg-gray-100 rounded-md transition-colors duration-200">
                              {/* simple icon could be added here */}
                              {t('my_appointments') || 'My Appointments'}
                            </button>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center text-left text-sm text-gray-600 py-2 px-4 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <LogOut className="mr-2 text-gray-400" /> {t('logout') || 'Logout'}
                          </button>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            ) : (
                <motion.button onClick={() => setShowAuthModal(true)} whileTap={{ scale: 0.95 }} className="text-[15px] font-bold text-white py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
                  {t('login')}
                </motion.button>
            )}

            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile: bottom navigation bar (visible on small screens) */}
        {/* Mobile bottom nav rendered into portal to avoid ancestor transform issues */}
        {portalMounted && portalContainer && createPortal(
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-4xl mx-auto px-3">
              <div className="relative">
                <motion.nav
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-100 rounded-t-2xl shadow-xl px-4 py-3"
                  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                  aria-label="Mobile navigation"
                >
                  <div className="flex items-center justify-between">
                    {mobileRenderItems.map((mi: MenuItemLike) => {
                      const isActive = !!pathname && (mi.path === '/' ? pathname === '/' : (mi.path && mi.path !== '' ? pathname.startsWith(mi.path) : false));
                      const isSpecial = mi.labelKey === 'Special Offers';
                      const isUserSlot = mi.labelKey === 'User';
                      // Center special button visually
                      const itemClass = isSpecial ? 'flex-1 flex items-center justify-center relative -mt-6' : 'flex-1 flex items-center justify-center';
                      return (
                        <div key={mi.labelKey} className={itemClass}>
                          {isUserSlot ? (
                            <motion.button
                              onClick={() => { if (isLoggedIn) handleNavigation('/pages/profile'); else setShowAuthModal(true); }}
                              className="flex flex-col items-center justify-center text-sm focus:outline-none"
                              whileTap={{ scale: 0.94 }}
                              whileHover={{ scale: 1.03 }}
                              aria-label={isLoggedIn ? t('profile') : t('login')}
                            >
                              {isLoggedIn ? (
                                <Image src={user?.avatarUrl || '/images/default-avatar.jpg'} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-purple-500" alt="avatar" />
                              ) : (
                                <motion.div className="p-2 rounded-md text-gray-600">
                                  <CircleUser />
                                </motion.div>
                              )}
                              <motion.span className="text-xs mt-1">{isLoggedIn ? (user?.name || t('profile')) : t('login')}</motion.span>
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => { if (mi.submenuItems) setActiveDropdown(activeDropdown === mi.labelKey ? null : mi.labelKey); else handleNavigation(mi.path || '/'); }}
                              className={`flex flex-col items-center justify-center text-sm focus:outline-none`}
                              whileTap={{ scale: 0.94 }}
                              whileHover={{ scale: 1.03 }}
                              aria-current={isActive ? 'page' : undefined}
                              aria-label={t(mi.labelKey)}
                            >
                              {isSpecial ? (
                                <motion.div
                                  initial={{ scale: 0.98 }}
                                  animate={isActive ? { scale: 1.06, y: -6 } : { scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 220 }}
                                  className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 flex items-center justify-center shadow-2xl text-white"
                                  style={{ boxShadow: '0 10px 25px rgba(99, 102, 241, 0.18)' }}
                                >
                                  {getIcon(mi.labelKey)}
                                </motion.div>
                              ) : (
                                <motion.div
                                  animate={isActive ? { y: -6, color: '#7C3AED' } : { y: 0 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                  className={`p-2 rounded-md ${isActive ? 'text-purple-600' : 'text-gray-600'}`}
                                >
                                  {getIcon(mi.labelKey)}
                                </motion.div>
                              )}

                              <motion.span className={`text-xs mt-1 ${isSpecial ? 'text-gray-800' : ''}`} aria-hidden>
                                {t(mi.labelKey)}
                              </motion.span>
                            </motion.button>
                          )}

                          {/* mobile submenu -> slide-up bottom sheet + backdrop for touch devices */}
                          <AnimatePresence>
                            {mi.submenuItems && activeDropdown === mi.labelKey && (
                              <>
                                {/* backdrop */}
                                <motion.button
                                  key={`backdrop-${mi.labelKey}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0.4 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.12 }}
                                  onClick={() => setActiveDropdown(null)}
                                  className="fixed inset-0 z-40 bg-black/40"
                                  aria-hidden
                                />

                                {/* bottom sheet with drag-to-close and handle for modern mobile UX */}
                                <motion.div
                                  key={`sheet-${mi.labelKey}`}
                                  initial={{ y: '100%' }}
                                  animate={{ y: 0 }}
                                  exit={{ y: '100%' }}
                                  transition={{ type: 'spring', stiffness: 220, damping: 30 }}
                                  drag="y"
                                  dragConstraints={{ top: 0, bottom: 0 }}
                                  dragElastic={0.18}
                                  onDragEnd={(_, info) => { if (info.offset.y > 80) setActiveDropdown(null); }}
                                  whileDrag={{ scale: 0.998 }}
                                  role="dialog"
                                  aria-modal="true"
                                  className="fixed left-3 right-3 bottom-3 z-50 bg-white rounded-2xl shadow-2xl p-4 touch-pan-y"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                  <div className="mx-auto w-12 h-1.5 rounded-full bg-gray-200 mb-3" aria-hidden />
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-semibold">{t(mi.labelKey)}</div>
                                    <button onClick={() => setActiveDropdown(null)} className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100">{t('close') || 'Close'}</button>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {mi.submenuItems.map((si) => (
                                      <motion.button
                                        key={si.labelKey}
                                        onClick={() => { handleNavigation(si.path); setActiveDropdown(null); }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-3"
                                      >
                                        <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-gray-100">
                                          {getIcon(si.labelKey)}
                                        </span>
                                        <span>{t(si.labelKey)}</span>
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.nav>
              </div>
            </div>
          </div>,
          portalContainer
        )}

        {/* overlay hamburger menu removed — mobile uses bottom bar */}

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      </div>
  );
};

export default Menu;

