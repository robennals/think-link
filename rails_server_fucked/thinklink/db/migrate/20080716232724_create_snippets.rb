class CreateSnippets < ActiveRecord::Migration
  def self.up
    create_table :snippets do |t|
			t.column :txt, :string, :limit => 1024, :null => false
			t.column :user_id, :integer
			t.column :point_id, :integer
			t.column :source_id, :integer
			t.column :pagetitle, :string, :limit => 128, :null => false
			t.column :url, :string, :limit => 2048, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :snippets
  end
end
