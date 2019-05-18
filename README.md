# SICP online textbook in Javascript

## Description

This is the newer online version of SICP textbook in Javascript for CS1101S students. The goal is to improve the readability and aesthetics of the textbook, which has been integrated with a new IDE -- `Source Academy` platform. Javascript snippets would be displayed in a popup new website page and evaluated using its built-in functions.

It is also possible to generate a copy of the orginal textbook in Scheme. However, evaluation of snippets are not yet supported and there are some missing snippets and images in the generated Scheme textbook.

Formulas are rendered using Mathjax. If the formulas are not rendered properly, try changing the setting by right clicking on the formula -> Math Settings -> Math Renderer.

## Requirements
For development & deployment:

* Rails 5.0.2
* Wget 1.19
* Java (for YUI Compressor)
* GNU Make 4.2

The generated web pages are static and can be hosted on any standard web servers.

## Overview

The original text is stored as xml files in the `xml` folder.

The html pages are generated in two steps. In the first step, the xml pages are imported to a Rails application. The application has three models: `Chapter`, `Snippet` and `Reference`. Content from each xml file is stored in a corresponding `chapter` record, while each named snippet is stored as a `snippet`, and each named section, subsection, figure or exercise is stored as a `reference`. When a snippet is evaluated, all its requirements are executed at background and its examples would be executed to evaluate the functionality and correctness while the snippet itself is displayed in the `Source Academy` platform. When a page is loaded, the xml contents are formatted into html pages by `Nokogiri`.

After the rails server is up and running, a copy of the html pages are saved locally using `Wget`.

## Configuration

Set the server for the playground in the environment variable $SOURCE_ACADEMY, e.g. 
```
export SOURCE_ACADEMY=http://localhost:37915/
```
The trailing `/` is important. This variable is read in `rails/app/controllers/chapters_controller.rb`. 

Before deploying, change the configurations at [constants.rb.def](rails/config/initializers/constants.rb.def).

`IDE_PREFIX`: The snippet and its requirements are sent through a GET request to the IDE. Change it to the correct URL and GET parameter name. Required snippets are sent by the name 'hidden'. To change this value, see the show method in [chapters_controller.rb](rails/app/controllers/chapters_controller.rb).

`GCSE_CX`: The search engine ID of Googel Custom Search. Create a new one [here](https://cse.google.com/cse/create/new).

## Deployment
Run `make javascript` or `make scheme`. The generated html pages and assets are saved in `rails-html` folder.

Run `make clean` to remove all generated pages, logs and temporary files.

If the server is still running, try:

$ lsof -wni tcp:3000
Then, use the number in the PID column to kill the process:

$ kill -9 PID

## Development
The Rails project is located at [rails](rails/). To test any changes made to the rails project itself, use the built-in server by running `rails s`. Specifically, the xml to html step is done by the `Chapters` controller, although in hindsight I realized it should be handled by model instead. Now it is at both the controller and model, but except for the index page, all other xml to html conversions are still handled by the controller. It would be a good idea to clean this part up before changing anything in those two files to ensure consistency.

If any changes are made to the xml file but you only want to test the dynamic/rails version of website, run `rails runner app/helpers/import_textbook.rb` to import the modified textbook to database.

Static site generation is handled by `rails/Rakefile`. It outputs the html pages to `rails/out` by default. Run `rake static:generate` to test this step.

## Bugs
* Google Custom Search doesn't seem to be working.
* The snippets containing '\n' would lead to newline rather than showing charater '\n' in the `Source Academy` platform. This problem is difficult to eliminate because the code encoder cannot differentiate them when reading content.

## XML2Latex

## Requirements
For development & deployment:
* node.js

## Set up
Run `npm install` to install dependencies.

## Generating Latex Files
Run `npm start`. 
Latex files will be in the latex folder.
Compile sicpjs.tex with XeLaTex+MakeIndex+BibTex for the pdf version.
