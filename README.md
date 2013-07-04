conceptual-keyboard
===================

The idea is to use "concepts" to type words.  For example, to type "brassiere"
you may go through the categories "physical matter" --> "clothing" --> "women" ...

Dictionaries that are organized thematically include:

1. Roget's Thesaurus (1922 version is free on Gutenberg)
2. Roget's International Thesaurus
3. Longman Lexicon of Contemporary English
4. Random House Word Menu
5. (Chinese) 同義詞詞林

We can also make use of various ontologies such as:

6. WordNet
7. YAGO
8. SUMO

Right now I'm experimenting with various categorization schemes.

Currently the Chinese dictionary (同義詞詞林) is automatically loaded.  You can
use index2.html to open Roget's Thesaurus.  The sources of dictionaries and my
scripts for working with them are included in the "dictionaries" directory.

To Run:

Clone the project to your directory:

    git clone https://github.com/Cybernetic1/conceptual-keyboard.git

Then run the jar file:

    java -jar dist/conkey.jar

then open either URL in your browser:

    http://localhost:9090/index.html    (for Chinese)
	 http://localhost:9090/index2.html   (for English)

To Install Project:

Open in NetBeans IDE (I'm using 7.3.1).

For Chinese texts, be careful to use UTF-8 encoding, or you'll see garbage.

I used java Spark as the web server, and jQuery.

Explanation of the GUI:

1. The 3 columns represent levels 1,2,3 from left to right.  Click on each
   category to see its sub-categories.
2. After choosing the levels, a list of suggested words will be displayed in
   the horizontal space.  Click on each word to send it to the Green Box.
3. The Green and Red boxes are for constructing sentences.  You can use drag-
   -and-drop.

Explanation of buttons:

(They are mainly for my personal use.  You probably just want to browse the
categories at this stage.)

0. Green = words you want to keep;
   Red = words to be discarded
1. Send (white): sends the White box contents to output
2. Send (green): sends the Green box contents to output
3. Up: sends White box contents to Green box
4. Down: sends Green box contents to White box
5. X (white): clear White box
6. <x : delete one Green box item from the left
7. x> : delete one Green box item from the right
8. X (green): clear Green box
9. X (red): clear Red box
10. :) : append a smiley face to the White box text
11. quotes: wrap Chinese quotation marks around White box text
12. del: if checked, the next category you click will be removed
13. ch:  if checked, replace the next category you click with the text label
         in White box
14. +: add a word to the current list of suggested words
15. +node: add a node before the currently selected category
16. "voov" and "VIP":  send messages to certain Chinese chat rooms (requires
    my own Google Chrome plugin -- not included yet)

So, this is just to give a general idea.  Feel free to contact me if you're
interested to help develop this or have suggestions!

My e-mail = generic.intelligence at Gmail

TO-DO:

1. Abandon the use of Red, Green and White boxes, use drag-and-drop exclusively.
2. Make user-interface prettier.
3. Allow app to talk to server, collect frequent words/phrases from users.
4. Intelligent sentence generation?
5. Your suggestions?
