class AddOrderToReferences < ActiveRecord::Migration[5.0]
  def change
      add_column :references, :order, :string
  end
end
