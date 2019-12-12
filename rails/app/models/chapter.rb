# coding: utf-8
class Chapter < ActiveRecord::Base
   has_ancestry

   def chapter_number
       num = ""
       chapter = self
       if !chapter.nil? && chapter.order.to_s[0] != "0" && chapter.order.to_s[0] != "9"
           num = chapter.order.to_s
       else
           num = ""
       end
       # while !chapter.nil? && chapter.order != 0
       #     num = chapter.order.to_s + "." + num
       #     chapter = chapter.parent
       # end
       return num
   end

   def remove_tag_name(doc, tag)
       doc.search(tag).each do |node|
           node.after(node.children)
           node.remove
       end
   end

   def replace_tag(doc, tag, text)
       doc.search(tag).each do |node|
           node.after(text)
           node.remove
       end
   end

   def html_content
       @chapter = self
       content = @chapter.xml_content

       # String substitutions
       content = content.gsub('\\LaTeX','$\\rm\\LaTeX$');
       content = content.gsub('^$\langle','$\langle');
       content = content.gsub('\rangle$^','\rangle$');
       xml_doc = Nokogiri::XML(content)

       # Remove comments
       xml_doc.xpath('//comment()').each { |comment| comment.remove }

       # Remove tags according to textbook version
       if (LANGUAGE_VERSION == "javascript")
           xml_doc.search('SCHEME').remove
           remove_tag_name(xml_doc, "JAVASCRIPT")
       else
           xml_doc.search('JAVASCRIPT').remove
           remove_tag_name(xml_doc, "SCHEME")
       end

       if (!xml_doc.at('NAME').nil?)
           @title = @chapter.chapter_number + " " + xml_doc.at('NAME').text
           xml_doc.at('NAME').remove
       else
            @title = @chapter.title
       end
       
       xml_doc.search('COMMENT').remove       
       xml_doc.search('HISTORY').remove
       xml_doc.search('INDEX').remove
       xml_doc.search('LABEL').remove
       xml_doc.search('OMISSION').remove
       xml_doc.search('SCHEMEOUTPUT').remove
       xml_doc.search('SUBINDEX').remove
       remove_tag_name(xml_doc, "SPLITINLINE")

       # Using Mathjax, remove tag names
       remove_tag_name(xml_doc, "LATEX")
       remove_tag_name(xml_doc, "LATEXINLINE")

       # Renaming tags
       # divs
       xml_doc.search('ATTRIBUTION, CAPTION').each do |div|
               div['class'] = 'chapter-text-' + div.name
               div.name = 'div'
           end

       # spans
       xml_doc.search('AUTHOR, DATE, TITLE').each do |span|
               span['class'] = 'chapter-text-' + span.name
               span.name = 'span'
       end

       # Figure without img/with link to gif
       xml_doc.search('FIGURE').each do |figure|
           if (!figure['src'].nil?)
               figure.name = 'img'
           end
       end

       # Links
       xml_doc.search('LINK').each do |link|
           link.name = 'a'
           link['href'] = link['address']
       end

       # Headings
       xml_doc.search('SUBHEADING').each do |heading|
           heading.name = 'h2'
       end

       xml_doc.search('SUBSUBSECTION').each do |h1|
            h1.name = 'h1'
       end

       xml_doc.search('MATTERSECTION').each do |h1|
         h1.name = 'h1'
       end

       # Blockquote
       xml_doc.search('EPIGRAPH').each do |quote|
           quote.name = 'blockquote'
           quote['class'] = 'blockquote'
       end

       # TEXT
       xml_doc.search("TEXT").each do |text|
           text.name = 'p'
       end

        # P
        xml_doc.search("P").each do |text|
            text.name = 'p'
        end

        # BR
        xml_doc.search("BR").each do |text|
            text.name = 'br'
        end

       # Formatting

        replace_tag(xml_doc, 'APOS', '\'')
        replace_tag(xml_doc, 'SPACE', '&nbsp;')
        replace_tag(xml_doc, 'WJ', '&#8288;')
        replace_tag(xml_doc, 'AACUTE_LOWER', '&aacute;')
        replace_tag(xml_doc, 'AACUTE_UPPER', '&Aacute;')
        replace_tag(xml_doc, 'AGRAVE_LOWER', '&agrave;')
        replace_tag(xml_doc, 'AGRAVE_UPPER', '&Agrave;')
        replace_tag(xml_doc, 'ACIRC_LOWER', '&acirc;')
        replace_tag(xml_doc, 'EACUTE_LOWER', '&eacute;')
        replace_tag(xml_doc, 'EACUTE_UPPER', '&Eacute;')
        replace_tag(xml_doc, 'EGRAVE_LOWER', '&egrave;')
        replace_tag(xml_doc, 'EGRAVE_UPPER', '&Egrave;')
        replace_tag(xml_doc, 'ECIRC_LOWER', '&ecirc;')
        replace_tag(xml_doc, 'OUML_LOWER', '&ouml;')
        replace_tag(xml_doc, 'OUML_UPPER', '&Ouml;')
        replace_tag(xml_doc, 'UUML_LOWER', '&uuml;')
        replace_tag(xml_doc, 'UUML_UPPER', '&Uuml;')
        replace_tag(xml_doc, 'CCEDIL_LOWER', '&ccedil;')
        replace_tag(xml_doc, 'ELLIPSIS', '&#8230;')
        replace_tag(xml_doc, 'AMP', '&amp;')
        replace_tag(xml_doc, 'SECT', '&sect;')
        
        replace_tag(xml_doc, 'EMDASH', '&mdash;')
        replace_tag(xml_doc, 'ENDASH', '&ndash;')

        replace_tag(xml_doc, 'LaTeX', '$\\rm\\LaTeX$')
        replace_tag(xml_doc, 'TeX', '$\\rm\\TeX$')
        
        xml_doc.search('SCHEMEINLINE, JAVASCRIPTINLINE').each do |inline|
           inline.name = 'kbd'
       end



       # Footnotes
       added_footnote = false
       footnote_count = 1
       xml_doc.search('FOOTNOTE').each do |footnote|
           a = xml_doc.create_element("a", '[' + footnote_count.to_s + ']',
               :class => "superscript",
               :id => "footnote-link-" + footnote_count.to_s,
               :href => "#footnote-" + footnote_count.to_s)
           footnote.next = a
           footnote.unlink

           div = xml_doc.create_element("div",
               :class => "footnote")
           a_foot = xml_doc.create_element("a", '[' + footnote_count.to_s + '] ',
               :class => "footnote-number",
               :id => "footnote-" + footnote_count.to_s,
               :href => "#footnote-link-" + footnote_count.to_s)
           div.add_child(a_foot)
           div.add_child(footnote)

           if (!added_footnote)
               line = xml_doc.create_element("hr")
               xml_doc.root.add_child(line)
               added_footnote = true
           end
           xml_doc.root.add_child(div)
           footnote_count += 1
       end

       # Snippets
       count = 0;
       xml_doc.search('SNIPPET').each do |snippet|
           replace_tag(snippet, 'NAME', '')
           replace_tag(snippet, 'p', '')
           replace_tag(snippet, 'SCHEME_STATEMENT', '')
           if (!snippet.at('JAVASCRIPT_STATEMENT').nil?)
               stmt = snippet.at('JAVASCRIPT_STATEMENT').text
           else
               stmt = ''
           end
           replace_tag(snippet, 'JAVASCRIPT_STATEMENT', '')
           requires = snippet.search('REQUIRES').to_a.map{ |node| node.text }
           replace_tag(snippet, 'REQUIRES', '')
           replace_tag(snippet, 'EXAMPLE', '')
           if (snippet['EVAL'] == 'no')
               snippet.name = 'kbd'
               snippet['class'] = 'snippet'
               snippet.children = snippet.children.to_html.strip
           elsif (snippet['HIDE'] == 'yes' || snippet['SOLUTION'] == 'yes')
               snippet.remove
           else
               # Interactive snippet
               hidden_code = ''
               requires.each do |required_name|
                   required = Snippet.find_by(name: required_name,
                       language: LANGUAGE_VERSION)
                   if (!required.nil?)
                       hidden_code += required.get_required_code
                   else
                       puts "Warning: Cannot find " + LANGUAGE_VERSION + " snippet named "
                           + required_name + "."
                   end
               end

               code = CGI.unescapeHTML(snippet.children.to_html.strip.html_safe)
               snippet_div = xml_doc.create_element("div",
                   :class => "snippet", :id => "javascript_#{@chapter.id}_#{count}_div")
               snippet_event = "new window.JavascriptConsole('#{code}','javascript_#{@chapter.id}_#{count}','#{stmt}', event,1.0);" +
                       "window.eval('#{hidden_code}');"
               snippet_event = snippet_event.gsub("\n", '\n')
               #snippet_event = "new window.JavascriptConsole('#{code}','javascript_#{count}','#{stmt}', event,1.0);
               #        window.eval('#{hidden_code}');".tr("\t\n\r", '')

               # For prettyprint
               snippet_pre_div = xml_doc.create_element("div", :class => "pre-prettyprint")
               snippet_pre = xml_doc.create_element('pre', code, :class => 'prettyprint', :title => 'Evaluate Javascript expression',
                   :onclick => snippet_event)
               snippet_pre_div.add_child(snippet_pre)

               # For IDE
               get_param = IDE_PREFIX + Sanitize.clean(code) + '&hidden=' + Sanitize.clean(hidden_code)
               snippet_ide = xml_doc.create_element('a', "[Open in IDE]",
                   :href => get_param, :class => 'snippet-ide-link btn btn-primary')
               snippet_pre_div.add_child(snippet_ide)
               snippet.next = snippet_div
               snippet_div.next = snippet_pre_div
               #snippet_div.next = snippet_pre
               #snippet_pre.next = snippet_ide
               count += 1;
               snippet.remove
           end
       end

       remove_tag_name(xml_doc, "NAME")

       @html_doc = Nokogiri::HTML::DocumentFragment.parse ""
   #      xml_doc.search('TEXT, EPIGRAPH, ABOUT, CAPTION, FOOTNOTE, REFERENCE, EXERCISE').each do |text|
   #          new_par = xml_doc.create_element("div", :class => text.name)
   #          new_par.add_child(text)
   #          @html_doc.add_child(new_par)
   #      end
       xml_doc.children.each do |text|
           new_par = xml_doc.create_element("div", :class => text.name)
           new_par.add_child(text)
           @html_doc.add_child(new_par)
       end

   return @html_doc
   end
end
