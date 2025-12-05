#!/usr/bin/env python3
"""
Google Search Console Bulk Indexing Request Script
Automatically requests indexing for all URLs in sitemap.xml
"""

import xml.etree.ElementTree as ET
import subprocess
import time

# Parse sitemap.xml
tree = ET.parse('sitemap.xml')
root = tree.getroot()

# Extract all URLs
namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = [elem.text for elem in root.findall('.//ns:loc', namespace)]

print(f"📋 Found {len(urls)} URLs in sitemap.xml")
print("\n" + "="*60)

# Instructions for manual indexing
print("\n🚀 FASTEST METHOD: Submit Sitemap in Google Search Console")
print("="*60)
print("1. Go to: https://search.google.com/search-console")
print("2. Click 'Sitemaps' in left menu")
print("3. Enter: sitemap.xml")
print("4. Click 'Submit'")
print("\n✅ Google will index ALL pages automatically in 1-3 days!\n")

print("\n📝 For MANUAL INDEXING (one by one):")
print("="*60)
print("Go to Google Search Console → URL Inspection")
print("Copy and paste each URL below, then click 'Request Indexing'\n")

for i, url in enumerate(urls, 1):
    print(f"{i}. {url}")

print("\n" + "="*60)
print("\n💡 TIP: Priority order (index these first):")
print("   1. Homepage (index.html)")
print("   2. Service pages (bathtub, tile, shower, etc.)")
print("   3. Location pages (bellevue, redmond, kirkland, etc.)")
print("   4. Other pages (common-problems, our-process, etc.)")

print("\n⏱️  Allow 2-3 days between requests to avoid rate limits")
print("="*60)
