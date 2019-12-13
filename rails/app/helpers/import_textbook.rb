def add_subdirs(parent_dir, dirname, parent, blacklist)
    # Add all xml files to the database recursively
    # Text are added to table Chapter and snippets are added to table Snippet
    # Use blacklist to prevent certain files from being added
    current_dir = parent_dir + "/" + dirname
    Dir.chdir(current_dir)
    file_name = dirname + ".xml"
    begin
        content = File.read(file_name)
        new_chapter = add_text(dirname, content, parent)
    rescue
        puts "File " + file_name + " does not exist."
        new_chapter = parent
    end
    
    # Make sure that chapters are added in the correct order
    d = Dir.glob("*").sort
    d.each do |entry|
        puts "processing file " + entry 
        if (entry == '.' || entry == "..")
        elsif (File::directory?(current_dir+"/"+entry))
            add_subdirs(current_dir, entry, new_chapter, blacklist)
        elsif (entry != file_name && entry.end_with?("xml") && !blacklist.include?(entry))
            content = File.read(current_dir+"/"+entry)
            add_text(entry, content, new_chapter)
        end
    end
end

#def replace_tag(doc, tag, text)
#    doc.search(tag).each do |node|
#        node.after(text)
#    end
#end

def add_text(title, content, parent)
    # Do the tidying/parsing here; not point parsing every time the textbook is loaded
    # Can use the code from add_subdirs
    puts "Importing: " + title
    add_snippets(content)
    order = title[/([0-9]+)/]
    if (order.nil?)
        order = ""
    elsif (!parent.nil?)
        order = parent.order.to_s + '.' + order.to_s
    else
        order = order.to_s
    end
    exercise_number = add_references(content, order)
    return Chapter.create! :title => title, :xml_content => content,
        :parent => parent, :order => order, :exercise_number => exercise_number
end


def add_snippets(text)
    # Scan through the text and add snippets to database
    # Will add named snippets only
    compressor = YUI::JavaScriptCompressor.new
    xml_doc = Nokogiri::XML(text)
    xml_doc.search('SNIPPET').each do |snippet|
        name = snippet.search('NAME').text
        if name.blank?
            # Unnamed snippet won't be referenced elsewhere
            next
        end

        requires = snippet.search('REQUIRES').to_a.map{ |node| node.text }
        do_eval = (snippet.search('EVAL') != 'no')
        hide = (snippet.search('HIDE') == 'yes')
        example = snippet.search('EXAMPLE').text

        # Add scheme snippets
        code = snippet.search('SCHEME')
        if (!code.blank?)
            new_snippet = Snippet.create! :name => name, :eval => do_eval,
                :code => code.text, :hide => hide, :example => example,
                :language => 'scheme', :required_snippet_names => requires
        end

        # Add javascript snippets
        code = snippet.search('JAVASCRIPT')
        if (!code.blank?)
            begin
                min_code = code.text
                #min_code = compressor.compress(code.text)
            rescue
                puts "Minifying " + name + " failed."
                min_code = code.text
            end
            lan = "javascript"
            exist = Snippet.find_by(name: name, language: lan)
            if (exist.nil?)
                code = snippet.search('JAVASCRIPT_RUN')
                if (!code.blank?)
                    run_code = code.text
                else
                    run_code = ''
                end
                new_snippet = Snippet.create! :name => name, :eval => do_eval,
                    :code => min_code, :run_code => run_code, :hide => hide, :example => example,
                    :language => 'javascript', :required_snippet_names => requires
            else
                puts "Already has snippet named " + name + " in " + lan
            end
        end
    end
end

def find_snippet_requirements()
    Snippet.all.each do |snippet|
        lan = snippet.language
        required_names = snippet.required_snippet_names
        required_names.each do |name|
            required_snippet = Snippet.find_by(name: name, language: lan)
            if (required_snippet.nil?)
                puts "Warning: No snippet named " + name + " in " + lan
            else
                snippet.required_snippets << required_snippet
            end
        end
    end
