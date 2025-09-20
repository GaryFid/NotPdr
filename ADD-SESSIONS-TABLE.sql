-- Добавляем таблицу для управления сессиями и токенами

-- Активные сессии пользователей
CREATE TABLE IF NOT EXISTS _pidr_user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES _pidr_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL, -- хеш JWT токена
    jwt_token_hash VARCHAR(255) NOT NULL, -- хеш самого JWT для безопасности
    device_info JSONB, -- информация об устройстве/браузере
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON _pidr_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON _pidr_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON _pidr_user_sessions(is_active, expires_at);

-- Логи авторизации (для аудита)
CREATE TABLE IF NOT EXISTS _pidr_auth_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES _pidr_users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'token_refresh', 'token_revoke'
    auth_type VARCHAR(50) NOT NULL, -- 'telegram', 'local', 'google', 'vk'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    session_id BIGINT REFERENCES _pidr_user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для логов
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON _pidr_auth_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON _pidr_auth_logs(action, created_at);

-- Функция для очистки истекших сессий (можно вызывать по крону)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE _pidr_user_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Логируем очистку
    INSERT INTO _pidr_auth_logs (user_id, action, auth_type, success, error_message)
    SELECT DISTINCT user_id, 'session_cleanup', 'system', true, 
           'Cleaned ' || deleted_count || ' expired sessions'
    FROM _pidr_user_sessions 
    WHERE expires_at < NOW() AND is_active = false
    LIMIT 1;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения активных сессий пользователя
CREATE OR REPLACE FUNCTION get_user_active_sessions(p_user_id BIGINT)
RETURNS TABLE (
    session_id BIGINT,
    device_info JSONB,
    ip_address INET,
    last_activity TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.device_info, s.ip_address, s.last_activity, s.expires_at
    FROM _pidr_user_sessions s
    WHERE s.user_id = p_user_id 
      AND s.is_active = true 
      AND s.expires_at > NOW()
    ORDER BY s.last_activity DESC;
END;
$$ LANGUAGE plpgsql;
