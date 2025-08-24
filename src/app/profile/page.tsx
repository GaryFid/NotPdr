'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Users, RotateCcw, User, Star, Award, Target } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function ProfilePage() {
  const [stats, setStats] = useState({
    rating: 1234,
    gamesPlayed: 42,
    wins: 27,
    losses: 15,
    winRate: 65,
    achievements: [
      { id: 1, name: 'Первая победа', description: 'Выиграйте свою первую игру', unlocked: true, icon: Trophy },
      { id: 2, name: 'Ветеран', description: 'Сыграйте 100 игр', unlocked: false, icon: Medal },
      { id: 3, name: 'Мастер', description: 'Выиграйте 50 игр', unlocked: true, icon: Award },
      { id: 4, name: 'Легенда', description: 'Достигните рейтинга 2000', unlocked: false, icon: Star }
    ]
  });

  const handleResetAchievements = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все достижения?')) {
      setStats(prev => ({
        ...prev,
        rating: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        achievements: prev.achievements.map(ach => ({ ...ach, unlocked: false }))
      }));
    }
  };

  return (
    <div className="main-menu-container">
      <div className="main-menu-inner">
        {/* Header */}
        <div className="menu-header">
          <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg border border-red-400 text-red-200 font-semibold text-base hover:bg-red-400/10 transition-all">
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Назад
          </button>
          <span className="menu-title">ПРОФИЛЬ</span>
          <div className="w-6"></div>
        </div>

        {/* Profile Card */}
        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-avatar">
            <User className="profile-avatar-icon" />
          </div>
          <h2 className="profile-name">Игрок</h2>
          <p className="profile-status">🟢 Онлайн</p>
          
          {/* Friends Button */}
          <motion.button 
            className="friends-button"
            onClick={() => window.location.href = '/friends'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="friends-icon" />
            <span>ДРУЗЬЯ</span>
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="stats-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="stats-title">СТАТИСТИКА</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value rating">{stats.rating}</div>
              <div className="stat-label">Рейтинг</div>
            </div>
            <div className="stat-card">
              <div className="stat-value games">{stats.gamesPlayed}</div>
              <div className="stat-label">Игр сыграно</div>
            </div>
            <div className="stat-card">
              <div className="stat-value wins">{stats.wins}</div>
              <div className="stat-label">Побед</div>
            </div>
            <div className="stat-card">
              <div className="stat-value losses">{stats.losses}</div>
              <div className="stat-label">Поражений</div>
            </div>
            <div className="stat-card full-width">
              <div className="stat-value winrate">{stats.winRate}%</div>
              <div className="stat-label">Процент побед</div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div 
          className="achievements-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="achievements-header">
            <h3 className="achievements-title">ДОСТИЖЕНИЯ</h3>
            <motion.button 
              className="reset-button"
              onClick={handleResetAchievements}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="reset-icon" />
              Сбросить
            </motion.button>
          </div>
          
          <div className="achievements-grid">
            {stats.achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div 
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="achievement-icon">
                    <IconComponent className="achievement-icon-svg" />
                  </div>
                  <div className="achievement-info">
                    <h4 className="achievement-name">{achievement.name}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <div className="achievement-badge">✓</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <BottomNav />
      </div>
    </div>
  );
} 