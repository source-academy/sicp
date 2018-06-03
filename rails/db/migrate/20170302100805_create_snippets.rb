class CreateSnippets < ActiveRecord::Migration[5.0]
  def change
    create_table :snippets do |t|
      t.string :name
      t.boolean :eval
      t.string :code
      t.string :run_code
      t.boolean :hide
      t.string :example
      t.string :language
      t.timestamps
    end
  end
end
