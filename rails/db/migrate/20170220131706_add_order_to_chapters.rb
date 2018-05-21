class AddOrderToChapters < ActiveRecord::Migration[5.0]
  def change
      add_column :chapters, :order, :string
  end
end
