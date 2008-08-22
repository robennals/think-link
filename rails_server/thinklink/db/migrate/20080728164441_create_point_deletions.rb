class CreatePointDeletions < ActiveRecord::Migration
  def self.up
    create_table :point_deletions do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :point_deletions
  end
end
