'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  BarChart3, Users, Globe, TrendingUp, Eye,
  Loader2, MapPin, Calendar, FileText
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  totalVisits: number
  uniqueIPs: number
  uniqueCountries: number
  topCountries: { country: string; count: number }[]
  dailyVisits: { date: string; visits: number }[]
  topPages: { path: string; count: number }[]
  period: string
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function DashboardOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function loadAnalytics() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/visits?period=${period}`)
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    {
      label: 'Total de Visitas',
      value: analytics?.totalVisits || 0,
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'IPs Únicos',
      value: analytics?.uniqueIPs || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Países',
      value: analytics?.uniqueCountries || 0,
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Taxa de Crescimento',
      value: '+12%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
          <p className="text-gray-400">Estatísticas e análises do seu portfólio</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
          {[
            { value: '7d', label: '7 dias' },
            { value: '30d', label: '30 dias' },
            { value: '1y', label: '1 ano' },
            { value: 'all', label: 'Tudo' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === p.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitas por Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Visitas por Dia</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.dailyVisits || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Países */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Top Países</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.topCountries.slice(0, 6) || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(analytics?.topCountries.slice(0, 6) || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Países (Bar) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Visitas por País</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.topCountries.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="country"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Páginas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Páginas Mais Visitadas</h2>
          </div>
          <div className="space-y-3">
            {analytics?.topPages.slice(0, 10).map((page, index) => (
              <div key={page.path} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-300 font-medium">{page.path || '/'}</span>
                </div>
                <span className="text-purple-400 font-bold">{page.count}</span>
              </div>
            ))}
            {(!analytics?.topPages || analytics.topPages.length === 0) && (
              <p className="text-gray-400 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
