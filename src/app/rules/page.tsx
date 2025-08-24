'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Users, Star, Crown, AlertTriangle, HelpCircle, ListOrdered, Target, Zap, Shield, Sword, Brain, Trophy, GamepadIcon } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function RulesPage() {
  const [activeSection, setActiveSection] = useState('basics');

  const sections = [
    { id: 'basics', name: 'ОСНОВЫ', icon: Book },
    { id: 'stages', name: 'СТАДИИ', icon: ListOrdered },
    { id: 'strategy', name: 'СТРАТЕГИЯ', icon: Brain },
    { id: 'advanced', name: 'ПРОДВИНУТОЕ', icon: Trophy },
  ];

  const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♠️', '♥️', '♦️', '♣️'];

  return (
    <div className="main-menu-container">
      <div className="main-menu-inner">
        {/* Header */}
        <div className="menu-header">
          <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg border border-red-400 text-red-200 font-semibold text-base hover:bg-red-400/10 transition-all">
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Назад
          </button>
          <span className="menu-title">ПРАВИЛА ИГРЫ</span>
          <div className="w-6"></div>
        </div>
        {/* Section Navigation */}
        <motion.div 
          className="rules-navigation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="nav-grid">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <motion.button
                  key={section.id}
                  className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="nav-icon" />
                  <span className="nav-name">{section.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div 
          className="rules-content"
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeSection === 'basics' && (
            <div className="content-section">
              <div className="rule-card">
                <div className="rule-header">
                  <GamepadIcon className="rule-icon" />
                  <h3 className="rule-title">ОБЗОР ИГРЫ</h3>
                </div>
                <div className="rule-content">
                  <p className="rule-description">
                    <strong>P.I.D.R.</strong> - это увлекательная карточная игра на основе классического "Дурака" с уникальными механиками и стадиями.
                  </p>
                  <div className="rule-points">
                    <div className="rule-point">
                      <Users className="point-icon" />
                      <span><strong>Игроки:</strong> 4-9 человек</span>
                    </div>
                    <div className="rule-point">
                      <Target className="point-icon" />
                      <span><strong>Цель:</strong> Избавиться от всех карт первым</span>
                    </div>
                    <div className="rule-point">
                      <Star className="point-icon" />
                      <span><strong>Карты:</strong> Стандартная колода 52 карты</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <BottomNav />
      </div>
    </div>
  );
} 