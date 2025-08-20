// ИИ для игры в P.I.D.R.

import type { Card, Player } from '../../types/game';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface AIDecision {
  action: 'play_card' | 'draw_card' | 'place_on_target' | 'place_on_self' | 'pass';
  targetPlayerId?: number;
  cardToPlay?: Card;
  confidence: number; // 0-1, насколько ИИ уверен в решении
}

export class AIPlayer {
  private difficulty: AIDifficulty;
  private playerId: number;
  
  constructor(playerId: number, difficulty: AIDifficulty = 'medium') {
    this.playerId = playerId;
    this.difficulty = difficulty;
  }
  
  // Главный метод принятия решения
  makeDecision(
    gameState: {
      players: Player[];
      currentPlayer: number;
      gameStage: 1 | 2 | 3;
      deck: Card[];
      availableTargets: number[];
      revealedDeckCard: Card | null;
      tableStack?: Card[];
      trumpSuit?: string | null;
    }
  ): AIDecision {
    const { gameStage } = gameState;
    
    console.log(`🤖 [AI makeDecision] Игрок ${this.playerId} принимает решение для стадии ${gameStage}`);
    
    let decision: AIDecision;
    switch (gameStage) {
      case 1:
        decision = this.makeStage1Decision(gameState);
        break;
      case 2:
        decision = this.makeStage2Decision(gameState);
        break;
      case 3:
        decision = this.makeStage3Decision(gameState);
        break;
      default:
        decision = { action: 'pass', confidence: 0 };
    }
    
    console.log(`🤖 [AI makeDecision] Игрок ${this.playerId} принял решение:`, decision);
    return decision;
  }
  
  // Решения для 1-й стадии (раскладывание карт)
  private makeStage1Decision(gameState: any): AIDecision {
    const { players, availableTargets, revealedDeckCard } = gameState;
    const currentPlayer = players[this.playerId];
    
    // Если есть открытая карта из колоды
    if (revealedDeckCard) {
      const cardRank = this.getCardRank(revealedDeckCard);
      
      // Логика в зависимости от сложности
      switch (this.difficulty) {
        case 'easy':
          // Простой ИИ - случайный выбор
          if (availableTargets.length > 0) {
            const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            return {
              action: 'place_on_target',
              targetPlayerId: randomTarget,
              confidence: 0.5
            };
          }
          break;
          
        case 'medium':
          // Средний ИИ - старается положить плохие карты противникам
          if (cardRank <= 6 && availableTargets.length > 0) {
            // Кладем слабые карты противникам
            const enemyTargets = availableTargets.filter((id: number) => id !== this.playerId);
            if (enemyTargets.length > 0) {
              const target = enemyTargets[Math.floor(Math.random() * enemyTargets.length)];
              return {
                action: 'place_on_target',
                targetPlayerId: target,
                confidence: 0.7
              };
            }
          } else if (cardRank >= 10) {
            // Хорошие карты себе
            if (this.canPlaceOnSelf(currentPlayer, revealedDeckCard)) {
              return {
                action: 'place_on_self',
                confidence: 0.8
              };
            }
          }
          break;
          
        case 'hard':
          // Сложный ИИ - продвинутая стратегия
          const decision = this.analyzeStage1Situation(gameState);
          if (decision) return decision;
          break;
      }
    }
    
    // По умолчанию берем карту из колоды
    return {
      action: 'draw_card',
      confidence: 0.6
    };
  }
  
  // Решения для 2-й стадии (дурак)
  private makeStage2Decision(gameState: any): AIDecision {
    const { players, tableStack, trumpSuit } = gameState;
    const currentPlayer = players[this.playerId];
    const handCards = currentPlayer.cards.filter((c: Card) => c.open);
    
    console.log(`🤖 [AI Stage2] Анализ ситуации:`);
    console.log(`🤖 [AI Stage2] - tableStack.length: ${tableStack?.length || 0}`);
    console.log(`🤖 [AI Stage2] - handCards.length: ${handCards.length}`);
    console.log(`🤖 [AI Stage2] - trumpSuit: ${trumpSuit}`);
    console.log(`🤖 [AI Stage2] - difficulty: ${this.difficulty}`);
    
    if (!tableStack || tableStack.length === 0) {
      // Начинаем атаку - играем самую слабую карту
      console.log(`🤖 [AI Stage2] Начинаем атаку`);
      const weakestCard = this.findWeakestNonTrumpCard(handCards, trumpSuit) || this.findWeakestCard(handCards, trumpSuit);
      if (weakestCard) {
        console.log(`🤖 [AI Stage2] ✅ Атакуем картой: ${weakestCard.image}`);
        return {
          action: 'play_card',
          cardToPlay: weakestCard,
          confidence: 0.7
        };
      }
    } else {
      // На столе есть карты - пытаемся отбиться
      const attackCard = tableStack[tableStack.length - 1];
      console.log(`🤖 [AI Stage2] Защищаемся от: ${attackCard?.image}`);
      
      const defenseCard = this.findBestDefenseCard(handCards, attackCard, trumpSuit);
      
      if (defenseCard) {
        console.log(`🤖 [AI Stage2] ✅ Отбиваемся картой: ${defenseCard.image}`);
        return {
          action: 'play_card',
          cardToPlay: defenseCard,
          confidence: 0.8
        };
      } else {
        // Не можем отбиться - берем карты
        console.log(`🤖 [AI Stage2] ❌ Не можем отбиться - берем карты со стола`);
        return {
          action: 'draw_card', // В контексте 2-й стадии = takeTableCards
          confidence: 0.9
        };
      }
    }
    
    console.log(`🤖 [AI Stage2] ⚠️ Нет доступных ходов - пропускаем`);
    return { action: 'pass', confidence: 0.3 };
  }
  
