# coding: utf-8
require 'cgi'

class ChaptersController < ApplicationController
    # def index
    #     preface = Chapter.find_by title: 'Webpreface'
    #     @preface_html = preface.html_content
    # end

    # The following methods are better put in the model rather than the controller
    # I already copied them there
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

    def js_scheme_output(doc, tag)
      doc.search(tag).each do |node|

        wrapper_div = doc.create_element("div", :class => "code")

        node.before(node.children)
        
        node.remove
        end
    end
    
    def show
        @chapter = Chapter.find(params[:id])
        content = @chapter.xml_content
        order = @chapter.order
        ex_start_index = @chapter.exercise_start_number


        
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

        # Wrap each <p>...</p> in a <a name="§n"></a> to serve as a permalink for each paragraph
        paragraph_number = 0
        xml_doc.search("TEXT").each do |p|
          paragraph_number += 1
          permalink_wrap(xml_doc, p, "p#{paragraph_number}")
        end

        # Figure without img/with link to gif
        xml_doc.search('FIGURE').each do |figure|
            label = figure.at('LABEL')
            if (!label.nil? && !label['NAME'].nil?)
                full_name = label['NAME']
                kind, ref_name = full_name.split(':')
                required = Reference.find_by(kind: kind, name: ref_name)
                if (!required.nil?)
                    cap = figure.at('CAPTION')
                    if (!cap.nil?)
                        # fig_prefix = Nokogiri::XML::Node.new('b', xml_doc)
                        fig_prefix = xml_doc.create_element('b')
                        cap.children.first.add_previous_sibling(fig_prefix)
                        link = xml_doc.create_element("a", 'Figure ' + required.numbering + ' ',
                                :class => "caption",
                                :id => "fig_" + required.numbering,
                                :href => "#fig_" + required.numbering)
                        fig_prefix.add_child(link)
                    end
                end 
            end
            if (!figure['src'].nil?)
                figure.name = 'img'
            end
        end

        xml_doc.search('EXERCISE').each do |ex|
            label = ex.at('LABEL')
            if (!label.nil? && !label['NAME'].nil?)
                full_name = label['NAME']
                kind, ref_name = full_name.split(':')
                required = Reference.find_by(kind: kind, name: ref_name)
                if (!required.nil?)
                    ex_numbering = required.numbering
                end
            else
                ex_numbering = order[0] + '.' + ex_start_index.to_s
            end
            b = xml_doc.create_element("b")
            ex.children.first.add_previous_sibling(b)
            a = xml_doc.create_element("a", "Exercise " + ex_numbering + " ",
                :class => "exercise-number permalink",
                :id => "ex_" + ex_numbering)
            b.add_child(a)
            ex_start_index += 1

            no_solution_count = 1
            solution = ex.at('SOLUTION')
            if (solution.nil?)
                solution_div = xml_doc.create_element("div", :class => 'Solution')
                solution_btn_div = xml_doc.create_element("div", :class => "solution_btn")

                solution_btn = xml_doc.create_element("button", "Add solution",
                    :class => "btn btn-secondary solution_btn",
                    :href => "#no_solution_#{@chapter.id}_#{no_solution_count}_div")
                solution_btn["data-toggle"] = "collapse"
                solution_content = xml_doc.create_element("div",
                                       :class => 'solution_content collapse',
                                       :id => "no_solution_#{@chapter.id}_#{no_solution_count}_div")

                solution_content.add_child("There is currently no solution available for this exercise. This textbook adaptation is a community effort. Do consider contributing by providing a solution for this exercise, using a Pull Request in <LINK address='https://github.com/source-academy/sicp'>Github</LINK>.")
                solution_div.add_child(solution_btn_div)
                solution_div.add_child(solution_content)
                solution_btn_div.add_child(solution_btn)
                ex.add_child(solution_div)
                no_solution_count += 1

            end            

            permalink_wrap(xml_doc, ex, "ex_#{ex_numbering}")
        end

        
        # ref
        xml_doc.search("REF").each do |ref|
            if (!ref['NAME'].nil?)
                full_name = ref['NAME']
                kind, ref_name = full_name.split(':')
                required = Reference.find_by(kind: kind, name: ref_name)
                if (!required.nil?)
                    # ref.content = required.numbering
                    linked_chapter = Chapter.find_by(order: required.order)
                    if (!linked_chapter.nil?)
                        if kind == "sec"
                            link = linked_chapter.id.to_s
                        elsif kind == "ex"
                            link = linked_chapter.id.to_s + "#ex_" + required.numbering
                        else
                            link = linked_chapter.id.to_s + "#fig_" + required.numbering
                        end
                        a = xml_doc.create_element("a", required.numbering,
                            :class => "superscript",
                            :id => order + "-" + kind + "-link-" + required.numbering,
                            :href => link)
                        # ref.next = a
                        ref.add_child(a)
                    else
                      ref.add_child(xml_doc.create_element("strong", "No linked chapter"))
                    end
                else
                  ref.add_child(xml_doc.create_element("strong", "Cound not find label for #{full_name}"))
                end    
            else
              ref.add_child(xml_doc.create_element("strong", "Broken REF tag"))
            end    
        end

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

        # Links
        xml_doc.search('LINK').each do |link|
            link.name = 'a'
            link['href'] = link['address']
        end

        # Headings
        # Wrap each <h>...</h> in a <a name="§n"></a> to serve as a permalink for each paragraph
        heading_number = 0
        xml_doc.search('SUBHEADING').each do |heading|
          heading.name = 'h2'
          heading_number += 1
          permalink_wrap(xml_doc, heading, "h#{heading_number}")
        end

        xml_doc.search('SUBSUBSECTION').each do |h1|
          h1.name = 'h1'
          heading_number += 1
          permalink_wrap(xml_doc, h1, "h#{heading_number}")
        end

        xml_doc.search('MATTERSECTION').each do |h1|
          h1.name = 'h1'
          heading_number += 1
          permalink_wrap(xml_doc, h1, "h#{heading_number}")
        end

        # Blockquote
        xml_doc.search('EPIGRAPH').each do |quote|
            quote.name = 'blockquote'
            quote['class'] = 'blockquote'
        end

        # text
        xml_doc.search("TEXT").each do |text|
            text.name = 'p'
        end

        # p
        xml_doc.search("P").each do |text|
            text.name = 'p'
        end

        # BR
        xml_doc.search("BR").each do |text|
            text.name = 'br'
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

        js_scheme_output(xml_doc, 'JAVASCRIPTOUTPUT')
        
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

        # Solution
        solution_count = 1
        xml_doc.search('SOLUTION').each do |solution|
            # replace_tag(solution, 'SCHEME_STATEMENT', '')
            # solution.name = ''

            solution_div = xml_doc.create_element("div", :class => 'Solution')
            solution_btn_div = xml_doc.create_element("div", :class => "solution_btn")
            solution_btn = xml_doc.create_element("button", "Solution", :class => "btn btn-secondary solution_btn", 
                :href => "#solution_#{@chapter.id}_#{solution_count}_div")
            solution_btn["data-toggle"] = "collapse"

            solution_content = xml_doc.create_element("div", :class => 'solution_content collapse', :id => "solution_#{@chapter.id}_#{solution_count}_div")
            solution_content.add_child(solution.to_html)

            solution_div.add_child(solution_btn_div)
            solution_div.add_child(solution_content)
            solution_btn_div.add_child(solution_btn)

            solution.next = solution_div
            solution_count += 1
            solution.remove
        end

        # Snippets
        count = 0;
        xml_doc.search('SNIPPET').each do |snippet|
            snippet_name = snippet.at('NAME')
            if (!snippet_name.nil?)
                snippet_name = snippet_name.content
            else
                snippet_name = ''
            end
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
            examples = snippet.search('EXAMPLE').to_a.map { |node| node.text  }
            replace_tag(snippet, 'EXAMPLE', '')
            if (snippet['LATEX'] == 'yes')
                snippet.name = 'kbd'
                snippet['class'] = 'snippet'
                snippet.children = snippet.children.to_html.strip
            elsif (snippet['HIDE'] == 'yes') 
                snippet.remove
            else
                # Interactive snippet
                # get all required function names
                all_required_names = Array.new
                requires.each do |required_name|
                    required = Snippet.find_by(name: required_name,
                        language: LANGUAGE_VERSION)
                    if (!required.nil?)
                        all_required_names = required.get_required_function_name(all_required_names)
                    else
                        puts "Warning: Cannot find " + LANGUAGE_VERSION + " snippet named "
                            + required_name + "."
                    end
                end
                # get example's code if any
                example_code = ''
                examples.each do |example_name|
                    example = Snippet.find_by(name: example_name, language: LANGUAGE_VERSION)
                    if (!example.nil?)
                        if (example.run_code=='')
                            example_code += example.code
                        else
                            example_code += example.run_code
                        end
                        all_required_names = example.get_required_function_name(all_required_names)
                        all_required_names.delete(example_name)
                    else
                        puts "Warning: Cannot find " + LANGUAGE_VERSION + " snippet named "
                            + example_name + "."
                    end
                end    

                # handling single quotes within programs
                example_code = example_code.gsub("'", "\\\\'")
                
                # filter repeated functions and current snippet
                all_required_names = all_required_names.uniq
                all_required_names.delete(snippet_name)
                # add required code into hidden_code
                hidden_code = ''
                all_required_names.each do |required_name|
                    required = Snippet.find_by(name: required_name,
                        language: LANGUAGE_VERSION)
                    if (!required.nil?)
                        if (required.run_code=='')
                            hidden_code += required.code
                        else
                            hidden_code += required.run_code
                        end
                    else
                        puts "Warning: Cannot find " + LANGUAGE_VERSION + " snippet named "
                            + required_name + "."
                    end
                end  

                # handling single quotes within programs
                hidden_code = hidden_code.gsub("'", "\\\\'")
                
                code = CGI.unescapeHTML(snippet.children.to_html.strip.html_safe)
                platform_code = code
                
                if (LANGUAGE_VERSION=="javascript")
                    runnable = snippet.at("JAVASCRIPT_RUN")
                    if (!runnable.nil?)
                        platform_code = CGI.unescapeHTML(runnable.children.to_html.strip)
                        runnable.remove
                        code = CGI.unescapeHTML(snippet.children.to_html.strip.html_safe)
                    end
                end

                # handling single quotes within programs
                platform_code = platform_code.gsub("'", "\\\\'")

                
                ext = ""
                ext_string = snippet["EXTERNAL_LIBRARY"]
                    if (!ext_string.nil?)
                        ext = "&ext=" + ext_string
                    end

                snippet_div = xml_doc.create_element("div",
                                                     :class => "snippet",
                                                     :id => "javascript_#{@chapter.id}_#{count}_div")

                chap = order[0];
                chap_string = snippet["CHAP"]
                    if (!chap_string.nil?)
                        chap = chap_string
                    end
                
                
                snippet_event = "var compressed = LZString.compressToEncodedURIComponent('#{hidden_code}'+'\n'+'#{platform_code}'+'\n'+'#{example_code}'+'\n'); " + 
                        "var url = 'https://sourceacademy.nus.edu.sg/playground#chap=#{chap}#{ext}&prgrm='+compressed;" +
                        ### "var url = '#{`echo $SOURCE_ACADEMY`}playground#chap=#{order[0]}&prgrm='+compressed;" +
                        " window.open(url); "
                
                snippet_event = snippet_event.gsub("\n", '\n')

                # For prettyprint
                snippet_pre_div = xml_doc.create_element("div", :class => "pre-prettyprint")

                if (snippet['EVAL'] == 'no')
                    snippet_pre = xml_doc.create_element('pre', code, :class => 'prettyprint no-eval')
                else
                    snippet_pre = xml_doc.create_element('pre', code, :class => 'prettyprint', :title => 'Evaluate Javascript expression', 
                        :onclick => snippet_event)
                end
                snippet_pre_div.add_child(snippet_pre)

                snippet_div.add_child(snippet_pre_div)
                
                snippet.next = snippet_div
                # end
                count += 1;
                snippet.remove
            end
        end

        remove_tag_name(xml_doc, "NAME")

        # Finds all sections with attribute WIP="yes" and adds a note right after the heading
        xml_doc.search('SECTION').each do |s|
          if (s['WIP'] || "").downcase == 'yes' then
            wip_stamp = xml_doc.create_element("div", :class => "wip-stamp")
            wip_stamp.add_child("Note: this section is a work in progress!")
            s.prepend_child(wip_stamp)
          end
        end
        # Finds all subsections with attribute WIP="yes" and adds a note right after the heading
        xml_doc.search('SUBSECTION').each do |s|
          if (s['WIP'] || "").downcase == 'yes' then
            wip_stamp = xml_doc.create_element("div", :class => "wip-stamp")
            wip_stamp.add_child("Note: this section is a work in progress!")
            s.prepend_child(wip_stamp)
          end
        end
                
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

        @html_doc = @html_doc.to_html
        respond_to do |format|
            format.html
        end
        
        return @html_doc
    end

    def permalink_wrap(xml_doc, tag, name)
      permalink = xml_doc.create_element("a",
                                         :name => name,
                                         :class => "permalink",
                                        )
      wrapper_div = xml_doc.create_element("div",
                                           :class => "permalink",
                                          )
      tag.before(wrapper_div)
      wrapper_div.add_child(permalink)
      wrapper_div.add_child(tag)
    end

end
# 
