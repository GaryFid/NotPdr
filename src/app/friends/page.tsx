'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Search, Check, X, User, Users, Gamepad2 } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const onlineFriends = [
    { id: 1, name: 'Shadow', status: 'В игре', avatar: '🎮', lastSeen: null },
    { id: 2, name: 'Phoenix', status: 'В сети', avatar: '🔥', lastSeen: null }
  ];
  
  const allFriends = [
    { id: 3, name: 'Tiger', status: 'Был(а) 2 часа назад', avatar: '🐅', lastSeen: '2 часа назад' },
    { id: 4, name: 'Wolf', status: 'Был(а) вчера', avatar: '🐺', lastSeen: 'вчера' }
  ];
  
  const friendRequests = [
    { id: 5, name: 'Dragon', message: 'Хочет добавить вас в друзья', avatar: '🐉' }
  ];
  
  const suggestedFriends = [
    { id: 6, name: 'Eagle', mutualFriends: 3, avatar: '🦅' },
    { id: 7, name: 'Falcon', mutualFriends: 1, avatar: '🦅' }
  ];

  return (
    <div className="main-menu-container">
      <div className="main-menu-inner">
        {/* Header */}
        <div className="menu-header">
          <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg border border-red-400 text-red-200 font-semibold text-base hover:bg-red-400/10 transition-all">
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Назад
          </button>
          <span className="menu-title">ДРУЗЬЯ</span>
          <button className="friends-add-btn">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <motion.div 
          className="friends-search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="search-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Поиск друзей..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </motion.div>

        {/* Online Friends */}
        <motion.div 
          className="friends-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="friends-section-title">
            <span className="online-indicator">🟢</span>
            ОНЛАЙН ({onlineFriends.length})
          </h3>
          <div className="friends-list">
            {onlineFriends.map((friend, index) => (
              <motion.div 
                key={friend.id}
                className="friend-card online"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="friend-avatar">
                  <span className="friend-avatar-emoji">{friend.avatar}</span>
                </div>
                <div className="friend-info">
                  <h4 className="friend-name">{friend.name}</h4>
                  <p className={`friend-status ${friend.status === 'В игре' ? 'in-game' : 'online'}`}>
                    {friend.status}
                  </p>
                </div>
                <motion.button 
                  className="friend-action-btn play"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Gamepad2 className="action-icon" />
                  Играть
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Friends */}
        <motion.div 
          className="friends-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="friends-section-title">
            <Users className="section-icon" />
            ВСЕ ДРУЗЬЯ ({allFriends.length})
          </h3>
          <div className="friends-list">
            {allFriends.map((friend, index) => (
              <motion.div 
                key={friend.id}
                className="friend-card offline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="friend-avatar">
                  <span className="friend-avatar-emoji">{friend.avatar}</span>
                </div>
                <div className="friend-info">
                  <h4 className="friend-name">{friend.name}</h4>
                  <p className="friend-status offline">{friend.status}</p>
                </div>
                <motion.button 
                  className="friend-action-btn profile"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="action-icon" />
                  Профиль
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Friend Requests */}
        <motion.div 
          className="friends-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="friends-section-title">
            <UserPlus className="section-icon" />
            ЗАПРОСЫ В ДРУЗЬЯ ({friendRequests.length})
          </h3>
          <div className="friends-list">
            {friendRequests.map((request, index) => (
              <motion.div 
                key={request.id}
                className="friend-card request"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="friend-avatar">
                  <span className="friend-avatar-emoji">{request.avatar}</span>
                </div>
                <div className="friend-info">
                  <h4 className="friend-name">{request.name}</h4>
                  <p className="friend-status request">{request.message}</p>
                </div>
                <div className="request-actions">
                  <motion.button 
                    className="request-btn accept"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="request-icon" />
                  </motion.button>
                  <motion.button 
                    className="request-btn decline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="request-icon" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Suggested Friends */}
        <motion.div 
          className="friends-section suggested"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="friends-section-title">
            <Search className="section-icon" />
            ВОЗМОЖНЫЕ ДРУЗЬЯ
          </h3>
          <div className="suggested-grid">
            {suggestedFriends.map((suggestion, index) => (
              <motion.div 
                key={suggestion.id}
                className="suggested-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="suggested-avatar">
                  <span className="suggested-avatar-emoji">{suggestion.avatar}</span>
                </div>
                <h4 className="suggested-name">{suggestion.name}</h4>
                <p className="suggested-mutual">
                  {suggestion.mutualFriends} общ{suggestion.mutualFriends === 1 ? 'ий друг' : 'их друга'}
                </p>
                <motion.button 
                  className="suggested-add-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus className="add-icon" />
                  Добавить
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <BottomNav />
      </div>
    </div>
  );
}
