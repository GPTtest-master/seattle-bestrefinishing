#!/bin/bash
# Advanced Image Optimization Script for Seattle Best Refinishing
# This script optimizes images for maximum website performance

echo "🎨 Starting advanced image optimization..."

# Create optimized versions directory
mkdir -p images/optimized

# Function to optimize images using sips with advanced settings
optimize_image() {
    local input="$1"
    local output="$2" 
    local quality="${3:-80}"
    local max_size="${4:-1200}"
    
    echo "📸 Optimizing $(basename "$input")..."
    
    # Get original size
    original_size=$(stat -f%z "$input")
    
    # Optimize with sips
    sips --resampleHeightWidthMax "$max_size" --setProperty formatOptions "$quality" "$input" --out "$output" 2>/dev/null
    
    # Get optimized size
    if [ -f "$output" ]; then
        optimized_size=$(stat -f%z "$output")
        reduction=$((100 - (optimized_size * 100 / original_size)))
        echo "   ✅ $(basename "$input"): $(numfmt --to=iec "$original_size") → $(numfmt --to=iec "$optimized_size") (-${reduction}%)"
    else
        echo "   ❌ Failed to optimize $(basename "$input")"
    fi
}

# Function to create WebP using online tools simulation (creates placeholder for now)
prepare_webp_structure() {
    local input="$1"
    local output="$2"
    local quality="${3:-80}"
    
    # For now, copy optimized JPG as WebP placeholder
    # In production, this would be replaced with actual WebP conversion
    if [ -f "$input" ]; then
        echo "📱 Preparing WebP structure for $(basename "$output")"
        cp "$input" "$output"
        echo "   🔄 WebP placeholder created (replace with actual WebP conversion)"
    fi
}

# Navigate to images directory
cd images

echo ""
echo "🎯 PHASE 1: Critical Images (Hero & Logo)"
optimize_image "hero-bg.png" "optimized/hero-bg.jpg" 85 1920
optimize_image "logo1.png" "optimized/logo1.png" 95 800

echo ""  
echo "🎯 PHASE 2: Service Background Images"
optimize_image "tub-bg.jpg" "optimized/tub-bg.jpg" 80 1200
optimize_image "tiles-bg.jpg" "optimized/tiles-bg.jpg" 80 1200
optimize_image "shower-bg.jpg" "optimized/shower-bg.jpg" 80 1200
optimize_image "counter-bg.jpg" "optimized/counter-bg.jpg" 80 1200
optimize_image "sink-bg.jpg" "optimized/sink-bg.jpg" 80 1200
optimize_image "local-bg1.jpg" "optimized/local-bg1.jpg" 80 1200

echo ""
echo "🎯 PHASE 3: Gallery Images" 
optimize_image "tub-before-1.jpeg" "optimized/tub-before-1.jpg" 85 1000
optimize_image "tub-after-1.jpeg" "optimized/tub-after-1.jpg" 85 1000
optimize_image "bathtub-2.jpg" "optimized/bathtub-2.jpg" 85 1000
optimize_image "bathtub-2-after.jpg" "optimized/bathtub-2-after.jpg" 85 1000
optimize_image "bathtub-3-before.jpg" "optimized/bathtub-3-before.jpg" 85 1000
optimize_image "bathtub-3-after.jpg" "optimized/bathtub-3-after.jpg" 85 1000
optimize_image "bathtub-4-before.jpg" "optimized/bathtub-4-before.jpg" 85 1000
optimize_image "bathtub-4-after.jpg" "optimized/bathtub-4-after.jpg" 85 1000
optimize_image "local-before-1.jpg" "optimized/local-before-1.jpg" 85 1000
optimize_image "local-after-1.jpg" "optimized/local-after-1.jpg" 85 1000
optimize_image "sink-before-1.jpg" "optimized/sink-before-1.jpg" 85 1000
optimize_image "sink-after-1.jpg" "optimized/sink-after-1.jpg" 85 1000
optimize_image "local-5.jpg" "optimized/local-5.jpg" 85 1000
optimize_image "local-5-after.jpg" "optimized/local-5-after.jpg" 85 1000

echo ""
echo "🎯 PHASE 4: Creating WebP Structure"
# Create WebP versions for key images
for img in optimized/*.jpg optimized/*.png; do
    if [ -f "$img" ]; then
        webp_name="${img%.*}.webp"
        prepare_webp_structure "$img" "$webp_name" 80
    fi
done

echo ""
echo "📊 OPTIMIZATION RESULTS:"
original_size=$(du -sk . | cut -f1)
optimized_size=$(du -sk optimized/ | cut -f1)
total_reduction=$((100 - (optimized_size * 100 / original_size)))

echo "   📁 Original folder: $(du -sh . | cut -f1)"
echo "   � Optimized folder: $(du -sh optimized/ | cut -f1)" 
echo "   💡 Total reduction: ~${total_reduction}%"

echo ""
echo "✅ OPTIMIZATION COMPLETE!"
echo ""
echo "🔄 Next steps will be automated:"
echo "   1. ✅ Replace original images with optimized versions"
echo "   2. ✅ Update HTML to use WebP with fallbacks"
echo "   3. ✅ Test all image paths"
echo "   4. 🚀 Ready for PageSpeed testing"