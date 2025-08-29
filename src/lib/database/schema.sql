-- P.I.D.R. Database Schema for Multiplayer
-- Добавляем таблицы к существующей таблице users

-- 1. Система друзей
CREATE TABLE friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Предотвращаем дублирование дружбы
  UNIQUE(user_id, friend_id),
  -- Пользователь не может добавить себя в друзья
  CHECK (user_id != friend_id)
);

-- 2. Реферальная система (расширяем существующую)
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Кто пригласил
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Кого пригласили
  referral_code VARCHAR(10) NOT NULL, -- Код который использовался
  reward_coins INTEGER DEFAULT 100, -- Награда за реферала
  is_rewarded BOOLEAN DEFAULT FALSE, -- Выдана ли награда
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Один пользователь может быть приглашен только один раз
  UNIQUE(referred_id)
);

-- 3. Игровые комнаты для мультиплеера
CREATE TABLE game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL, -- Короткий код для присоединения (ABC123)
  name VARCHAR(100) DEFAULT 'P.I.D.R. Игра',
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  max_players INTEGER DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 9),
  current_players INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  is_private BOOLEAN DEFAULT FALSE, -- Приватная комната (только по коду)
  password VARCHAR(20) NULL, -- Пароль для комнаты (опционально)
  game_settings JSONB DEFAULT '{}', -- Настройки игры
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE NULL,
  finished_at TIMESTAMP WITH TIME ZONE NULL
);

-- 4. Участники игровых комнат
CREATE TABLE room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER, -- Позиция за столом (0-8)
  is_ready BOOLEAN DEFAULT FALSE, -- Готов ли игрок к игре
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Один игрок не может быть в комнате дважды
  UNIQUE(room_id, user_id),
  -- Уникальная позиция в комнате
  UNIQUE(room_id, position)
);

-- 5. История игр (для статистики)
CREATE TABLE game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  players JSONB NOT NULL, -- Массив игроков с результатами
  game_duration INTEGER, -- Длительность в секундах
  total_turns INTEGER,
  game_stage_reached INTEGER DEFAULT 1, -- До какой стадии дошла игра
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Онлайн статус пользователей
CREATE TABLE user_status (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'in_game', 'away', 'offline')),
  current_room_id UUID REFERENCES game_rooms(id) ON DELETE SET NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Приглашения в игру через Telegram
CREATE TABLE game_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitation_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для оптимизации
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_host ON game_rooms(host_id);
CREATE INDEX idx_room_players_room ON room_players(room_id);
CREATE INDEX idx_room_players_user ON room_players(user_id);
CREATE INDEX idx_user_status_status ON user_status(status);
CREATE INDEX idx_game_history_winner ON game_history(winner_id);

-- Функции для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автообновления timestamps
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_rooms_updated_at BEFORE UPDATE ON game_rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_status_updated_at BEFORE UPDATE ON user_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики для безопасности
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Политики безопасности (пользователи видят только свои данные)
CREATE POLICY "Users can view their own friends" ON friends
    FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can manage their own friend requests" ON friends
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view public game rooms" ON game_rooms
    FOR SELECT USING (is_private = FALSE OR host_id = auth.uid());

CREATE POLICY "Users can manage their own rooms" ON game_rooms
    FOR ALL USING (host_id = auth.uid());

-- Функция для генерации кода комнаты
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, ceil(random() * length(chars))::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Дополнительные индексы для game_invitations
CREATE INDEX idx_game_invitations_inviter ON game_invitations(inviter_id);
CREATE INDEX idx_game_invitations_invited ON game_invitations(invited_id);
CREATE INDEX idx_game_invitations_room ON game_invitations(room_id);
CREATE INDEX idx_game_invitations_status ON game_invitations(status);
