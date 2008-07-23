class CreateSubThings < ActiveRecord::Migration
  def self.up
    create_table :sub_things do |t|
      t.string :name
      t.integer :thing_id
    end
  end

  def self.down
    drop_table :sub_things
  end
end
