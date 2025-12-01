/**
 * Google Apps Script для обработки форм с сайта
 * Сохраняет данные в Google Sheets и отправляет уведомления (Email/Telegram)
 * Включает GCLID/transaction_id, Status="Qualified lead" и Qualified Date (UTC)
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Откройте вашу Google Таблицу
 * 2. Расширения → Apps Script
 * 3. Удалите весь код и вставьте этот
 * 4. Нажмите "Развернуть" → "Новое развертывание"
 * 5. Тип: "Веб-приложение"
 * 6. Выполнять как: "Я"
 * 7. Доступ: "Все, даже анонимные пользователи"
 * 8. Скопируйте URL развертывания и используйте его на сайте
 */

// 🔧 НАСТРОЙКИ УВЕДОМЛЕНИЙ (при желании заполните)
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID';
const EMAIL_RECIPIENT = 'YOUR_EMAIL@example.com';

// Главная функция для обработки POST запросов
function doPost(e) {
  try {
    // Открываем активную таблицу
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Парсим данные из запроса
    const data = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    
    // Логируем для отладки (можно посмотреть в "Выполнения")
    Logger.log('Received data: ' + JSON.stringify(data));
    
    // Добавляем новую строку с данными
    // ВАЖНО: порядок должен совпадать с колонками в таблице
  // Формат даты для Google Ads (UTC): yyyy-MM-dd HH:mm:ss+00:00
  const qualifiedDateUtc = Utilities.formatDate(new Date(), 'GMT', "yyyy-MM-dd' 'HH:mm:ss") + '+00:00';

    // Получаем заголовки (первая строка) и строим карту колонок
  const headerRange = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn()));
    const headers = headerRange.getValues()[0].map(h => (h || '').toString().trim());
    const colIndex = (name) => headers.indexOf(name) + 1; // +1 т.к. колонки 1-индексные

    // Базовые поля
    const safe = (v) => (v === undefined || v === null) ? '' : (typeof v === 'string' ? v : String(v));
    const rowData = {
      'Timestamp': safe(data.timestamp) || new Date().toISOString(),
      'Name': safe(data.name),
      'Phone': safe(data.phone),
      'ZIP': safe(data.zip),
      'Email': safe(data.email),
      // Используем единый заголовок "Service" в таблице
      'Service': safe(data.services || data.service),
      'Price': safe(data.price),
      'GCLID': safe(data.gclid),
      'Transaction ID': safe(data.transaction_id),
      'Status': 'Qualified lead',
      'Source': safe(data.source) || 'website',
      'Page': safe(data.page),
      'Qualified Date': qualifiedDateUtc
    };

    // Собираем массив значений по порядку текущих заголовков;
    // если заголовка нет — добавим новые колонки справа.
    const values = [];
    let needToAppendNewCols = false;

    headers.forEach(h => {
      if (rowData.hasOwnProperty(h)) {
        values.push(rowData[h]);
      } else {
        // сохраняем пустое значение для неизвестных колонок
        values.push('');
      }
    });

    // Проверяем, есть ли отсутствующие ключевые поля и добавим колонки при необходимости
    // Гарантируем наличие ключевых колонок
    ['Status', 'Qualified Date', 'Service'].forEach(h => {
      if (headers.indexOf(h) === -1) {
        needToAppendNewCols = true;
        headers.push(h);
        values.push(rowData[h]);
      }
    });

    if (needToAppendNewCols) {
      // Расширяем заголовок (первая строка) новыми колонками
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // Записываем строку строго в соответствии с заголовками
    sheet.appendRow(values);

    // Отправляем уведомления (опционально)
    try {
      // Строим безопасные данные для уведомлений из исходного запроса
      const notificationData = {
        name: safe(data && data.name),
        phone: safe(data && data.phone),
        zip: safe(data && data.zip),
        email: safe(data && data.email),
        services: safe((data && (data.services || data.service)) || rowData['Service']),
        price: safe(data && data.price)
      };

      if (EMAIL_RECIPIENT && EMAIL_RECIPIENT.indexOf('@') > 0) {
        sendEmailNotification(notificationData);
      }
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        sendTelegramNotification(notificationData);
      }
    } catch (notifyErr) {
      Logger.log('Notify error: ' + notifyErr);
    }
    
    // Возвращаем успешный ответ
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Lead received successfully',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Логируем ошибку
    Logger.log('Error: ' + error.toString());
    
    // Возвращаем ошибку
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Функция для тестирования (можно запустить вручную)
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: 'Test User',
        phone: '+1234567890',
        zip: '98101',
        email: 'test@example.com',
        services: 'Bathtub, Tile',
        price: 810,
        gclid: 'test_gclid_123',
        transaction_id: 'test-' + Date.now(),
        status: 'new_lead',
        source: 'website',
        page: 'https://www.best-refinishing.com/'
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log('Test result: ' + result.getContent());
}