  // Решения для 3-й стадии (пеньки)
  private makeStage3Decision(gameState: any): AIDecision {
    const { players, availableTargets, revealedDeckCard } = gameState;
    const currentPlayer = players[this.playerId];
    
    console.log(`🤖 [AI Stage3] Анализ ситуации 3-й стадии:`);
    console.log(`🤖 [AI Stage3] - player.cards.length: ${currentPlayer.cards.length}`);
    console.log(`🤖 [AI Stage3] - player.penki.length: ${currentPlayer.penki?.length || 0}`);
    console.log(`🤖 [AI Stage3] - availableTargets: [${availableTargets.join(', ')}]`);
    console.log(`🤖 [AI Stage3] - revealedDeckCard: ${revealedDeckCard?.image || 'нет'}`);
    
    // В 3-й стадии логика аналогична 1-й стадии:
    // 1. Если есть открытая карта из колоды - анализируем её
    // 2. Если есть ходы из руки - делаем их
    // 3. Если нет ходов - берем из колоды
    
    if (revealedDeckCard) {
      const cardRank = this.getCardRank(revealedDeckCard);
      
      // В 3-й стадии игрок уже опытный, стратегия более агрессивная
      switch (this.difficulty) {
        case 'easy':
          // Простой ИИ - случайный выбор
          if (availableTargets.length > 0) {
            const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            console.log(`🤖 [AI Stage3] Easy: случайный ход на цель ${randomTarget}`);
            return {
              action: 'place_on_target',
              targetPlayerId: randomTarget,
              confidence: 0.6
            };
          }
          break;
          
        case 'medium':
          // Средний ИИ - стратегия "мешать лидерам"
          if (cardRank <= 7 && availableTargets.length > 0) {
            // Находим игрока с наименьшим количеством карт (лидера)
            const enemyTargets = availableTargets.filter((id: number) => id !== this.playerId);
            if (enemyTargets.length > 0) {
              let targetWithFewestCards = enemyTargets[0];
              let fewestCardsCount = players[targetWithFewestCards].cards.length + (players[targetWithFewestCards].penki?.length || 0);
              
              enemyTargets.forEach((targetId: number) => {
                const targetPlayer = players[targetId];
                const totalCards = targetPlayer.cards.length + (targetPlayer.penki?.length || 0);
                if (totalCards < fewestCardsCount) {
                  fewestCardsCount = totalCards;
                  targetWithFewestCards = targetId;
                }
              });
              
              console.log(`🤖 [AI Stage3] Medium: мешаем лидеру (у него ${fewestCardsCount} карт)`);
              return {
                action: 'place_on_target',
                targetPlayerId: targetWithFewestCards,
                confidence: 0.8
              };
            }
          } else if (cardRank >= 10) {
            // Хорошие карты себе
            if (this.canPlaceOnSelf(currentPlayer, revealedDeckCard)) {
              console.log(`🤖 [AI Stage3] Medium: хорошую карту себе`);
              return {
                action: 'place_on_self',
                confidence: 0.9
              };
            }
          }
          break;
          
        case 'hard':
          // Сложный ИИ - продвинутая стратегия
          const decision = this.analyzeStage3Situation(gameState);
          if (decision) return decision;
          break;
      }
    }
    
    // Если есть доступные цели из руки
    if (availableTargets.length > 0) {
      const target = availableTargets[0];
      console.log(`🤖 [AI Stage3] Ход из руки на цель ${target}`);
      return {
        action: 'place_on_target',
        targetPlayerId: target,
        confidence: 0.7
      };
    }
    
    // По умолчанию берем карту из колоды
    console.log(`🤖 [AI Stage3] Берем карту из колоды`);
    return {
      action: 'draw_card',
      confidence: 0.6
    };
  }
  
