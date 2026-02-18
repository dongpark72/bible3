from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create valid image
    img = Image.new('RGB', (size, size), color='#b38b1d') # Base gold color
    d = ImageDraw.Draw(img)
    
    # Add a slight gradient effect (simulated by drawing rectangles)
    for i in range(size):
        r = int(179 + (i/size) * (212 - 179))
        g = int(139 + (i/size) * (175 - 139))
        b = int(29 + (i/size) * (55 - 29))
        d.line([(0, i), (size, i)], fill=(r, g, b))

    # Draw a cross
    cross_color = (255, 255, 255)
    cross_width = int(size * 0.15)
    cross_h_bar_y = int(size * 0.4)
    cross_v_bar_x = int(size * 0.5)
    
    # Vertical bar
    v_bar_top = int(size * 0.2)
    v_bar_bottom = int(size * 0.8)
    d.rectangle(
        [
            (cross_v_bar_x - cross_width // 2, v_bar_top),
            (cross_v_bar_x + cross_width // 2, v_bar_bottom)
        ], 
        fill=cross_color
    )
    
    # Horizontal bar
    h_bar_left = int(size * 0.3)
    h_bar_right = int(size * 0.7)
    d.rectangle(
        [
            (h_bar_left, cross_h_bar_y - cross_width // 2),
            (h_bar_right, cross_h_bar_y + cross_width // 2)
        ],
        fill=cross_color
    )
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    img.save(filename)
    print(f"Created {filename}")

if __name__ == "__main__":
    create_icon(192, "e:/Antigravity/bible/icons/icon-192.png")
    create_icon(512, "e:/Antigravity/bible/icons/icon-512.png")
