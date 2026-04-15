import os
import sys
import glob
from rembg import remove
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

def process_image(input_path, output_path):
    print(f"Processing: {input_path}")
    try:
        # Load the image
        with open(input_path, 'rb') as i:
            input_data = i.read()
        
        # Remove background mathematically
        output_data = remove(input_data)
        
        # Open in PIL to add the 3D 'plastisch' effect
        import io
        img = Image.open(io.BytesIO(output_data)).convert("RGBA")
        
        # 1. Enhance the artwork (Glätten & Ausarbeiten)
        # Increase contrast slightly to make pencil lines pop
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.15)
        
        # Increase color/saturation slightly to make it lively
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.2)
        
        # 2. Add realistic drop shadow to make it 3D (plastisch)
        # Create a blank image larger than the original to hold the shadow
        padding = 60
        new_width = img.width + padding * 2
        new_height = img.height + padding * 2
        final_img = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        
        # Create the shadow mask
        shadow = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        shadow.paste(Image.new("RGBA", img.size, (0, 0, 0, 160)), (padding + 15, padding + 25), img)
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        
        # Paste shadow then the original image
        final_img.paste(shadow, (0, 0), shadow)
        final_img.paste(img, (padding, padding), img)
        
        # Crop tight around the final bounding box
        bbox = final_img.getbbox()
        if bbox:
            final_img = final_img.crop(bbox)
        
        # Save the result
        final_img.save(output_path, "PNG")
        print(f"Saved highly-refined 3D token to: {output_path}")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    if not os.path.exists('assets/img/extracted'):
        os.makedirs('assets/img/extracted')
        
    # Process the latest specific photos the user uploaded (the new fridge magnets)
    # IMG_7445, IMG_7385, IMG_7174, IMG_3580, IMG_9014
    target_files = ['IMG_8393.jpeg', 'IMG_6708.jpeg', 'IMG_2897.jpeg', 'IMG_2878.jpeg', 'IMG_2881.jpeg', 'IMG_2993.jpeg', 'IMG_2880.jpeg', 'IMG_2896.jpeg', 'IMG_2879.jpeg', 'IMG_2875.jpeg', 'IMG_2604.jpeg', 'IMG_2868.jpeg', 'IMG_6667.jpeg', 'IMG_2608.jpeg', 'IMG_6670.jpeg', 'IMG_2994.jpeg', 'IMG_2886.jpeg', 'IMG_2869.jpeg', 'IMG_2605.jpeg', 'IMG_2890.jpeg', 'IMG_8121.jpeg', 'IMG_6667 2.jpeg', 'IMG_2900.jpeg', 'IMG_2885.jpeg', 'IMG_2606.jpeg', 'IMG_9026.jpeg', 'IMG_6668.jpeg', 'IMG_2884.jpeg', 'IMG_2876.jpeg', 'IMG_2909.jpeg', 'IMG_2883.jpeg', 'IMG_6668 2.jpeg', 'IMG_1915.jpeg', 'IMG_7985.jpeg', 'IMG_2894.jpeg', 'IMG_2601.jpeg', 'IMG_2882.jpeg', 'IMG_2877.jpeg', 'IMG_2898.jpeg']
    
    for filename in target_files:
        input_path = os.path.join('assets/img', filename)
        if os.path.exists(input_path):
            output_path = os.path.join('assets/img/extracted', filename.replace('.jpeg', '_3d.png').replace('.jpg', '_3d.png'))
            process_image(input_path, output_path)
