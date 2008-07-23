class CreateSources < ActiveRecord::Migration
  def self.up
    create_table :sources do |t|
			t.column :name, :string
			t.column :domain, :string
			t.column :titleexp, :string
      t.timestamps
    end
  end

  def self.down
    drop_table :sources
  end
end