  // Вспомогательные методы
  private getCardRank(card: Card): number {
    if (!card.image) return 0;
    
    const imageName = card.image.split('/').pop()?.toLowerCase() || '';
    
    if (imageName.includes('2_')) return 2;
    if (imageName.includes('3_')) return 3;
    if (imageName.includes('4_')) return 4;
    if (imageName.includes('5_')) return 5;
    if (imageName.includes('6_')) return 6;
    if (imageName.includes('7_')) return 7;
    if (imageName.includes('8_')) return 8;
    if (imageName.includes('9_')) return 9;
    if (imageName.includes('10_')) return 10;
    if (imageName.includes('jack_')) return 11;
    if (imageName.includes('queen_')) return 12;
    if (imageName.includes('king_')) return 13;
    if (imageName.includes('ace_')) return 14;
    
    return 0;
  }
  
  private canPlaceOnSelf(player: Player, card: Card): boolean {
    const topCard = player.cards[player.cards.length - 1];
    if (!topCard) return true;
    
    const cardRank = this.getCardRank(card);
    const topRank = this.getCardRank(topCard);
    
    return cardRank > topRank;
  }
  
  private analyzeStage1Situation(gameState: any): AIDecision | null {
    const { players, availableTargets, revealedDeckCard } = gameState;
    
    // Анализируем игровую ситуацию
    const threats = this.identifyThreats(players);
    const opportunities = this.identifyOpportunities(players);
    
    // Принимаем решение на основе анализа
    if (threats.length > 0 && revealedDeckCard) {
      const cardRank = this.getCardRank(revealedDeckCard);
      
      // Если карта слабая, кладем самому сильному противнику
      if (cardRank <= 6) {
        const strongestThreat = threats[0];
        if (availableTargets.includes(strongestThreat)) {
          return {
            action: 'place_on_target',
            targetPlayerId: strongestThreat,
            confidence: 0.9
          };
        }
      }
    }
    
    return null;
  }
  
  private analyzeStage3Situation(gameState: any): AIDecision | null {
    const { players, availableTargets, revealedDeckCard } = gameState;
    
    console.log(`🤖 [AI Stage3 Hard] Продвинутый анализ ситуации`);
    
    // В 3-й стадии критически важно блокировать игроков близких к победе
    const criticalThreats = this.identifyCriticalThreats(players);
    
    if (criticalThreats.length > 0 && revealedDeckCard) {
      const cardRank = this.getCardRank(revealedDeckCard);
      
      // Если есть игрок с 1-2 картами - мешаем ему любой картой
      const closestToVictory = criticalThreats[0];
      if (availableTargets.includes(closestToVictory)) {
        console.log(`🤖 [AI Stage3 Hard] КРИТИЧЕСКАЯ УГРОЗА! Блокируем игрока ${closestToVictory}`);
        return {
          action: 'place_on_target',
          targetPlayerId: closestToVictory,
          confidence: 1.0 // Максимальная уверенность
        };
      }
    }
    
    // Если нет критических угроз, применяем обычную стратегию
    return this.analyzeStage1Situation(gameState);
  }
  
  private identifyCriticalThreats(players: Player[]): number[] {
    // Игроки с минимальным количеством карт (близкие к победе)
    return players
      .filter(p => parseInt(p.id) !== this.playerId)
      .filter(p => {
        const totalCards = p.cards.length + (p.penki?.length || 0);
        return totalCards <= 2; // Критическая угроза - 2 или меньше карт
      })
      .sort((a, b) => {
        const aCards = a.cards.length + (a.penki?.length || 0);
        const bCards = b.cards.length + (b.penki?.length || 0);
        return aCards - bCards; // Сортируем по возрастанию количества карт
      })
      .map(p => parseInt(p.id));
  }
  
  private identifyThreats(players: Player[]): number[] {
    // Определяем игроков, которые представляют угрозу
    return players
      .filter(p => parseInt(p.id) !== this.playerId)
      .sort((a, b) => {
        // Сортируем по количеству хороших карт
        const aScore = this.evaluatePlayerPosition(a);
        const bScore = this.evaluatePlayerPosition(b);
        return bScore - aScore;
      })
      .map(p => parseInt(p.id));
  }
  
  private identifyOpportunities(players: Player[]): number[] {
    // Определяем слабых игроков
    return players
      .filter(p => parseInt(p.id) !== this.playerId)
      .filter(p => p.cards.length < 3) // Мало карт
      .map(p => parseInt(p.id));
  }
  
  private evaluatePlayerPosition(player: Player): number {
    let score = 0;
    for (const card of player.cards) {
      if (card.open) {
        score += this.getCardRank(card);
      }
    }
    return score;
  }
  
  private findWeakestNonTrumpCard(cards: Card[], trumpSuit: string | null): Card | null {
    // Ищем самую слабую некозырную карту для атаки
    const nonTrumpCards = cards.filter(c => !this.isTrump(c, trumpSuit));
    if (nonTrumpCards.length === 0) return null;
    
    return nonTrumpCards.reduce((weakest, card) => {
      return this.getCardRank(card) < this.getCardRank(weakest) ? card : weakest;
    });
  }
  
