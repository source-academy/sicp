class AddExerciseNumberToChapters < ActiveRecord::Migration[5.0]
  def change
      add_column :chapters, :exercise_number, :integer
  end
end
