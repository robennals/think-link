class CreateRatings < ActiveRecord::Migration
  def self.up
    create_table :ratings do |t|
    	t.column :snippet_id, :integer
    	t.column :point_id, :integer
    	t.column :user_id, :integer
    	t.column :rating, :integer
      t.timestamps
    end
  end

  def self.down
    drop_table :ratings
  end
end
