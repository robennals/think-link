class CreatePointTopics < ActiveRecord::Migration
  def self.up
    create_table :point_topics do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :point_topics
  end
end
