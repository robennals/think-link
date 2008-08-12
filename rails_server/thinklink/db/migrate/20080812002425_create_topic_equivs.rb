class CreateTopicEquivs < ActiveRecord::Migration
  def self.up
    create_table :topic_equivs do |t|
    	t.column :topic_a_id, :integer
    	t.column :topic_b_id, :integer
      t.timestamps
    end
  end

  def self.down
    drop_table :topic_equivs
  end
end
