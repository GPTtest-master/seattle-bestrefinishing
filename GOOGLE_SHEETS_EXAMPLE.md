# 📊 Пример структуры данных в Google Sheets

## Заголовки колонок (Row 1)

```
A: timestamp
B: name
C: phone
D: zip
E: email
F: services
G: price
H: gclid
I: transaction_id
J: status
K: source
L: page
```

---

## Пример реальных данных

### Lead #1 - Qualified (с GCLID)
```
A: 2025-11-21T10:30:00.000Z
B: John Smith
C: +12065551234
D: 98101
E: john.smith@gmail.com
F: Bathtub, Tile
G: 810
H: Cj0KCQiA5rGuBhCnARIsAN11vgQh9Z8...
I: lead-1732183800000-Cj0KCQiA5rGu
J: qualified
K: website
L: https://www.best-refinishing.com/
```

### Lead #2 - New Lead (с GCLID)
```
A: 2025-11-21T11:15:00.000Z
B: Sarah Johnson
C: +14255559876
D: 98004
E: sarah.j@yahoo.com
F: Shower
G: 810
H: Cj0KCQiA5rGuBhCnARIsAN11vgRx3K1...
I: lead-1732186500000-Cj0KCQiA5rGu
J: new_lead
K: website
L: https://www.best-refinishing.com/
```

### Lead #3 - Disqualified (с GCLID)
```
A: 2025-11-21T12:00:00.000Z
B: Mike Brown
C: +12065554321
D: 98105
E: 
F: Local Repair
G: 342
H: Cj0KCQiA5rGuBhCnARIsAN11vgTa8W2...
I: lead-1732189200000-Cj0KCQiA5rGu
J: disqualified
K: website
L: https://www.best-refinishing.com/
```

### Lead #4 - Qualified (без GCLID - Direct traffic)
```
A: 2025-11-21T13:30:00.000Z
B: Emily Davis
C: +14255558765
D: 98052
E: emily.davis@hotmail.com
F: Countertop, Sink
G: 855
H: 
I: lead-1732194600000-direct
J: qualified
K: website
L: https://www.best-refinishing.com/
```

---

## 📋 Объяснение полей

### timestamp (A)
- Формат: ISO 8601 (UTC)
- Пример: `2025-11-21T10:30:00.000Z`
- Автоматически: JavaScript `new Date().toISOString()`

### name (B)
- Имя клиента
- Обязательное поле
- Пример: `John Smith`

### phone (C)
- Телефон клиента
- Обязательное поле
- Формат: любой (будет нормализован для Enhanced Conversions)
- Примеры: `+12065551234`, `(206) 555-1234`, `206-555-1234`

### zip (D)
- ZIP код клиента
- Обязательное поле
- Используется в Enhanced Conversions
- Пример: `98101`

### email (E)
- Email клиента
- Опциональное поле (может быть пустым)
- Используется в Enhanced Conversions (хешируется)
- Пример: `john.smith@gmail.com`

### services (F)
- Выбранные услуги (через запятую)
- Примеры:
  - `Bathtub`
  - `Bathtub, Tile`
  - `Shower`
  - `Countertop, Sink`
  - `Local Repair`

### price (G)
- Расчетная цена (после скидки 10%)
- Число без символа $
- Примеры: `810`, `630`, `342`, `855`

### gclid (H) ⭐ ВАЖНО
- Google Click ID
- **Пустое если клиент пришел не из Google Ads** (direct/organic/social)
- **Заполнено только для кликов из Google Ads рекламы**
- Формат: `Cj0KCQiA5rGuBhCnARIsAN11vgQh9Z8...` (длинная строка)
- Срок действия: 90 дней
- Используется для:
  - Attribution (какой клик привел клиента)
  - Offline conversions
  - Анализ эффективности объявлений

### transaction_id (I) ⭐ ВАЖНО
- Уникальный ID конверсии
- Формат: `lead-{timestamp}-{gclid_prefix}`
- Примеры:
  - С GCLID: `lead-1732183800000-Cj0KCQiA5rGu`
  - Без GCLID: `lead-1732194600000-direct`
- Используется для:
  - Связи записи в таблице с конверсией в Google Ads
  - Дедупликации (избежание двойного подсчета)
  - Offline conversions API

### status (J) ⭐ ВАЖНО
- Статус квалификации лида
- **3 возможных значения:**

  1. **`new_lead`** (по умолчанию)
     - Только что пришел
     - Еще не обработан
     - Нужно позвонить и оценить

  2. **`qualified`** (качественный)
     - Клиент целевой
     - Готов платить
     - Реальная потребность в услуге
     - **На таких лидах Google Ads учится!**

  3. **`disqualified`** (некачественный)
     - Не целевой клиент
     - Слишком низкий бюджет
     - Ошибочная заявка
     - Конкурент
     - **Google Ads учится избегать таких**

