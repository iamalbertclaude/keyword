import os
from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Draw a simple background color
    bg_color = (66, 133, 244) # Google blue
    padding = size // 10

    # Draw a rounded rectangle for a tab look
    draw.rounded_rectangle(
        [(padding, padding), (size - padding, size - padding)],
        radius=size//8,
        fill=bg_color
    )

    # Draw a magnifying glass symbol
    glass_color = (255, 255, 255)
    center = size // 2
    radius = size // 4

    # Circle for magnifying glass
    draw.ellipse(
        [(center - radius, center - radius - padding//2), (center + radius, center + radius - padding//2)],
        outline=glass_color,
        width=max(2, size // 12)
    )

    # Handle for magnifying glass
    handle_start = (center + radius//1.5, center + radius//1.5 - padding//2)
    handle_end = (center + radius * 1.5, center + radius * 1.5 - padding//2)
    draw.line(
        [handle_start, handle_end],
        fill=glass_color,
        width=max(2, size // 8)
    )

    img.save(filename)

create_icon(16, 'icons/icon16.png')
create_icon(48, 'icons/icon48.png')
create_icon(128, 'icons/icon128.png')
