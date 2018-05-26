class Snippet < ApplicationRecord
    serialize :required_snippet_names, Array
    has_many :requirements, class_name: "Requirement", foreign_key: "snippet_id"
    has_many :required_snippets, :through => :requirements

    def get_required_code
        code = ''
        self.required_snippets.each do |required|
            code += required.get_required_code
        end
        code += self.code
        return code
    end


    def get_required_function_name(all_names)
        if all_names.include? self.name
            return all_names
        end

        all_names << self.name
        self.required_snippets.each do |required|
            if all_names.include? required.name
                next
            else
                all_names = required.get_required_function_name(all_names)
            end
        end
        all_names.delete(self.name)
        all_names << self.name
        return all_names
    end    

end

class Requirement < ActiveRecord::Base
   belongs_to :snippet, :foreign_key => "snippet_id", :class_name => "Snippet"
   belongs_to :required_snippet, :foreign_key => "required_snippet_id", :class_name => "Snippet"
end
