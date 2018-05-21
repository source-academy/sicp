class AddNumberingToReferences < ActiveRecord::Migration[5.0]
  def change
      add_column :references, :numbering, :string
  end
end