### source (K)
- Источник заявки
- По умолчанию: `website`
- Можно расширить: `landing_page`, `promo_page`, etc.

### page (L)
- Полный URL страницы с которой отправлена форма
- Пример: `https://www.best-refinishing.com/`
- Может включать UTM параметры

---

## 📊 Как использовать таблицу

### Ежедневная работа:

1. **Утро: Проверяем новые лиды**
   ```
   Фильтр: status = "new_lead"
   Сортировка: timestamp DESC (новые сверху)
   ```

2. **Звоним клиентам**
   - Хороший клиент → меняем на `qualified`
   - Плохой клиент → меняем на `disqualified`

3. **Анализируем GCLID**
   ```
   Какие GCLID чаще дают qualified?
   Можно создать сводную таблицу по GCLID
   ```

### Еженедельная аналитика:

4. **Считаем метрики:**
   ```
   Qualification Rate = Qualified / (Qualified + Disqualified)
   
   Пример:
   50 qualified + 20 disqualified = 70 total
   50 / 70 = 71.4% qualification rate
   ```

5. **Анализируем по услугам:**
   ```
   Какие services дают лучший qualification rate?
   Bathtub: 75%
   Shower: 68%
   Local Repair: 45%
   
   Вывод: фокус на Bathtub и Shower
   ```

### Месячный отчет:

6. **Сводная статистика:**
   ```
   Всего лидов: 150
   Qualified: 90 (60%)
   Disqualified: 35 (23%)
   New (необработанные): 25 (17%)
   
   Cost per Lead: $2,500 / 150 = $16.67
   Cost per Qualified: $2,500 / 90 = $27.78
   ```

---

## 🎯 Примеры фильтров для Google Sheets

### Фильтр 1: Новые необработанные лиды
```
Колонка J (status) = "new_lead"
Сортировка: Колонка A (timestamp) от новых к старым
```

### Фильтр 2: Все qualified за последний месяц
```
Колонка J (status) = "qualified"
Колонка A (timestamp) > дата_месяц_назад
```

### Фильтр 3: Лиды из Google Ads (с GCLID)
```
Колонка H (gclid) не пусто
```

### Фильтр 4: Лиды без GCLID (органика/direct)
```
Колонка H (gclid) пусто
```

### Фильтр 5: Дорогие лиды (>$800)
```
Колонка G (price) > 800
```

---

## 📈 Формулы для автоматического подсчета

### В отдельном листе "Dashboard" создайте:

```
Total Leads:
=COUNTA(Data!B2:B) - 1

Qualified Leads:
=COUNTIF(Data!J2:J,"qualified")

Disqualified Leads:
=COUNTIF(Data!J2:J,"disqualified")

New Leads:
=COUNTIF(Data!J2:J,"new_lead")

Qualification Rate:
=B2/(B2+B3)*100
(где B2=qualified, B3=disqualified)

Average Price:
=AVERAGE(Data!G2:G)

Leads with GCLID:
=COUNTIF(Data!H2:H,"<>")

Leads without GCLID:
=COUNTIF(Data!H2:H,"=")
```

---

## 🚨 Важные заметки

### О GCLID:
- ⚠️ **Не все лиды будут иметь GCLID**
- ✅ GCLID только у кликов из Google Ads
- ❌ Прямые визиты, органика, социальные сети → GCLID пустой
- 🔄 Это нормально! Просто разделяйте анализ

### О статусе:
- 🔴 **ОБЯЗАТЕЛЬНО квалифицируйте каждый лид**
- ✅ Только так Google Ads научится оптимизировать
- ⏱️ Чем быстрее квалифицируете → тем быстрее результаты
- 🎯 Цель: 30+ qualified лидов для обучения алгоритма

### О transaction_id:
- ⚠️ **Должен быть уникальным** для каждой конверсии
- ✅ Автоматически генерируется кодом
- 🔗 Связывает Google Ads конверсию с записью в таблице
- 📊 Используется для offline conversions API

---

## ✅ Чек-лист правильной таблицы

- [ ] Есть 12 колонок (A-L)
- [ ] Заголовки в первой строке
- [ ] Колонка H называется `gclid`
- [ ] Колонка I называется `transaction_id`
- [ ] Колонка J называется `status`
- [ ] Google Apps Script обновлен
- [ ] Тестовая запись успешно добавлена
- [ ] Фильтры настроены
- [ ] Dashboard с метриками создан (опционально)

---

**Структура готова! Можно начинать работу! 🚀**
