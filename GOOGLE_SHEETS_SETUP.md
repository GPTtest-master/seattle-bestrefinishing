# Google Sheets Setup для отслеживания GCLID и квалификации лидов

## 📋 Что было добавлено в код сайта:

1. **GCLID отслеживание** - автоматически ловит и сохраняет GCLID из URL (срок хранения 90 дней)
2. **Enhanced Conversions** - передает хешированные email/телефон в Google Ads для точного match
3. **Transaction ID** - уникальный ID для каждого лида связывает конверсию с записью в таблице
4. **Поле status** - для квалификации лидов (new_lead → qualified → не qualified)

---

## 🔧 Настройка Google Sheets

### Шаг 1: Структура таблицы

Убедитесь, что в вашей Google Таблице есть следующие колонки:

| Колонка | Описание |
|---------|----------|
| `timestamp` | Время отправки формы |
| `name` | Имя клиента |
| `phone` | Телефон |
| `zip` | ZIP код |
| `email` | Email (опционально) |
| `services` | Выбранные услуги |
| `price` | Расчетная цена |
| **`gclid`** | **Google Click ID (ВАЖНО!)** |
| **`transaction_id`** | **Уникальный ID конверсии** |
| **`status`** | **Статус лида (new_lead/qualified/disqualified)** |
| `source` | Источник (website) |
| `page` | URL страницы |

### Шаг 2: Обновите Google Apps Script

В вашем Google Apps Script добавьте обработку новых полей:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Добавляем новую строку с данными
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.zip || '',
      data.email || '',
      data.services || '',
      data.price || '',
      data.gclid || '',           // GCLID
      data.transaction_id || '',   // Transaction ID
      data.status || 'new_lead',   // Статус по умолчанию
      data.source || 'website',
      data.page || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data received'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 🎯 Система квалификации лидов

### Как это работает:

1. **Клиент заполняет форму** → создается запись со статусом `new_lead`
2. **Google Ads фиксирует конверсию** с transaction_id и enhanced data
3. **Вы работаете с клиентом** → меняете статус на `qualified` или `disqualified`
4. **Отправляете offline conversion** в Google Ads когда лид qualified

### Опция 1: Ручная отправка qualified конверсий через Google Ads API

Когда вы квалифицируете лида в таблице, можно отправить offline conversion:

```javascript
// Google Apps Script для отправки offline conversions
function sendQualifiedConversion(transactionId, gclid, conversionValue) {
  const conversionActionId = 'AW-17663809026/QUALIFIED_CONVERSION_ID'; // создайте отдельный conversion action
  
  const payload = {
    conversions: [{
      gclid: gclid,
      conversion_action: conversionActionId,
      conversion_date_time: new Date().toISOString(),
      conversion_value: conversionValue,
      currency_code: 'USD',
      order_id: transactionId
    }]
  };
  
  // Используйте Google Ads API для отправки
  // https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
}
```

### Опция 2: Простая система через дополнительные конверсии

**В Google Ads создайте 2 типа конверсий:**

1. **"Lead Submission"** (текущая: `dC2_COaQtMQbEIKs4eZB`) 
   - Цель: All
   - Ценность: низкая
   - Засчитывается автоматически при отправке формы

2. **"Qualified Lead"** (создайте новую)
   - Цель: Primary
   - Ценность: высокая
   - Засчитывается вручную или через API

### Опция 3: Используйте Google Tag Manager + Data Layer

Добавьте кнопку "Mark as Qualified" в вашу CRM/таблицу, которая отправляет event:

```javascript
function markAsQualified(transactionId, gclid, value) {
  // Отправить событие в Google Analytics 4
  gtag('event', 'qualified_lead', {
    transaction_id: transactionId,
    gclid: gclid,
    value: value,
    currency: 'USD'
  });
  
  // И/или отправить в Google Ads через conversion tracking
  gtag('event', 'conversion', {
    'send_to': 'AW-17663809026/NEW_QUALIFIED_CONVERSION_ID',
    'transaction_id': transactionId,
    'value': value,
    'currency': 'USD'
  });
}
```

---

## 🔍 Как использовать систему

### Workflow для квалификации лидов:

1. **Новый лид приходит** → статус `new_lead`
   - GCLID сохранен ✅
   - Transaction ID записан ✅
   - Google Ads засчитал "Lead Submission" ✅

2. **Вы связываетесь с клиентом:**
   - Клиент качественный → меняете status на `qualified`
   - Клиент некачественный → меняете на `disqualified`

3. **Для qualified лидов:**
   - Вручную создаете новую конверсию в Google Ads
   - Или используете API для автоматической отправки
   - Google Ads видит: этот GCLID → qualified конверсия
   - Алгоритм обучается на качественных лидах!

---

## 📊 Преимущества этой системы:

✅ **GCLID хранится 90 дней** - как у Google (автоматическая очистка)
✅ **Enhanced Conversions** - точный match клиентов через email/телефон
✅ **Transaction ID** - связь между сайтом и Google Ads
✅ **Статус квалификации** - отличаете качественные лиды от плохих
✅ **Обучение алгоритма** - Google Ads оптимизирует на qualified конверсии

---

## 🚀 Быстрый старт:

1. ✅ Код уже обновлен и готов к работе
2. 📝 Добавьте колонки `gclid`, `transaction_id`, `status` в Google Sheets
3. 🔧 Обновите Google Apps Script для обработки новых полей
4. 🎯 Создайте второй тип конверсии "Qualified Lead" в Google Ads
5. 📊 Начните квалифицировать лиды и отслеживать результаты

---

## 💡 Дополнительные возможности:

### Автоматическая отправка qualified конверсий

Можно добавить триггер в Google Sheets который автоматически отправляет конверсию когда status меняется на "qualified":

```javascript
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Если изменили колонку Status
  if (range.getColumn() === 10 && range.getValue() === 'qualified') {
    const row = range.getRow();
    const gclid = sheet.getRange(row, 8).getValue();
    const transactionId = sheet.getRange(row, 9).getValue();
    const price = sheet.getRange(row, 7).getValue();
    
    // Отправить qualified конверсию
    sendQualifiedConversion(transactionId, gclid, price);
  }
}
```

---

## 📞 Нужна помощь?

Если нужна помощь с:
- Настройкой Google Ads API для offline conversions
- Созданием автоматизации через Zapier/Make
- Интеграцией с CRM системой

Напишите мне!
