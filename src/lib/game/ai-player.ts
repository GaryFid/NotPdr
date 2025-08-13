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
    
    switch (gameStage) {
      case 1:
        return this.makeStage1Decision(gameState);
      case 2:
        return this.makeStage2Decision(gameState);
      case 3:
        return this.makeStage3Decision(gameState);
      default:
        return { action: 'pass', confidence: 0 };
    }
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
    
    if (!tableStack || tableStack.length === 0) {
      // Начинаем атаку
      const weakestCard = this.findWeakestCard(handCards, trumpSuit);
      if (weakestCard) {
        return {
          action: 'play_card',
          cardToPlay: weakestCard,
          confidence: 0.7
        };
      }
    } else {
      // Защищаемся
      const attackCard = tableStack[tableStack.length - 1];
      const defenseCard = this.findBestDefenseCard(handCards, attackCard, trumpSuit);
      
      if (defenseCard) {
        return {
          action: 'play_card',
          cardToPlay: defenseCard,
          confidence: 0.8
        };
      } else {
        // Не можем отбиться - берем карты
        return {
          action: 'draw_card',
          confidence: 0.9
        };
      }
    }
    
    return { action: 'pass', confidence: 0.3 };
  }
  
  // Решения для 3-й стадии (пеньки)
  private makeStage3Decision(gameState: any): AIDecision {
    // Похожая логика на 1-ю стадию, но с пеньками
    return this.makeStage1Decision(gameState);
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
    
    // Ищем карты той же масти
    const sameSuitCards = handCards.filter(c => 
      this.getCardSuit(c) === attackSuit && this.getCardRank(c) > attackRank
    );
    
    if (sameSuitCards.length > 0) {
      // Выбираем минимальную подходящую карту
      return sameSuitCards.reduce((min, card) => {
        return this.getCardRank(card) < this.getCardRank(min) ? card : min;
      });
    }
    
    // Если нет карт той же масти, ищем козыри
    if (trumpSuit && attackSuit !== trumpSuit) {
      const trumpCards = handCards.filter(c => this.isTrump(c, trumpSuit));
      if (trumpCards.length > 0) {
        // Выбираем минимальный козырь
        return trumpCards.reduce((min, card) => {
          return this.getCardRank(card) < this.getCardRank(min) ? card : min;
        });
      }
    }
    
    return null;
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
