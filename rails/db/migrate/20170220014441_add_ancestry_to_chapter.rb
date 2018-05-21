class AddAncestryToChapter < ActiveRecord::Migration[5.0]
  def change
    add_column :chapters, :ancestry, :string
    add_index :chapters, :ancestry
  end
end
