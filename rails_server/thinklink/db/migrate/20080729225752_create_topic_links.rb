class CreateTopicLinks < ActiveRecord::Migration
  def self.up
    create_table :topic_links do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :topic_links
  end
end
