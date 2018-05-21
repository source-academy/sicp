class AddSectionNameToChapters < ActiveRecord::Migration[5.0]
  def change
      add_column :chapters, :section_name, :string
  end
end
