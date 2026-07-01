# Favicon of SICP web edition

## Description

The favicon of a website is the little icon that shows up at the top of the browser tab,
next to the title of the web page that you visit in the tab. It is set in the
header of the page, using the link "rel="shortcut icon".

## Designing the icon

Use any graphics tool to design the icon. (We have used Powerpoint,
see `lambda1.pptx` and `lambda2.pptx`.)
Keep it simple, and bold. Transparent background looks sleek. 

## Converting to ICO

From your graphics tool, export to PNG. If you want to make the
background transparent, use Adobe Photoshop.
For that, open the PNG in Photoshop and 
left-click on the Eraser tool. Choose "Magic Eraser Tool". Then click
on all white parts to make them transparent. Save the file. 
Transform the PNG to ICO format (32x32 pixels)
gusing the ImageMagick tool `convert`:

```
convert -resize x32 -gravity center -crop 32x32+0+0 lambda1_transparent.png lambda1.ico
```

## Installation

Copy the ICO file to `rails/app/assets/images/favicon.ico`.
The Ruby-on-Rails system will find it there and install it in the
right places.

```
cp lambda1.ico ../../app/assets/images/favicon.ico
```
