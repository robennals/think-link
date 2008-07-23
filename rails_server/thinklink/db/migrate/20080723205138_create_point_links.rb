class CreatePointLinks < ActiveRecord::Migration
  def self.up
    create_table :point_links do |t|
    	t.column :point_a_id, :integer
    	t.column :point_b_id, :integer
    	t.column :howlinked, :string
      t.timestamps
    end
  end

  def self.down
    drop_table :point_links
  end
end
