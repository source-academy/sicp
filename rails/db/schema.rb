# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180405114948) do

  create_table "chapters", force: :cascade do |t|
    t.string   "title"
    t.text     "xml_content"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.string   "ancestry"
    t.string   "order"
    t.string   "section_name"
    t.integer  "exercise_start_number"
    t.integer  "exercise_number"
    t.index ["ancestry"], name: "index_chapters_on_ancestry"
  end

  create_table "references", force: :cascade do |t|
    t.string "kind"
    t.string "name"
    t.string "order"
    t.string "numbering"
  end

  create_table "requirements", force: :cascade do |t|
    t.integer "snippet_id"
    t.integer "required_snippet_id"
  end

  create_table "snippets", force: :cascade do |t|
    t.string   "name"
    t.boolean  "eval"
    t.string   "code"
    t.string   "run_code"
    t.boolean  "hide"
    t.string   "example"
    t.string   "language"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.text     "required_snippet_names"
  end

end
