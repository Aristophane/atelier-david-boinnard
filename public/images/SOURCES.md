# Image sources

## Landing illustration

`clavicytherium-praetorius.jpg`: Michael Praetorius, *Syntagma musicum* (1620).
Complete 807 × 1217 scan, used without cropping or retouching.
Source and public-domain record: https://commons.wikimedia.org/wiki/File:Clavicytherium_Praetorius.jpg

## Instrument photographs

Photographs are from the Atelier David Boinnard website and its original PDF
instrument sheets: http://www.david-boinnard.com/4/historique.html

`../data/image_sources.json` records each improved image, its original thumbnail,
native dimensions, represented opus and source PDF URL. JPEG streams are copied
unchanged. Embedded JPEG 2000 photographs are decoded to lossless WebP to make
them readable by browsers, preserving their dimensions and original alpha mask.
No generated details, enlargement or sharpening are applied.

Re-extraction script: `scripts/extract_instrument_photos.py` in the project root.
