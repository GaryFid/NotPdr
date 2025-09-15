import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(req: NextRequest) {
  console.log('🔍 P.I.D.R. Database API - проверка таблиц');
  
  try {
    // Проверяем подключение к Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase не настроен',
        tables: {},
        hasSupabase: false
      });
    }

    console.log('✅ Supabase настроен, проверяем таблицы...');

    // Список таблиц P.I.D.R.
    const pidrTables = [
      '_pidr_users',
      '_pidr_rooms', 
      '_pidr_room_players',
      '_pidr_games',
      '_pidr_game_results',
      '_pidr_coin_transactions',
      '_pidr_friends',
      '_pidr_achievements',
      '_pidr_user_achievements',
      '_pidr_user_settings'
    ];

    const tableStatus: Record<string, any> = {};

    // Проверяем каждую таблицу
    for (const tableName of pidrTables) {
      try {
        // Проверяем существование таблицы и получаем количество записей
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Таблица ${tableName}: ${error.message}`);
          tableStatus[tableName] = {
            exists: false,
            error: error.message,
            count: 0
          };
        } else {
          console.log(`✅ Таблица ${tableName}: ${count} записей`);
          tableStatus[tableName] = {
            exists: true,
            count: count || 0,
            error: null
          };
        }
      } catch (err: any) {
        console.log(`❌ Ошибка проверки ${tableName}:`, err.message);
        tableStatus[tableName] = {
          exists: false,
          error: err.message,
          count: 0
        };
      }
    }

    // Подсчитываем статистику
    const totalTables = pidrTables.length;
    const existingTables = Object.values(tableStatus).filter((t: any) => t.exists).length;
    const missingTables = totalTables - existingTables;

    return NextResponse.json({
      success: true,
      message: `Проверено ${totalTables} таблиц P.I.D.R.`,
      hasSupabase: true,
      tables: tableStatus,
      summary: {
        total: totalTables,
        existing: existingTables,
        missing: missingTables,
        ready: missingTables === 0
      }
    });

  } catch (error: any) {
    console.error('❌ Ошибка P.I.D.R. Database API:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      hasSupabase: false,
      tables: {}
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('🏗️ P.I.D.R. Database API - создание таблиц');
  
  try {
    const { action } = await req.json();
    
    if (action === 'create-tables') {
      // Читаем SQL схему
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'src/lib/database/pidr-schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        return NextResponse.json({
          success: false,
          message: 'Файл схемы не найден'
        }, { status: 404 });
      }

      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Разбиваем на отдельные команды
      const commands = schemaSql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      console.log(`📝 Выполняем ${commands.length} SQL команд...`);

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Выполняем команды по одной
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: command });
          
          if (error) {
            console.log(`❌ Команда ${i + 1}: ${error.message}`);
            results.push({
              command: i + 1,
              success: false,
              error: error.message,
              sql: command.substring(0, 100) + '...'
            });
            errorCount++;
          } else {
            console.log(`✅ Команда ${i + 1}: выполнена`);
            results.push({
              command: i + 1,
              success: true,
              error: null
            });
            successCount++;
          }
        } catch (err: any) {
          console.log(`❌ Команда ${i + 1}: ${err.message}`);
          results.push({
            command: i + 1,
            success: false,
            error: err.message,
            sql: command.substring(0, 100) + '...'
          });
          errorCount++;
        }
      }

      return NextResponse.json({
        success: errorCount === 0,
        message: `Выполнено ${successCount}/${commands.length} команд`,
        results,
        summary: {
          total: commands.length,
          success: successCount,
          errors: errorCount
        }
      });
    }

    if (action === 'test-insert') {
      // Тестовая вставка пользователя
      const testUser = {
        telegram_id: '12345678',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User',
        coins: 1000,
        rating: 0
      };

      const { data, error } = await supabase
        .from('_pidr_users')
        .insert(testUser)
        .select()
        .single();

      if (error) {
        return NextResponse.json({
          success: false,
          message: 'Ошибка тестовой вставки',
          error: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Тестовый пользователь создан',
        data
      });
    }

    if (action === 'test-room') {
      // Тестовое создание комнаты
      const testRoom = {
        room_code: 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: 'Тестовая комната',
        max_players: 4,
        current_players: 1,
        status: 'waiting'
      };

      const { data, error } = await supabase
        .from('_pidr_rooms')
        .insert(testRoom)
        .select()
        .single();

      if (error) {
        return NextResponse.json({
          success: false,
          message: 'Ошибка создания тестовой комнаты',
          error: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Тестовая комната создана',
        data
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Неизвестное действие'
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Ошибка P.I.D.R. Database POST:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
