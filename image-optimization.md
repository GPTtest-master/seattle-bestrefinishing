# Image Optimization Script for Best Refinishing Website

## WebP Conversion Instructions

To maximize PageSpeed performance, convert the following images to WebP format:

### Priority Images (Convert First):
1. `/images/logo1.png` → `/images/logo1.webp`
2. `/images/tub-bg.jpg` → `/images/tub-bg.webp`
3. `/images/img-7041-rotated.jpg` → `/images/img-7041-rotated.webp`
4. `/images/img-7119-rotated.jpg` → `/images/img-7119-rotated.webp`

### Gallery Images:
1. `/images/tub-before-1.jpeg` → `/images/tub-before-1.webp`
2. `/images/tub-after-1.jpeg` → `/images/tub-after-1.webp`
3. `/images/bathtub-2.jpg` → `/images/bathtub-2.webp`
4. `/images/bathtub-2-after.jpg` → `/images/bathtub-2-after.webp`

### Commands for conversion (if you have imagemagick/cwebp):

```bash
# Navigate to images directory
cd /Users/testaccount/Downloads/seattle-bestrefinishing-main/images

# Convert priority images
cwebp -q 85 logo1.png -o logo1.webp
cwebp -q 80 tub-bg.jpg -o tub-bg.webp
cwebp -q 80 img-7041-rotated.jpg -o img-7041-rotated.webp
cwebp -q 80 img-7119-rotated.jpg -o img-7119-rotated.webp

# Convert gallery images
cwebp -q 75 tub-before-1.jpeg -o tub-before-1.webp
cwebp -q 75 tub-after-1.jpeg -o tub-after-1.webp
cwebp -q 75 bathtub-2.jpg -o bathtub-2.webp
cwebp -q 75 bathtub-2-after.jpg -o bathtub-2-after.webp
```

### Online Conversion Tools:
- https://squoosh.app/ (Google's image optimizer)
- https://convertio.co/jpg-webp/
- https://cloudconvert.com/jpg-to-webp

## Expected Performance Gains:
- Image file sizes: 25-35% smaller
- Page load time: 1-2 seconds faster
- PageSpeed score: +10-15 points