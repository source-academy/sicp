class AddExerciseStartNumberToChapters < ActiveRecord::Migration[5.0]
  def change
      add_column :chapters, :exercise_start_number, :integer
  end
end
