'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaHistory,
  FaWallet,
  FaExchangeAlt,
  FaCreditCard,
  FaGift,
  FaTrophy,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

interface User {
  id: string;
  username: string;
  firstName: string;
  coins: number;
  rating: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'game_win' | 'game_loss' | 'bonus';
  description: string;
  created_at: string;
  balance_after: number;
}

interface GameWalletProps {
  user?: User;
  onBalanceUpdate?: (newBalance: number) => void;
}

export default function GameWallet({ user, onBalanceUpdate }: GameWalletProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'history' | 'exchange'>('main');
  const [balance, setBalance] = useState(user?.coins || 0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Загружаем данные пользователя и транзакции
  useEffect(() => {
    loadUserData();
    loadTransactions();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Получаем актуальный баланс из базы данных
        const response = await fetch('/api/pidr-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_user_balance',
            userId: parsedUser.telegramId || parsedUser.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const actualBalance = data.balance || 0;
            setBalance(actualBalance);
            
            // Обновляем localStorage с актуальным балансом
            parsedUser.coins = actualBalance;
            localStorage.setItem('user', JSON.stringify(parsedUser));
            
            onBalanceUpdate?.(actualBalance);
          } else {
            // Fallback к данным из localStorage
            setBalance(parsedUser.coins || 0);
          }
        } else {
          // Fallback к данным из localStorage
          setBalance(parsedUser.coins || 0);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      // Fallback к данным из localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setBalance(parsedUser.coins || 0);
      }
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      const response = await fetch('/api/pidr-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_transactions',
          userId: user.telegramId || user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions || []);
        } else {
          console.error('Ошибка получения транзакций:', data.error);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount <= 0) {
      alert('Введите корректную сумму для пополнения');
      return;
    }

    try {
      setLoading(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Пользователь не найден');
        return;
      }
      
      const currentUser = JSON.parse(userData);
      
      // Создаем транзакцию через API
      const response = await fetch('/api/pidr-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          userId: currentUser.telegramId || currentUser.id,
          amount: amount,
          transactionType: 'deposit',
          description: 'Пополнение баланса'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newBalance = result.newBalance;
        setBalance(newBalance);
        setDepositAmount('');
        
        // Обновляем данные в localStorage
        currentUser.coins = newBalance;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        onBalanceUpdate?.(newBalance);
        
        // Перезагружаем транзакции
        loadTransactions();
        
        alert(`Баланс успешно пополнен на ${amount} монет!`);
      } else {
        throw new Error(result.error || 'Ошибка пополнения');
      }
      
    } catch (error) {
      console.error('Ошибка пополнения:', error);
      alert('Ошибка пополнения баланса: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Введите корректную сумму для вывода');
      return;
    }

    if (amount > balance) {
      alert('Недостаточно средств на балансе');
      return;
    }

    try {
      setLoading(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Пользователь не найден');
        return;
      }
      
      const currentUser = JSON.parse(userData);
      
      // Создаем транзакцию через API
      const response = await fetch('/api/pidr-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          userId: currentUser.telegramId || currentUser.id,
          amount: -amount, // Отрицательное значение для вывода
          transactionType: 'withdrawal',
          description: 'Вывод средств'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newBalance = result.newBalance;
        setBalance(newBalance);
        setWithdrawAmount('');
        
        // Обновляем данные в localStorage
        currentUser.coins = newBalance;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        onBalanceUpdate?.(newBalance);
        
        // Перезагружаем транзакции
        loadTransactions();
        
        alert(`Успешно выведено ${amount} монет!`);
      } else {
        throw new Error(result.error || 'Ошибка вывода');
      }
      
    } catch (error) {
      console.error('Ошибка вывода:', error);
      alert('Ошибка вывода средств: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <FaArrowUp className="text-green-400" />;
      case 'withdrawal': return <FaArrowDown className="text-red-400" />;
      case 'purchase': return <FaShoppingCart className="text-blue-400" />;
      case 'game_win': return <FaTrophy className="text-yellow-400" />;
      case 'game_loss': return <FaMinus className="text-red-400" />;
      case 'bonus': return <FaGift className="text-purple-400" />;
      default: return <FaCoins className="text-yellow-400" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-400' : 'text-red-400';
  };
  
  const handleDailyBonus = async () => {
    try {
      setLoading(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Пользователь не найден');
        return;
      }
      
      const currentUser = JSON.parse(userData);
      
      // Проверяем, получал ли пользователь бонус сегодня
      const lastBonus = localStorage.getItem('lastDailyBonus');
      const today = new Date().toDateString();
      
      if (lastBonus === today) {
        alert('Ежедневный бонус уже получен сегодня! Приходите завтра!');
        return;
      }
      
      // Создаем транзакцию бонуса
      const response = await fetch('/api/pidr-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          userId: currentUser.telegramId || currentUser.id,
          amount: 100,
          transactionType: 'bonus',
          description: 'Ежедневный бонус'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newBalance = result.newBalance;
        setBalance(newBalance);
        
        // Обновляем данные в localStorage
        currentUser.coins = newBalance;
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('lastDailyBonus', today);
        
        onBalanceUpdate?.(newBalance);
        
        // Перезагружаем транзакции
        loadTransactions();
        
        alert('🎉 Получен ежедневный бонус +100 монет!');
      } else {
        throw new Error(result.error || 'Ошибка получения бонуса');
      }
      
    } catch (error) {
      console.error('Ошибка получения бонуса:', error);
      alert('Ошибка получения бонуса: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriend = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Пользователь не найден');
        return;
      }
      
      const currentUser = JSON.parse(userData);
      
      // Генерируем реферальную ссылку
      const referralCode = currentUser.id || 'player_' + Date.now();
      const gameUrl = window.location.origin;
      const inviteUrl = `${gameUrl}?ref=${referralCode}`;
      
      // Если мы в Telegram WebApp, используем Telegram Share API
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const inviteText = `🎮 Присоединяйся к игре P.I.D.R.!\n\n` +
                          `Получи +500 монет за регистрацию по моей ссылке!\n\n` +
                          `${inviteUrl}`;
        
        if (typeof tg.openTelegramLink === 'function') {
          tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(inviteText)}`);
        } else {
          // Fallback для старых версий Telegram
          window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(inviteText)}`, '_blank');
        }
      } else {
        // Fallback - копируем в буфер обмена
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(inviteUrl);
          alert(`Реферальная ссылка скопирована в буфер обмена!\n\n${inviteUrl}\n\nПоделитесь ей с друзьями и получите +500 монет за каждого!`);
        } else {
          // Показываем ссылку для ручного копирования
          prompt('Скопируйте эту ссылку и поделитесь с друзьями:', inviteUrl);
        }
      }
      
    } catch (error) {
      console.error('Ошибка создания приглашения:', error);
      alert('Ошибка создания приглашения: ' + (error as Error).message);
    }
  };

  const checkBonusAvailability = () => {
    const lastBonus = localStorage.getItem('lastDailyBonus');
    const today = new Date().toDateString();
    return lastBonus !== today;
  };

  return (
    <div className="game-wallet-container">
      {/* Баланс - главная карточка */}
      <motion.div 
        className="balance-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="balance-header">
          <FaWallet className="balance-icon" />
          <span className="balance-title">Игровой кошелек</span>
        </div>
        
        <div className="balance-amount">
          <FaCoins className="coin-icon" />
          <span className="amount-text">{balance.toLocaleString()}</span>
          <span className="currency">монет</span>
        </div>

        <div className="wallet-id">
          <span>ID кошелька: #{user?.id?.slice(-8) || 'XXXXXXXX'}</span>
        </div>
      </motion.div>

      {/* Навигационные вкладки */}
      <motion.div 
        className="wallet-tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button
          onClick={() => setActiveTab('main')}
          className={`tab-button ${activeTab === 'main' ? 'active' : ''}`}
        >
          <FaWallet />
          <span>Основное</span>
        </button>
        
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
        >
          <FaHistory />
          <span>История</span>
        </button>
        
        <button
          onClick={() => setActiveTab('exchange')}
          className={`tab-button ${activeTab === 'exchange' ? 'active' : ''}`}
        >
          <FaExchangeAlt />
          <span>Обмен</span>
        </button>
      </motion.div>

      {/* Основной контент */}
      <AnimatePresence mode="wait">
        {activeTab === 'main' && (
          <motion.div
            key="main"
            className="tab-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Кнопки действий */}
            <div className="action-buttons">
              <motion.button
                className="action-button deposit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const amount = prompt('Введите сумму для пополнения:');
                  if (amount) {
                    setDepositAmount(amount);
                    handleDeposit();
                  }
                }}
                disabled={loading}
              >
                <FaPlus className="action-icon" />
                <span>Пополнить</span>
              </motion.button>

              <motion.button
                className="action-button withdraw"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const amount = prompt('Введите сумму для вывода:');
                  if (amount) {
                    setWithdrawAmount(amount);
                    handleWithdraw();
                  }
                }}
                disabled={loading}
              >
                <FaMinus className="action-icon" />
                <span>Вывод</span>
              </motion.button>

              <motion.button
                className="action-button buy"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Переход в магазин
                  window.location.href = '/shop';
                }}
              >
                <FaShoppingCart className="action-icon" />
                <span>Купить</span>
              </motion.button>
            </div>

            {/* Быстрые действия */}
            <div className="quick-actions">
              <h3 className="section-title">Быстрые действия</h3>
              
              <div className="quick-action-item">
                <FaGift className="quick-icon" />
                <div className="quick-text">
                  <span className="quick-title">Ежедневный бонус</span>
                  <span className="quick-desc">+100 монет каждый день</span>
                </div>
                <button 
                  className={`quick-button ${!checkBonusAvailability() ? 'disabled' : ''}`}
                  onClick={handleDailyBonus}
                  disabled={loading || !checkBonusAvailability()}
                >
                  {checkBonusAvailability() ? 'Получить' : 'Получено'}
                </button>
              </div>

              <div className="quick-action-item">
                <FaTrophy className="quick-icon" />
                <div className="quick-text">
                  <span className="quick-title">Пригласить друга</span>
                  <span className="quick-desc">+500 монет за приглашение</span>
                </div>
                <button 
                  className="quick-button"
                  onClick={handleInviteFriend}
                  disabled={loading}
                >
                  Пригласить
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            className="tab-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="section-title">История транзакций</h3>
            
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <FaHistory className="empty-icon" />
                <p>Пока нет транзакций</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    className="transaction-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="transaction-info">
                      <span className="transaction-desc">{transaction.description}</span>
                      <span className="transaction-date">
                        {new Date(transaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className={`transaction-amount ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                      <FaCoins className="mini-coin" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'exchange' && (
          <motion.div
            key="exchange"
            className="tab-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="section-title">Криптообмен</h3>
            
            <div className="exchange-rates">
              <div className="rate-item">
                <span>1 TON = 1000 монет</span>
                <button className="exchange-button">Обменять</button>
              </div>
              
              <div className="rate-item">
                <span>1 USDT = 800 монет</span>
                <button className="exchange-button">Обменять</button>
              </div>
              
              <div className="rate-item">
                <span>0.001 ETH = 1200 монет</span>
                <button className="exchange-button">Обменять</button>
              </div>
            </div>
            
            <div className="exchange-info">
              <p>Минимальная сумма обмена: 100 монет</p>
              <p>Комиссия: 2% от суммы</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .game-wallet-container {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 20px;
          font-family: inherit;
        }

        .balance-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 2px solid #ffd700;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .balance-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.1) 50%, transparent 70%);
          pointer-events: none;
        }

        .balance-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .balance-icon {
          font-size: 24px;
          color: #ffd700;
        }

        .balance-title {
          font-size: 18px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .balance-amount {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .coin-icon {
          font-size: 32px;
          color: #ffd700;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
        }

        .amount-text {
          font-size: 36px;
          font-weight: 700;
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .currency {
          font-size: 18px;
          color: #94a3b8;
          margin-left: auto;
        }

        .wallet-id {
          font-size: 14px;
          color: #64748b;
          text-align: center;
        }

        .wallet-tabs {
          display: flex;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 16px;
          padding: 4px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #ffd700 0%, #ffb900 100%);
          color: #0f172a;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        }

        .tab-button:hover:not(.active) {
          background: rgba(255, 215, 0, 0.1);
          color: #ffd700;
        }

        .tab-content {
          min-height: 300px;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-button.deposit {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
        }

        .action-button.withdraw {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .action-button.buy {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          font-size: 24px;
        }

        .quick-actions {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
        }

        .quick-action-item:last-child {
          border-bottom: none;
        }

        .quick-icon {
          font-size: 24px;
          color: #ffd700;
        }

        .quick-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .quick-title {
          font-weight: 600;
          color: #e2e8f0;
        }

        .quick-desc {
          font-size: 14px;
          color: #94a3b8;
        }

        .quick-button {
          padding: 8px 16px;
          background: linear-gradient(135deg, #ffd700 0%, #ffb900 100%);
          color: #0f172a;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        }

        .quick-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .transaction-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 215, 0, 0.1);
        }

        .transaction-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .transaction-desc {
          font-weight: 600;
          color: #e2e8f0;
        }

        .transaction-date {
          font-size: 12px;
          color: #94a3b8;
        }

        .transaction-amount {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          font-size: 16px;
        }

        .mini-coin {
          font-size: 14px;
          color: #ffd700;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }

        .exchange-rates {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .rate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .exchange-button {
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .exchange-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .exchange-info {
          padding: 16px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }

        .exchange-info p {
          margin: 4px 0;
          color: #e2e8f0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
