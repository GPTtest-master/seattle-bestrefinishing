#!/usr/bin/env python3
"""
SEMrush Deep Analysis для Best Refinishing Seattle
Анализ конкурентов + подбор ключевых слов + gap analysis
"""

import requests
import json
import csv
from datetime import datetime

API_KEY = "ebf3b4386e4d6f187aaac9d72a84602e"
BASE_URL = "https://api.semrush.com/"

# Конкуренты для анализа
COMPETITORS = [
    "miraclemethod.com",
    "permaglaze.com", 
    "surfacespecialists.com",
    "bathtubsolutions.com"
]

# Seed keywords
SEED_KEYWORDS = [
    "bathtub refinishing seattle",
    "tile reglazing seattle",
    "bathtub resurfacing near me",
    "tub reglazing",
    "shower refinishing"
]

def semrush_request(params):
    """Делает запрос к SEMrush API"""
    params['key'] = API_KEY
    try:
        response = requests.get(BASE_URL, params=params, timeout=30)
        if response.status_code == 200:
            return response.text
        else:
            print(f"⚠️ API Error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def analyze_competitor_organic(domain):
    """Анализ органических ключей конкурента"""
    print(f"\n🔍 Analyzing {domain} organic keywords...")
    
    params = {
        'type': 'domain_organic',
        'domain': domain,
        'database': 'us',
        'display_limit': 100,
        'export_columns': 'Ph,Po,Nq,Cp,Co,Tr'
    }
    
    data = semrush_request(params)
    if not data:
        return []
    
    lines = data.strip().split('\n')
    keywords = []
    
    for line in lines[1:]:  # Skip header
        parts = line.split(';')
        if len(parts) >= 4:
            keyword = parts[0]
            position = parts[1]
            volume = parts[2]
            cpc = parts[3]
            
            # Фильтр: только релевантные ключи
            relevant_terms = ['bathtub', 'tub', 'tile', 'refinish', 'reglaz', 'resurface', 'shower', 'bathroom']
            if any(term in keyword.lower() for term in relevant_terms):
                try:
                    keywords.append({
                        'keyword': keyword,
                        'position': int(float(position)) if position else 0,
                        'volume': int(volume) if volume.isdigit() else 0,
                        'cpc': float(cpc) if cpc else 0
                    })
                except:
                    pass
    
    return keywords

def analyze_competitor_ppc(domain):
    """Анализ PPC ключей конкурента"""
    print(f"\n💰 Analyzing {domain} PPC keywords...")
    
    params = {
        'type': 'domain_adwords',
        'domain': domain,
        'database': 'us',
        'display_limit': 100,
        'export_columns': 'Ph,Po,Nq,Cp,Co'
    }
    
    data = semrush_request(params)
    if not data:
        return []
    
    lines = data.strip().split('\n')
    keywords = []
    
    for line in lines[1:]:
        parts = line.split(';')
        if len(parts) >= 4:
            keyword = parts[0]
            volume = parts[2] if len(parts) > 2 else '0'
            cpc = parts[3] if len(parts) > 3 else '0'
            
            relevant_terms = ['bathtub', 'tub', 'tile', 'refinish', 'reglaz', 'resurface', 'shower', 'bathroom']
            if any(term in keyword.lower() for term in relevant_terms):
                try:
                    keywords.append({
                        'keyword': keyword,
                        'volume': int(volume) if volume.isdigit() else 0,
                        'cpc': float(cpc) if cpc else 0,
                        'source': domain
                    })
                except:
                    pass
    
    return keywords

def get_keyword_data(keyword):
    """Получить данные по конкретному ключевому слову"""
    print(f"\n🔑 Getting data for: {keyword}")
    
    params = {
        'type': 'phrase_this',
        'phrase': keyword,
        'database': 'us',
        'export_columns': 'Ph,Nq,Cp,Co,Nr,Td'
    }
    
    data = semrush_request(params)
    if not data:
        return None
    
    lines = data.strip().split('\n')
    if len(lines) < 2:
        return None
    
    parts = lines[1].split(';')
    if len(parts) >= 3:
        return {
            'keyword': keyword,
            'volume': int(parts[1]) if parts[1].isdigit() else 0,
            'cpc': float(parts[2]) if parts[2] else 0,
            'competition': float(parts[3]) if len(parts) > 3 and parts[3] else 0
        }
    
    return None

def get_related_keywords(keyword):
    """Получить связанные ключевые слова"""
    print(f"\n🔗 Getting related keywords for: {keyword}")
    
    params = {
        'type': 'phrase_related',
        'phrase': keyword,
        'database': 'us',
        'display_limit': 50,
        'export_columns': 'Ph,Nq,Cp,Co,Nr'
    }
    
    data = semrush_request(params)
    if not data:
        return []
    
    lines = data.strip().split('\n')
    related = []
    
    for line in lines[1:]:
        parts = line.split(';')
        if len(parts) >= 3:
            try:
                related.append({
                    'keyword': parts[0],
                    'volume': int(parts[1]) if parts[1].isdigit() else 0,
                    'cpc': float(parts[2]) if parts[2] else 0
                })
            except:
                pass
    
    return related

# Main Analysis
print("=" * 80)
print("🚀 DEEP SEMRUSH ANALYSIS FOR BEST REFINISHING SEATTLE")
print("=" * 80)

all_competitor_keywords = {}
all_ppc_keywords = []

# 1. Анализ каждого конкурента
for competitor in COMPETITORS:
    print(f"\n{'='*60}")
    print(f"📊 COMPETITOR: {competitor}")
    print(f"{'='*60}")
    
    organic_kws = analyze_competitor_organic(competitor)
    ppc_kws = analyze_competitor_ppc(competitor)
    
    all_competitor_keywords[competitor] = {
        'organic': organic_kws,
        'ppc': ppc_kws
    }
    
    all_ppc_keywords.extend(ppc_kws)
    
    print(f"✅ Found {len(organic_kws)} organic keywords")
    print(f"✅ Found {len(ppc_kws)} PPC keywords")

# 2. Анализ seed keywords
print(f"\n{'='*60}")
print("🌱 ANALYZING SEED KEYWORDS")
print(f"{'='*60}")

seed_data = []
for kw in SEED_KEYWORDS:
    data = get_keyword_data(kw)
    if data:
        seed_data.append(data)
        print(f"✅ {kw}: Vol={data['volume']}, CPC=${data['cpc']:.2f}")

# 3. Получение related keywords
print(f"\n{'='*60}")
print("🔗 FINDING RELATED KEYWORDS")
print(f"{'='*60}")

all_related = []
for kw in SEED_KEYWORDS[:3]:  # Ограничим для экономии API calls
    related = get_related_keywords(kw)
    all_related.extend(related)
    print(f"✅ Found {len(related)} related keywords for '{kw}'")

# 4. Собираем все уникальные ключи
print(f"\n{'='*60}")
print("📝 COMPILING FINAL KEYWORD LIST")
print(f"{'='*60}")

final_keywords = {}

# Добавляем PPC ключи конкурентов
for kw_data in all_ppc_keywords:
    kw = kw_data['keyword'].lower()
    if kw not in final_keywords:
        final_keywords[kw] = {
            'keyword': kw_data['keyword'],
            'volume': kw_data['volume'],
            'cpc': kw_data['cpc'],
            'competitors_using': 1
        }
    else:
        final_keywords[kw]['competitors_using'] += 1

# Добавляем related keywords
for kw_data in all_related:
    kw = kw_data['keyword'].lower()
    if kw not in final_keywords:
        final_keywords[kw] = {
            'keyword': kw_data['keyword'],
            'volume': kw_data['volume'],
            'cpc': kw_data['cpc'],
            'competitors_using': 0
        }

# 5. Фильтруем и ранжируем
filtered = []
for kw, data in final_keywords.items():
    # Фильтры
    if data['volume'] < 50:  # Минимальный объём
        continue
    if data['cpc'] > 15:  # Максимальный CPC
        continue
    if data['cpc'] < 3:  # Слишком дешёвый = нерелевантный
        continue
    
    # Negative keywords check
    negatives = ['diy', 'paint', 'kit', 'youtube', 'home depot', 'lowes', 'rental', 'free', 'how to']
    if any(neg in kw for neg in negatives):
        continue
    
    # Рассчитываем priority score
    priority = (data['volume'] / 100) * (1 / max(data['cpc'], 1)) * (data['competitors_using'] + 1)
    
    filtered.append({
        **data,
        'priority': priority
    })

# Сортируем по priority
filtered.sort(key=lambda x: x['priority'], reverse=True)

# 6. Сохраняем результаты
print(f"\n✅ Total keywords found: {len(filtered)}")
print(f"\n🔝 TOP 30 KEYWORDS:")
print(f"{'Keyword':<50} {'Volume':<10} {'CPC':<10} {'Priority':<10}")
print("=" * 80)

top_30 = filtered[:30]
for kw in top_30:
    print(f"{kw['keyword']:<50} {kw['volume']:<10} ${kw['cpc']:<9.2f} {kw['priority']:<10.2f}")

# Сохраняем в файл
output_file = '/Users/testaccount/seattle.html/semrush_analysis_results.json'
with open(output_file, 'w') as f:
    json.dump({
        'timestamp': datetime.now().isoformat(),
        'competitors_analyzed': COMPETITORS,
        'total_keywords': len(filtered),
        'top_keywords': top_30,
        'all_keywords': filtered[:100]  # Топ 100
    }, f, indent=2)

print(f"\n💾 Results saved to: {output_file}")
print("\n✅ ANALYSIS COMPLETE!")