end

def test_snippet_requirements()
    Snippet.all.each do |snippet|
        puts snippet.name + " requires" + snippet.required_snippets.to_a.to_s
        #gets
    end
end


def add_references(text, order)
    # Scan through the text and add references to database
    # Will add named references only
    compressor = YUI::JavaScriptCompressor.new
    xml_doc = Nokogiri::XML(text)
    if (LANGUAGE_VERSION == "javascript")
        xml_doc.search('SCHEME').remove
    else
        xml_doc.search('JAVASCRIPT').remove
    end
    
    # search for figures
    xml_doc.search('FIGURE').each do |fig|
        if (!fig.at('LABEL').nil?)
            full_name = fig.at('LABEL')['NAME']
            kind, name = full_name.split(":")
            if kind == "fig"
                exist = Reference.find_by(name: name, kind: kind)
                if (exist.nil?)
                    new_ref = Reference.create! :name => name, :kind => kind, :order => order, :numbering => order[0]
                end
            end
        end
    end
    # search for exercise
    ex_count = 0
    xml_doc.search('EXERCISE').each do |exercise|
        ex_count += 1
        if (!exercise.at('LABEL').nil?)
            full_name = exercise.at('LABEL')['NAME']
            kind, name = full_name.split(":")
            if kind == "ex"
                exist = Reference.find_by(name: name, kind: kind)
                if (exist.nil?)
                    new_ref = Reference.create! :name => name, :kind => kind, :order => order, :numbering => ex_count.to_s
                end
            end
        end
    end
    return ex_count
end



def update_chapter_attributes
    start_order = "0"
    ex_start_count = 1
    Chapter.all.each do |chapter|
        # puts 'Chapter order is ' + chapter.order
        if chapter.order[0] != start_order
            start_order = chapter.order[0]
            ex_start_count = 1
        end
        chapter.exercise_start_number = ex_start_count
        ex_start_count += chapter.exercise_number

        xml_doc = Nokogiri::XML(chapter.xml_content)
        if (!xml_doc.at('NAME').nil?)
            # update the chapter names
            xml_doc.search('SCHEME').remove
            if (chapter.order.to_s != "" && chapter.order.to_s[0] != "0" && chapter.order.to_s[0] != "9")
                chapter.title = chapter.order.to_s + "  " + xml_doc.at('NAME').text.tr("\t\n\r", '')
            else
                chapter.title = xml_doc.at('NAME').text.tr("\t\n\r", '')
            end
            # update the chapter section names
            xml_doc.search('LABEL').each do |label|
                full_name = label['NAME']
                # add section into reference table
                kind, name = full_name.split(":")
                if kind == "sec"
                    chapter.section_name = name
                    new_ref = Reference.create! :name => name, :kind => kind, :order => chapter.order, :numbering => chapter.order
                end
            end
            chapter.save
        else
            chapter.title = chapter.title.tr("0-9.xml",'').capitalize
            chapter.save
        end
    end
end

def update_reference_numberings
    previous_numbering = "0"
    fig_count = 0
    Reference.where(kind: "fig").each do |fig|
        if fig.numbering != previous_numbering
            fig_count = 1
            previous_numbering = fig.numbering
        else
            fig_count += 1
        end    
        fig.numbering = fig.numbering + "." + fig_count.to_s
        fig.save
    end

    Reference.where(kind: "ex").each do |ex|
        required = Chapter.find_by(order: ex.order)
        if (!required.nil?)
            ex_start_index = required.exercise_start_number
            ex_index_in_chapter = ex_start_index + ex.numbering.to_i - 1
            ex.numbering = ex.order[0] + '.' + ex_index_in_chapter.to_s
            ex.save
        end
    end
end

# If the folder containing xml files are changed, remember to change here
add_subdirs(ARGV[0], 'xml', nil, ["book_lambda.xml", "book.xml"])
find_snippet_requirements
#test_snippet_requirements
update_chapter_attributes
update_reference_numberings
