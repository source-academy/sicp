class AddRequiredSnippetNamesToSnippets < ActiveRecord::Migration[5.0]
  def change
      add_column :snippets, :required_snippet_names, :text
  end
end
