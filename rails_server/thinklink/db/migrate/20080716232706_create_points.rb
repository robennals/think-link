class CreatePoints < ActiveRecord::Migration
  def self.up
    create_table :points do |t|
			t.column :user_id, :integer
			t.column :txt, :string, :limit => 128, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :points
  end
end
