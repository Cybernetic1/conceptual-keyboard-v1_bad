
<img src="https://raw.github.com/Cybernetic1/conceptual-keyboard/master/Cartoon_octopus.png" alt="logo 2" title="Conkey"/>

Conceptual Keyboard
===================

<img src="https://raw.github.com/Cybernetic1/conceptual-keyboard/master/Screenshot_rogets_thesaurus.png" alt="(screen shot 1)" title="Screen shot 1"/>

The idea is to use "concepts" to type words.  For example, to type "brassiere"
you may go through the categories "physical matter" --> "clothing" --> "women" ...

Dictionaries that are organized thematically include:

1. Roget's Thesaurus (1922 version is free on Gutenberg)
2. Roget's International Thesaurus
3. Longman Lexicon of Contemporary English
4. Random House Word Menu
5. (Chinese) 同義詞詞林

We can also make use of various ontologies such as:

6. WordNet / ConceptNet
7. YAGO
8. SUMO

In the future we would add pictorial dictionary entries such as:

<img src="https://raw.github.com/Cybernetic1/conceptual-keyboard/master/pictorial-dictionary-demo.png" alt="(pictorial dictionary)" title="Pictorial dictionary"/>

Currently the Chinese dictionary "同義詞詞林" and Roget's Thesaurus are available.
The sources of dictionaries and my scripts for working with them are included in
the "dictionaries" directory.

To Run
=======

Clone the project to your directory:

    git clone https://github.com/Cybernetic1/conceptual-keyboard.git

Then run the server (you need to install nodejs first):

    node sse-server.js

then open this URL in your browser:

    http://localhost:8484/index.html


A Little Grammar Theory
=========================

Notice that the program is not "usable" at this stage, as you may find it
incapable of inputting complete sentences.  That is because the thesauri do not
have entries for all word forms.

According to simple grammar theory, words are divided into 4 main classes:
nouns, verbs, adjectives, adverbs.  For example:
"肅靜" quietnesss, "靜下來" quiet down, "很靜" very quiet, "靜靜地" quietly.
These are the "main class" words.  And then there are a limited number (perhaps
hundreds) of "functional" words, such as pronouns, prepositions, conjunctions,
determiners, exclamations, etc.  Whereas there are many thousands of main class
words.  So, my future plan is, add a function that can automatically convert
between the 4 main classes (nouns, verbs, adjectives, adverbs), and then add a
a small sub-category of all functional words.  This way, we can ensure that all
word forms are available to the user.

Explanation of the GUI
========================

1. The left column is the **Tree View** of categories and sub-categories.
2. Choose the categories and a list of suggested words will be displayed in right column.
3. Click on each word to send it to the Text Box (left-click will insert on the left and ditto for right-click).

Here's a screen shot: (English version is in the top directory)
<img src="https://raw.github.com/Cybernetic1/conceptual-keyboard/master/Screenshot_Chinese_synonym.png" alt="(screen shot 2)" title="Screen shot 2"/>

Explanation of buttons
==========================

(They are mainly for my personal use -- I automated some functions for use in chatrooms. You probably just want to browse the categories at this stage.)

1. Return: sends Text Box contents to chatroom
2. Up- and down-arrows: view history
3. X: clear Text Box
4. :) : append a smiley face to Text Box
5. 「」: wrap Chinese quotation marks around text
6. 国 : pronounce in Mandarin
7. delete: if checked, the next [item] you click will be removed
8. change:  if checked, replace the next [item] you click with Text Box content
9. +: add an [item] to the current list of suggested words
10. +node: add a node at the current category
11. You can Load and Save databases such as 同义词词林 and Roget's Thesaurus.

To-Do
=======

So, this is just to give a general idea.  Feel free to contact me if you're
interested to help develop this or have suggestions!

My e-mail = generic.intelligence at Gmail

TO-DO:

1. Make user-interface prettier.
2. Allow app to talk to server, collect frequent words/phrases from users.
3. Intelligent sentence generation?  Perhaps one key feature is to be able to
   change the word class (or part-of-speech) of a word.
4. Use pictures or virtual reality to select words, as in a visual dictionary.
5. Your ideas / suggestions?

Philosophical Argument for the Conceptual Input Method
========================================================

For western people, they have been using phonetic spelling since Phoenician times (around 3000 years ago).  We Chinese due to our geographic isolation missed out on that development, so we're still using something akin to Egyptians' hieroglyphics.  To westerners, using phonetic spelling is second nature, so they may not want to seek alternatives to it, because the existing solution is already good enough.

For many Chinese people, typing Chinese remains a handicap probably until Google pinyin which is a quite-good solution.  It enabled me from hardly-able-to-type-Chinese to quite-fluent in a matter of days.

* * *

Less than 20 binary questions can get us down to any word in use.  The organization of those dictionaries I found typically have 10-20 categories per level.  And because (2^4)^5 = 2^20, we need only make 5 decisions max.  In practice, I think the number is around 3-4.  The last decision is to choose the target word from a small list （about 10-20 words）.

* * *

​The categorization itself may be dynamic​, ie, generated by machine learning.  For example, on each level the computer suggests a few key words that can narrow down the search, and the user picks the keyword that is closer in meaning to her target.  There need not be a unique classification of all words.

* * *

理論上， 用筆劃輸入已經過時， 因為我們表達意見時， 從「思想－>筆劃－>字詞」的轉折是多餘的，
所以拼音輸入法 必然會贏， 因為任何人都識「講嘢」。

但根據這理論， 「思想－>語音－>文字」 也有一層多餘， 似乎直接由 「思想－>文字」 還好？
但實際上， 語音 似乎已經變成了 我們思想中根深蒂固的一部分。

但，又說回來，用概念輸入， 其實所「打」的鍵數， 可能還會比 併音少 （例如，《同義詞詞林》只需
3-4 個 decisions 便可找出一字／詞）。

可能是 使用者 不熟悉 這些分類法， 所以覺得不方便？
