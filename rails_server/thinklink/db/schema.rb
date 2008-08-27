# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20080719024533) do

  create_table "points", :force => true do |t|
    t.integer  "user_id",    :limit => 11
    t.string   "txt",        :limit => 128, :default => "", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "ratings", :force => true do |t|
    t.integer  "snippet_id", :limit => 11
    t.integer  "point_id",   :limit => 11
    t.integer  "user_id",    :limit => 11
    t.integer  "rating",     :limit => 11
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "snippets", :force => true do |t|
    t.string   "txt",        :limit => 1024, :default => "", :null => false
    t.integer  "user_id",    :limit => 11
    t.integer  "point_id",   :limit => 11
    t.integer  "source_id",  :limit => 11
    t.string   "pagetitle",  :limit => 128,  :default => "", :null => false
    t.string   "url",        :limit => 2048, :default => "", :null => false
    t.string   "url_real",        :limit => 2048, :default => "", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sources", :force => true do |t|
    t.string   "name"
    t.string   "domain"
    t.string   "titleexp"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "email",      :limit => 32, :default => "", :null => false
    t.string   "password",   :limit => 32, :default => "", :null => false
    t.string   "secret",     :limit => 32, :default => "", :null => false
    t.string   "status",     :limit => 4,  :default => "", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

	create_table "point_links", :force => true do |t|
		t.integer "point_a_id",	 :limit => 11
		t.integer "point_b_id",  :limit => 11
		t.string "howlinked"
	end

end
