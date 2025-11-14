#!/bin/bash
# Image Optimization Script for Seattle Best Refinishing
# This script optimizes images for better website performance

echo "🎨 Starting image optimization..."

# Create optimized versions directory
mkdir -p images/optimized

# Function to optimize JPEG images using sips
optimize_jpeg() {
    local input="$1"
    local output="$2"
    local quality="${3:-80}"
    
    echo "Optimizing $input..."
    sips --resampleHeightWidthMax 1200 --setProperty formatOptions $quality "$input" --out "$output"
}

# Function to create WebP (requires cwebp to be installed)
create_webp() {
    local input="$1" 
    local output="$2"
    local quality="${3:-80}"
    
    if command -v cwebp &> /dev/null; then
        echo "Creating WebP: $output"
        cwebp -q $quality "$input" -o "$output"
    else
        echo "⚠️  cwebp not installed. Skipping WebP creation for $input"
        echo "   Install with: brew install webp"
    fi
}

# Optimize key images
cd images

echo "📸 Optimizing hero and logo images..."
optimize_jpeg "hero-bg.png" "optimized/hero-bg.jpg" 85
optimize_jpeg "logo1.png" "optimized/logo1.png" 90

echo "📸 Optimizing service background images..."
optimize_jpeg "tub-bg.jpg" "optimized/tub-bg.jpg" 80
optimize_jpeg "tiles-bg.jpg" "optimized/tiles-bg.jpg" 80  
optimize_jpeg "shower-bg.jpg" "optimized/shower-bg.jpg" 80
optimize_jpeg "counter-bg.jpg" "optimized/counter-bg.jpg" 80
optimize_jpeg "sink-bg.jpg" "optimized/sink-bg.jpg" 80
optimize_jpeg "local-bg1.jpg" "optimized/local-bg1.jpg" 80

echo "📸 Optimizing gallery images..."
optimize_jpeg "tub-before-1.jpeg" "optimized/tub-before-1.jpg" 85
optimize_jpeg "tub-after-1.jpeg" "optimized/tub-after-1.jpg" 85
optimize_jpeg "bathtub-2.jpg" "optimized/bathtub-2.jpg" 85
optimize_jpeg "bathtub-2-after.jpg" "optimized/bathtub-2-after.jpg" 85
optimize_jpeg "bathtub-3-before.jpg" "optimized/bathtub-3-before.jpg" 85
optimize_jpeg "bathtub-3-after.jpg" "optimized/bathtub-3-after.jpg" 85
optimize_jpeg "bathtub-4-before.jpg" "optimized/bathtub-4-before.jpg" 85
optimize_jpeg "bathtub-4-after.jpg" "optimized/bathtub-4-after.jpg" 85

# Create WebP versions if cwebp is available
if command -v cwebp &> /dev/null; then
    echo "📸 Creating WebP versions..."
    for img in optimized/*.jpg optimized/*.png; do
        if [ -f "$img" ]; then
            webp_name="${img%.*}.webp"
            create_webp "$img" "$webp_name" 80
        fi
    done
else
    echo "⚠️  WebP conversion skipped. Install webp tools with:"
    echo "   brew install webp"
fi

echo "✅ Image optimization complete!"
echo ""
echo "📊 Before/After size comparison:"
du -sh . optimized/ 2>/dev/null || echo "Size comparison requires optimized folder"

echo ""
echo "🚀 Next steps:"
echo "1. Review optimized images in images/optimized/"
echo "2. Replace original images with optimized versions"
echo "3. Update HTML to use WebP with fallbacks (if WebP created)"
echo "4. Test website performance with PageSpeed Insights"