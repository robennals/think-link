class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
			t.column :email, :string, :limit =>32, :null => false
			t.column :password, :string, :limit =>32, :null => false
			t.column :secret, :string, :limit => 32, :null => false
			t.column :status, :string, :limit => 4, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end