/**
 * ДОПОЛНИТЕЛЬНО: Автоматическая отправка qualified конверсий в Google Ads
 * 
 * Эта функция автоматически срабатывает когда вы меняете статус на "qualified"
 * Требует настройки Google Ads API (инструкция в GOOGLE_SHEETS_SETUP.md)
 */
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    
    // Определяем номер колонки "status" (здесь 10-я колонка, индекс J)
    const STATUS_COLUMN = 10;
    
    // Проверяем, изменилась ли колонка Status
    if (range.getColumn() === STATUS_COLUMN) {
      const newStatus = range.getValue();
      const row = range.getRow();
      
      // Если статус изменен на "qualified"
      if (newStatus === 'qualified') {
        Logger.log('Lead qualified in row ' + row);
        
        // Получаем данные из строки
        const gclid = sheet.getRange(row, 8).getValue();           // Колонка H
        const transactionId = sheet.getRange(row, 9).getValue();   // Колонка I
        const price = sheet.getRange(row, 7).getValue();           // Колонка G
        const name = sheet.getRange(row, 2).getValue();            // Колонка B
        
        Logger.log('GCLID: ' + gclid + ', Transaction: ' + transactionId + ', Price: ' + price);
        
        // ЗДЕСЬ МОЖНО ДОБАВИТЬ:
        // 1. Отправку webhook в CRM
        // 2. Отправку уведомления в Slack/Telegram
        // 3. Отправку offline conversion в Google Ads через API
        
        // Пример: добавить заметку в ячейку
        sheet.getRange(row, STATUS_COLUMN).setNote(
          'Qualified on: ' + new Date().toLocaleString() + '\nReady for Google Ads offline conversion'
        );
        
        // TODO: Раскомментируйте когда настроите Google Ads API
        // sendOfflineConversion(gclid, transactionId, price);
      }
    }
  } catch (error) {
    Logger.log('onEdit error: ' + error.toString());
  }
}

/**
 * БОНУС: Функция для отправки offline conversion в Google Ads
 * Требует настройки Google Ads API
 * Инструкции: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 */
function sendOfflineConversion(gclid, transactionId, value) {
  // TODO: Настройте Google Ads API credentials
  
  const CUSTOMER_ID = 'YOUR_CUSTOMER_ID';  // Например: 123-456-7890
  const CONVERSION_ACTION_ID = 'YOUR_QUALIFIED_CONVERSION_ACTION_ID';
  
  try {
    // Формируем данные для offline conversion
    const conversionData = {
      gclid: gclid,
      conversion_action: 'customers/' + CUSTOMER_ID + '/conversionActions/' + CONVERSION_ACTION_ID,
      conversion_date_time: new Date().toISOString(),
      conversion_value: value,
      currency_code: 'USD',
      order_id: transactionId
    };
    
    Logger.log('Would send offline conversion: ' + JSON.stringify(conversionData));
    
    // TODO: Реализовать отправку через Google Ads API
    // Это требует OAuth 2.0 авторизации и Google Ads API library
    
  } catch (error) {
    Logger.log('sendOfflineConversion error: ' + error.toString());
  }
}

/**
 * БОНУС: Функция для отправки уведомлений в Slack/Telegram
 * когда приходит новый qualified лид
 */
