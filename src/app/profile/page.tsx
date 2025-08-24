'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Users, User, Star, Award, Target, Camera, Upload } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function ProfilePage() {
  const [stats, setStats] = useState({
    rating: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    achievements: [
      { id: 1, name: 'Первая победа', description: 'Выиграйте свою первую игру', unlocked: false, icon: Trophy },
      { id: 2, name: 'Ветеран', description: 'Сыграйте 100 игр', unlocked: false, icon: Medal },
      { id: 3, name: 'Мастер', description: 'Выиграйте 50 игр', unlocked: false, icon: Award },
      { id: 4, name: 'Легенда', description: 'Достигните рейтинга 2000', unlocked: false, icon: Star }
    ]
  });

  const [avatarUrl, setAvatarUrl] = useState('😎');

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        return;
      }
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Создаем URL для предварительного просмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        // Сохраняем в localStorage (в будущем будет загрузка на сервер и сохранение в БД)
        localStorage.setItem('userAvatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Загружаем сохраненный аватар при инициализации
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

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
            {avatarUrl.startsWith('data:') || avatarUrl.startsWith('http') ? (
              <img src={avatarUrl} alt="Avatar" className="profile-avatar-image" />
            ) : (
              <span className="profile-avatar-emoji">{avatarUrl}</span>
            )}
          </div>
          <h2 className="profile-name">Игрок</h2>
          <p className="profile-status">🟢 Онлайн</p>
          
          {/* Avatar and Friends Buttons */}
          <div className="profile-buttons">
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

            {/* Change Avatar Button */}
            <motion.div className="avatar-change-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                id="avatar-upload"
              />
              <motion.label
                htmlFor="avatar-upload"
                className="avatar-change-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="avatar-change-icon" />
                <span>АВАТАР</span>
              </motion.label>
            </motion.div>
          </div>
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