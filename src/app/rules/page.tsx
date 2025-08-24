'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Users, Star, Crown, AlertTriangle, ListOrdered, Target, Shield, Brain, GamepadIcon } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

export default function RulesPage() {
  const [activeSection, setActiveSection] = useState('basics');

  const sections = [
    { id: 'basics', name: 'ОСНОВЫ', icon: Book },
    { id: 'stages', name: 'СТАДИИ', icon: ListOrdered },
    { id: 'strategy', name: 'СТРАТЕГИЯ', icon: Brain },
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
                  className={`nav-btn ${activeSection === section.id ? 'active' : ''} ${section.id === 'strategy' ? 'strategy' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: section.id === 'strategy' ? 0.7 : 1.05 }}
                  whileTap={{ scale: section.id === 'strategy' ? 0.63 : 0.95 }}
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
              {/* Game Overview */}
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

              {/* Card Hierarchy */}
              <div className="rule-card">
                <div className="rule-header">
                  <Crown className="rule-icon" />
                  <h3 className="rule-title">ИЕРАРХИЯ КАРТ</h3>
                </div>
                <div className="rule-content">
                  <p className="rule-description">От младшей к старшей:</p>
                  <div className="card-hierarchy">
                    {cardRanks.map((rank, index) => (
                      <span key={rank} className={`hierarchy-card ${rank === 'A' ? 'trump' : ''}`}>
                        {rank}{index < cardRanks.length - 1 && ' → '}
                      </span>
                    ))}
                  </div>
                  <div className="rule-points">
                    <div className="rule-point">
                      <AlertTriangle className="point-icon" />
                      <span><strong>Особое правило:</strong> Двойка (2) может побить только Туз (A)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suits */}
              <div className="rule-card">
                <div className="rule-header">
                  <Shield className="rule-icon" />
                  <h3 className="rule-title">МАСТИ</h3>
                </div>
                <div className="rule-content">
                  <div className="suits-grid">
                    {suits.map((suit, index) => {
                      const suitNames = ['Пики', 'Червы', 'Бубны', 'Трефы'];
                      return (
                        <div key={suit} className="suit-card">
                          <span className="suit-symbol">{suit}</span>
                          <span className="suit-name">{suitNames[index]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="rule-description">
                    В первой стадии масти не важны. Во второй стадии действует правило: <strong>"Пики можно бить только пиками"</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'stages' && (
            <div className="content-section">
              {/* Stage 1 */}
              <div className="rule-card stage-1">
                <div className="rule-header">
                  <div className="stage-number">1</div>
                  <h3 className="rule-title">ПЕРВАЯ СТАДИЯ</h3>
                </div>
                <div className="rule-content">
                  <h4 className="stage-subtitle">Простые правила</h4>
                  <div className="rule-points">
                    <div className="rule-point">
                      <span><strong>Ходы:</strong> Только верхней (открытой) картой</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Бить карты:</strong> Карта должна быть на 1 ранг выше</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Масти:</strong> Не важны в первой стадии</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Переход:</strong> Когда у всех игроков остается по 2 карты</span>
                    </div>
                  </div>
                  <div className="algorithm-box">
                    <h5 className="algorithm-title">Алгоритм хода:</h5>
                    <ol className="algorithm-steps">
                      <li>Выберите верхнюю карту</li>
                      <li>Проверьте: ранг > ранг последней карты на столе</li>
                      <li>Если да - положите карту на стол</li>
                      <li>Если нет - возьмите карту из колоды</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="rule-card stage-2">
                <div className="rule-header">
                  <div className="stage-number">2</div>
                  <h3 className="rule-title">ВТОРАЯ СТАДИЯ</h3>
                </div>
                <div className="rule-content">
                  <h4 className="stage-subtitle">Правила "Дурака"</h4>
                  <div className="rule-points">
                    <div className="rule-point">
                      <span><strong>Ходы:</strong> Любой картой из руки</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Масти:</strong> Действует правило мастей</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Козырь:</strong> Определяется случайно</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>"Последняя!":</strong> Объявлять при одной карте</span>
                    </div>
                  </div>
                  <div className="algorithm-box">
                    <h5 className="algorithm-title">Алгоритм битья:</h5>
                    <ol className="algorithm-steps">
                      <li>Атакующий кладет карту</li>
                      <li>Защищающийся может:</li>
                      <li className="sub-step">• Побить картой старше той же масти</li>
                      <li className="sub-step">• Побить козырем (если атака не козырная)</li>
                      <li className="sub-step">• Взять карты</li>
                      <li>Если побил - может подкинуть карты того же ранга</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="rule-card stage-3">
                <div className="rule-header">
                  <div className="stage-number">3</div>
                  <h3 className="rule-title">ТРЕТЬЯ СТАДИЯ</h3>
                </div>
                <div className="rule-content">
                  <h4 className="stage-subtitle">Финальный раунд</h4>
                  <div className="rule-points">
                    <div className="rule-point">
                      <span><strong>Условие:</strong> Когда остается 2-3 игрока</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Особенности:</strong> Ускоренная игра, дополнительные правила</span>
                    </div>
                    <div className="rule-point">
                      <span><strong>Победа:</strong> Первый игрок без карт побеждает</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'strategy' && (
            <div className="content-section">
              {/* Algorithm Cards */}
              <div className="rule-card algorithm">
                <div className="rule-header">
                  <Brain className="rule-icon" />
                  <h3 className="rule-title">АЛГОРИТМЫ ХОДОВ</h3>
                </div>
                <div className="rule-content">
                  <div className="algorithm-box">
                    <h5 className="algorithm-title">Стадия 1 - Алгоритм:</h5>
                    <ol className="algorithm-steps">
                      <li><strong>Проверить верхнюю карту:</strong> можно ли положить на стол?</li>
                      <li><strong>Если да:</strong> ранг карты > ранг на столе → положить</li>
                      <li><strong>Если нет:</strong> взять карту из колоды</li>
                      <li><strong>Переход хода</strong> к следующему игроку</li>
                    </ol>
                  </div>
                  
                  <div className="algorithm-box">
                    <h5 className="algorithm-title">Стадия 2 - Алгоритм:</h5>
                    <ol className="algorithm-steps">
                      <li><strong>Атака:</strong> выбрать карту для хода</li>
                      <li><strong>Защита:</strong> найти подходящую карту для битья</li>
                      <li><strong>Проверка масти:</strong> та же масть или козырь</li>
                      <li><strong>Проверка ранга:</strong> карта должна быть старше</li>
                      <li><strong>Если нельзя побить:</strong> взять все карты</li>
                      <li><strong>Подкидывание:</strong> карты того же ранга</li>
                    </ol>
                  </div>

                  <div className="algorithm-box">
                    <h5 className="algorithm-title">Логика ИИ:</h5>
                    <ol className="algorithm-steps">
                      <li><strong>Анализ руки:</strong> оценка силы карт</li>
                      <li><strong>Выбор слабейшей:</strong> для атаки</li>
                      <li><strong>Сохранение козырей:</strong> для важных моментов</li>
                      <li><strong>Подсчет карт:</strong> запоминание сыгранных</li>
                      <li><strong>Блокировка:</strong> не дать сходить последней картой</li>
                    </ol>
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