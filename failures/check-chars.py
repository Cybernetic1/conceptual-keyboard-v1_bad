# -*- coding: utf-8 -*-

# check if a list of Chinese characters are displayed correctly

# TO-DO:
# * 

import pygame

# Initialise screen
pygame.init()
screen = pygame.display.set_mode((650, 150))
pygame.display.set_caption ('上海 pygame')

# Fill background
background = pygame.Surface(screen.get_size())
background = background.convert()
background.fill((200, 200, 200))

# Display some text
font = pygame.font.Font('/usr/share/fonts/truetype/Alibaba-PuHuiTi-Regular.ttf', 60)
text = font.render ("Hello I 𫔆 Love 上海", 1, (100, 100, 100))
textpos = text.get_rect()
textpos.center = background.get_rect().center
background.blit(text, textpos)

# Blit everything to the screen
screen.blit(background, (0, 0))
pygame.display.flip()

# Event loop
running = True
while running:
	for event in pygame.event.get():
		if event.type == pygame.KEYDOWN:
			if event.key == pygame.K_ESCAPE:
				running = False

	screen.blit(background, (0, 0))
	pygame.display.flip()

pygame.quit()
