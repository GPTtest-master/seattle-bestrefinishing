#!/usr/bin/env python3
"""
Script to add Schema markup to location pages
"""

# Schema templates for each location
schemas = {
    'kirkland': {
        'name': 'Best Refinishing - Kirkland',
        'description': 'Professional bathtub, tile, shower refinishing in Kirkland, WA. Serving waterfront communities and Lake Washington area.',
        'url': 'https://best-refinishing.com/locations/kirkland.html',
        'locality': 'Kirkland',
        'postalCode': '98033',
        'latitude': '47.6769',
        'longitude': '-122.2060',
        'reviewCount': '350',
        'areaServed': ['Kirkland', 'Juanita', 'Totem Lake', 'Finn Hill', 'Houghton', 'Bridle Trails', 'Kenmore', 'Woodinville']
    },
    'renton': {
        'name': 'Best Refinishing - Renton',
        'description': 'Professional bathtub, tile, shower refinishing in Renton, WA. Serving all South Seattle and Eastside communities.',
        'url': 'https://best-refinishing.com/locations/renton.html',
        'locality': 'Renton',
        'postalCode': '98055',
        'latitude': '47.4829',
        'longitude': '-122.2171',
        'reviewCount': '450',
        'areaServed': ['Renton', 'The Highlands', 'Kennydale', 'Fairwood', 'Cascade', 'Kent', 'Auburn', 'Tukwila']
    },
    'bothell': {
        'name': 'Best Refinishing - Bothell',
        'description': 'Professional bathtub, tile, shower refinishing in Bothell, WA. Serving North Seattle and family-friendly communities.',
        'url': 'https://best-refinishing.com/locations/bothell.html',
        'locality': 'Bothell',
        'postalCode': '98011',
        'latitude': '47.7623',
        'longitude': '-122.2054',
        'reviewCount': '300',
        'areaServed': ['Bothell', 'Canyon Park', 'Queensborough', 'Northshore', 'Woodinville', 'Kenmore', 'Mill Creek', 'Lynnwood']
    }
}

# Generate schema for each location
for location, data in schemas.items():
    areas_json = ', '.join([f'{{"@type": "City", "name": "{city}"}}' for city in data['areaServed']])
    
    schema = f'''  <!-- Structured Data (JSON-LD) for {data['locality']} -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "{data['name']}",
    "description": "{data['description']}",
    "url": "{data['url']}",
    "telephone": "+1-206-786-9915",
    "email": "office@best-refinishing.com",
    "image": "https://best-refinishing.com/images/logo.png",
    "logo": "https://best-refinishing.com/images/logo.png",
    "address": {{
      "@type": "PostalAddress",
      "addressLocality": "{data['locality']}",
      "addressRegion": "WA",
      "postalCode": "{data['postalCode']}",
      "addressCountry": "US"
    }},
    "geo": {{
      "@type": "GeoCoordinates",
      "latitude": "{data['latitude']}",
      "longitude": "{data['longitude']}"
    }},
    "openingHoursSpecification": {{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "07:00",
      "closes": "19:00"
    }},
    "priceRange": "$$",
    "areaServed": [{areas_json}],
    "hasOfferCatalog": {{
      "@type": "OfferCatalog",
      "name": "Refinishing Services in {data['locality']}",
      "itemListElement": [
        {{"@type": "Offer", "itemOffered": {{"@type": "Service", "name": "Bathtub Refinishing {data['locality']}"}}}},
        {{"@type": "Offer", "itemOffered": {{"@type": "Service", "name": "Tile Refinishing {data['locality']}"}}}},
        {{"@type": "Offer", "itemOffered": {{"@type": "Service", "name": "Shower Refinishing {data['locality']}"}}}},
        {{"@type": "Offer", "itemOffered": {{"@type": "Service", "name": "Sink Refinishing {data['locality']}"}}}},
        {{"@type": "Offer", "itemOffered": {{"@type": "Service", "name": "Countertop Refinishing {data['locality']}"}}}}
      ]
    }},
    "aggregateRating": {{
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "{data['reviewCount']}",
      "bestRating": "5"
    }}
  }}
  </script>'''
    
    print(f"\n=== Schema for {location}.html ===")
    print(schema)
    print("\n")
