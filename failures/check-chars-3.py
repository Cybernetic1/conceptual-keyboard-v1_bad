# Importing Image and ImageGrab module from PIL package 
from PIL import Image, ImageGrab
    
# creating an image object
im1 = Image.open("fire-icon.png")

# using the grab method
im2 = ImageGrab.grab(bbox = None)
    
im2.show()
