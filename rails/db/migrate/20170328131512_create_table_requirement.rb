class CreateTableRequirement < ActiveRecord::Migration[5.0]
  def change
    create_table :requirements do |t|
        t.integer :snippet_id
        t.integer :required_snippet_id
    end
  end
end
