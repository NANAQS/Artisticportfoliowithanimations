'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  Palette, LogOut, Grid, Rows, Image, ImageIcon, Users, Star,
  BarChart3, Menu, X, ChevronDown, ChevronRight, Settings, FileText, Mail, User,
  Shield, Key, Clock, Sparkles
} from 'lucide-react'
import LoginPage from './login/page'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: MenuItem[]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['conteudo', 'configuracao', 'seguranca']))

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, path: '/dashboard' },
    {
      id: 'conteudo',
      label: 'Conteúdo',
      icon: FileText,
      children: [
        { id: 'gallery', label: 'Galeria', icon: Grid, path: '/dashboard/gallery' },
        { id: 'carousel', label: 'Carrossel', icon: Rows, path: '/dashboard/carousel' },
      ]
    },
    {
      id: 'configuracao',
      label: 'Configuração do Site',
      icon: Settings,
      children: [
        { id: 'hero', label: 'Hero', icon: Sparkles, path: '/dashboard/hero' },
        { id: 'about', label: 'Sobre Mim', icon: User, path: '/dashboard/about' },
        { id: 'scroll', label: 'Scroll', icon: Image, path: '/dashboard/scroll' },
        { id: 'art-process', label: 'Art Process', icon: Palette, path: '/dashboard/art-process' },
        { id: 'testimonials', label: 'Depoimentos', icon: Users, path: '/dashboard/testimonials' },
        { id: 'skills', label: 'Skills', icon: Star, path: '/dashboard/skills' },
        { id: 'contact', label: 'Contato', icon: Mail, path: '/dashboard/contact' },
        { id: 'footer', label: 'Footer', icon: FileText, path: '/dashboard/footer' },
        { id: 'ad-banners', label: 'Anúncios', icon: ImageIcon, path: '/dashboard/ad-banners' },
      ]
    },
    {
      id: 'seguranca',
      label: 'Segurança',
      icon: Shield,
      children: [
        { id: 'credentials', label: 'Credenciais', icon: Key, path: '/dashboard/credentials' },
        { id: 'history', label: 'Histórico de Acessos', icon: Clock, path: '/dashboard/history' },
      ]
    },
  ]

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path && pathname === item.path) return true
    if (item.children) {
      return item.children.some(child => isMenuActive(child))
    }
    return false
  }

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/verify')
        const data = await res.json()

        if (!data.authenticated) {
          router.push('/dashboard/login')
          return
        }

        setUser(data.user)
      } catch {
        router.push('/dashboard/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/dashboard/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    user ? (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed md:static h-screen w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">Dashboard</h1>
              <p className="text-gray-400 text-xs">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isMenuActive(item)
            const isExpanded = expandedMenus.has(item.id)
            
            if (item.children) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/5 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon
                            const isChildActive = pathname === child.path
                            return (
                              <button
                                key={child.id}
                                onClick={() => child.path && router.push(child.path)}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                                  isChildActive
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{child.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }
            
            return (
              <button
                key={item.id}
                onClick={() => item.path && router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-800/50 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  ) : (
    <LoginPage />
  )
  )
}

