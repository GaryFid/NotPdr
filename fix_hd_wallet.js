// Скрипт для создания таблицы HD кошельков в Supabase
const { createClient } = require('@supabase/supabase-js');

// Загружаем переменные окружения
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Не найдены SUPABASE_URL или SUPABASE_ANON_KEY в .env файле');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createHDWalletsTable() {
  console.log('🔧 Создаем таблицу HD кошельков...');

  const createTableSQL = `
    -- Создание таблицы HD кошельков
    CREATE TABLE IF NOT EXISTS _pidr_hd_wallets (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        coin VARCHAR(10) NOT NULL,
        address VARCHAR(255) NOT NULL,
        derivation_path VARCHAR(100) NOT NULL,
        address_index INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Уникальные индексы
    CREATE UNIQUE INDEX IF NOT EXISTS idx_pidr_hd_user_coin 
    ON _pidr_hd_wallets (user_id, coin);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_pidr_hd_coin_index 
    ON _pidr_hd_wallets (coin, address_index);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_pidr_hd_address 
    ON _pidr_hd_wallets (coin, address);

    -- Индексы для быстрого поиска
    CREATE INDEX IF NOT EXISTS idx_pidr_hd_user_id 
    ON _pidr_hd_wallets (user_id);

    CREATE INDEX IF NOT EXISTS idx_pidr_hd_coin 
    ON _pidr_hd_wallets (coin);

    CREATE INDEX IF NOT EXISTS idx_pidr_hd_created_at 
    ON _pidr_hd_wallets (created_at DESC);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });

    if (error) {
      console.error('❌ Ошибка создания таблицы:', error);
      
      // Пробуем альтернативный способ - через REST API
      console.log('🔄 Пробуем создать таблицу через REST API...');
      
      const { data: testData, error: testError } = await supabase
        .from('_pidr_hd_wallets')
        .select('*')
        .limit(1);

      if (testError && testError.code === '42P01') {
        console.log('✅ Таблица не существует, это нормально для первого запуска');
        console.log('📋 Выполните этот SQL в Supabase Dashboard:');
        console.log(createTableSQL);
      } else if (testError) {
        console.error('❌ Ошибка проверки таблицы:', testError);
      } else {
        console.log('✅ Таблица _pidr_hd_wallets уже существует!');
      }
    } else {
      console.log('✅ Таблица HD кошельков создана успешно!');
    }

    // Проверяем что таблица работает
    const { data: testInsert, error: insertError } = await supabase
      .from('_pidr_hd_wallets')
      .insert([{
        user_id: 'test_user_123',
        coin: 'TON',
        address: 'UQDtest_address_123',
        derivation_path: "m/44'/607'/0'/0/0",
        address_index: 0
      }])
      .select();

    if (insertError) {
      console.error('❌ Ошибка тестовой записи:', insertError);
    } else {
      console.log('✅ Тестовая запись создана:', testInsert);
      
      // Удаляем тестовую запись
      await supabase
        .from('_pidr_hd_wallets')
        .delete()
        .eq('user_id', 'test_user_123');
      
      console.log('🧹 Тестовая запись удалена');
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

// Запускаем создание таблицы
createHDWalletsTable();