  private findWeakestCard(cards: Card[], trumpSuit: string | null): Card | null {
    const nonTrumpCards = cards.filter(c => !this.isTrump(c, trumpSuit));
    
    if (nonTrumpCards.length > 0) {
      return nonTrumpCards.reduce((weakest, card) => {
        return this.getCardRank(card) < this.getCardRank(weakest) ? card : weakest;
      });
    }
    
    // Если только козыри, выбираем самый слабый
    if (cards.length > 0) {
      return cards.reduce((weakest, card) => {
        return this.getCardRank(card) < this.getCardRank(weakest) ? card : weakest;
      });
    }
    
    return null;
  }
  
  private findBestDefenseCard(
    handCards: Card[], 
    attackCard: Card, 
    trumpSuit: string | null
  ): Card | null {
    const attackRank = this.getCardRank(attackCard);
    const attackSuit = this.getCardSuit(attackCard);
    
    console.log(`🤖 [findBestDefenseCard] Ищем защиту от: ${attackCard.image} (${attackSuit}, ранг ${attackRank})`);
    console.log(`🤖 [findBestDefenseCard] Козырь: ${trumpSuit}`);
    
    // Подходящие карты для защиты
    const validDefenseCards: Card[] = [];
    
    handCards.forEach(card => {
      const cardRank = this.getCardRank(card);
      const cardSuit = this.getCardSuit(card);
      
      // Проверяем правила битья (как в gameStore.canBeatCard)
      let canBeat = false;
      
      // 1. ОСОБОЕ ПРАВИЛО: "Пики только Пикями!"
      if (attackSuit === 'spades' && cardSuit !== 'spades') {
        canBeat = false;
      }
      // 2. Бить той же мастью старшей картой
      else if (attackSuit === cardSuit && cardRank > attackRank) {
        canBeat = true;
      }
      // 3. Бить козырем некозырную карту (НО НЕ ПИКУ!)
      else if (trumpSuit && cardSuit === trumpSuit && attackSuit !== trumpSuit && attackSuit !== 'spades') {
        canBeat = true;
      }
      
      if (canBeat) {
        console.log(`🤖 [findBestDefenseCard] ✅ Подходящая карта: ${card.image} (${cardSuit}, ранг ${cardRank})`);
        validDefenseCards.push(card);
      } else {
        console.log(`🤖 [findBestDefenseCard] ❌ Не подходит: ${card.image} (${cardSuit}, ранг ${cardRank})`);
      }
    });
    
    if (validDefenseCards.length === 0) {
      console.log(`🤖 [findBestDefenseCard] Нет подходящих карт для защиты`);
      return null;
    }
    
    // Выбираем стратегию в зависимости от сложности AI
    let bestCard: Card;
    
    switch (this.difficulty) {
      case 'easy':
        // Простой AI - случайная подходящая карта
        bestCard = validDefenseCards[Math.floor(Math.random() * validDefenseCards.length)];
        break;
        
      case 'medium':
        // Средний AI - минимальная подходящая карта
        bestCard = validDefenseCards.reduce((min, card) => {
          return this.getCardRank(card) < this.getCardRank(min) ? card : min;
        });
        break;
        
      case 'hard':
        // Сложный AI - продвинутая стратегия (пока тоже минимальная)
        bestCard = validDefenseCards.reduce((min, card) => {
          return this.getCardRank(card) < this.getCardRank(min) ? card : min;
        });
        break;
        
      default:
        bestCard = validDefenseCards[0];
    }
    
    console.log(`🤖 [findBestDefenseCard] Выбранная карта: ${bestCard.image}`);
    return bestCard;
  }
  
  private getCardSuit(card: Card): string {
    const imageName = card.image?.split('/').pop()?.toLowerCase() || '';
    
    if (imageName.includes('clubs')) return 'clubs';
    if (imageName.includes('diamonds')) return 'diamonds';
    if (imageName.includes('hearts')) return 'hearts';
    if (imageName.includes('spades')) return 'spades';
    
    return 'unknown';
  }
  
  private isTrump(card: Card, trumpSuit: string | null): boolean {
    if (!trumpSuit) return false;
    return this.getCardSuit(card) === trumpSuit;
  }
  
  // Задержка для имитации размышления
  async makeDecisionWithDelay(gameState: any): Promise<AIDecision> {
    // Задержка зависит от сложности
    const delays = {
      easy: 500 + Math.random() * 1000,
      medium: 1000 + Math.random() * 1500,
      hard: 1500 + Math.random() * 2000
    };
    
    const delay = delays[this.difficulty];
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.makeDecision(gameState));
      }, delay);
    });
  }
}
