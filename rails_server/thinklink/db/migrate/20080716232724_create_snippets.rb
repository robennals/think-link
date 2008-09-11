#  Copyright 2008 Intel Corporation
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

class CreateSnippets < ActiveRecord::Migration
  def self.up
    create_table :snippets do |t|
			t.column :txt, :string, :limit => 1024, :null => false
			t.column :user_id, :integer
			t.column :point_id, :integer
			t.column :source_id, :integer
			t.column :pagetitle, :string, :limit => 128, :null => false
			t.column :url, :string, :limit => 2048, :null => false
			t.column :url_real, :string, :limit => 2048, :null => false
      t.timestamps
    end
  end

  def self.down
    drop_table :snippets
  end
end