function sendNotification(leadData) {
  // Пример для Slack Webhook
  const SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL';
  
  try {
    // Защищаемся от ручного запуска без параметров
    leadData = leadData || {};
    const message = {
      text: '🎉 New Qualified Lead!',
      attachments: [{
        color: '#36a64f',
        fields: [
          { title: 'Name', value: leadData.name || '', short: true },
          { title: 'Phone', value: leadData.phone || '', short: true },
          { title: 'Services', value: leadData.services || '', short: false },
          { title: 'Price', value: '$' + ((leadData.price!=null && leadData.price!=='') ? leadData.price : '0'), short: true },
          { title: 'GCLID', value: leadData.gclid || 'N/A', short: true }
        ]
      }]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(message)
    };
    
    // Раскомментируйте когда добавите webhook URL
    // UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
    
    Logger.log('Notification sent: ' + JSON.stringify(message));
    
  } catch (error) {
    Logger.log('sendNotification error: ' + error.toString());
  }
}

// 📧 Email уведомление
function sendEmailNotification(data) {
  if (!EMAIL_RECIPIENT) return;
  data = data || {};
  const subject = '🔔 New Lead from Website: ' + (data.name || 'Client');
  const body = (
    'New estimate request received:\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '📋 CLIENT INFORMATION\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '👤 Name: ' + (data.name || '') + '\n' +
    '📞 Phone: ' + (data.phone || '') + '\n' +
    '📍 ZIP: ' + (data.zip || '') + '\n' +
    '📧 Email: ' + (data.email || 'Not provided') + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '🛠 SERVICES REQUESTED\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    (data.services || '') + '\n\n' +
    '💰 Price (final): $' + (Number(data.price || 0).toFixed(0)) + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '⏰ Received: ' + new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'short'
    }) + '\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '🔗 Quick Actions:\n' +
    '• Call: ' + (data.phone || '') + '\n' +
    '• Text: sms:' + (data.phone || '') + '\n' +
    (data.email ? ('• Email: ' + data.email + '\n') : '') + '\n' +
    '--\nBest Refinishing Lead System'
  );
  MailApp.sendEmail(EMAIL_RECIPIENT, subject, body);
}

// 📱 Telegram уведомление
function sendTelegramNotification(data) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  data = data || {};
  const message = (
    '🔔 <b>NEW LEAD FROM WEBSITE</b>\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '👤 <b>CLIENT INFO</b>\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '<b>Name:</b> ' + (data.name || '') + '\n' +
    '<b>Phone:</b> <a href="tel:' + (data.phone || '') + '">' + (data.phone || '') + '</a>\n' +
    '<b>ZIP:</b> ' + (data.zip || '') + '\n' +
    '<b>Email:</b> ' + (data.email || 'Not provided') + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '🛠 <b>SERVICES</b>\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    (data.services || '') + '\n\n' +
    '💰 <b>Price (final):</b> $' + (Number(data.price || 0).toFixed(0)) + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '⏰ ' + new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + '\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '<b>Quick Actions:</b>\n' +
    '📞 <a href="tel:' + (data.phone || '') + '">Call</a> | ' +
    '💬 <a href="sms:' + (data.phone || '') + '">Text</a>' +
    (data.email ? (' | 📧 <a href="mailto:' + data.email + '">Email</a>') : '')
  );

  const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  const payload = { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML', disable_web_page_preview: true };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };

  try { UrlFetchApp.fetch(url, options); } catch (error) { Logger.log('Telegram error: ' + error); }
}

/**
 * Функция для создания отчета по конверсиям
 * Можно настроить триггер на ежедневный запуск
 */
function generateDailyReport() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    let totalLeads = 0;
    let qualifiedLeads = 0;
    let disqualifiedLeads = 0;
    let newLeads = 0;
    
    // Пропускаем заголовок (первую строку)
    for (let i = 1; i < data.length; i++) {
      const status = data[i][9]; // Колонка J (status)
      totalLeads++;
      
      if (status === 'qualified') qualifiedLeads++;
      else if (status === 'disqualified') disqualifiedLeads++;
      else if (status === 'new_lead') newLeads++;
    }
    
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(1) : 0;
    
    const report = {
      date: new Date().toLocaleDateString(),
      totalLeads: totalLeads,
      qualifiedLeads: qualifiedLeads,
      disqualifiedLeads: disqualifiedLeads,
      newLeads: newLeads,
      qualificationRate: qualificationRate + '%'
    };
    
    Logger.log('Daily Report: ' + JSON.stringify(report));
    
    // Можно отправить report в Slack или email
    // sendNotification({ report: report });
    
    return report;
    
  } catch (error) {
    Logger.log('generateDailyReport error: ' + error.toString());
  }
}
