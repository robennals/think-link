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

class TopicLink < ActiveRecord::Base
  #belongs_to :parent, :class_name => 'Topic', :foreign_key => 'parent_id'
  #belongs_to :child, :class_name => 'Topic', :foreign_key => 'child_id'

  def parent
    return Topic.find(:first,:conditions=>"id=#{self.parent_id}")
  end
  
  def child
    return Topic.find(:first,:conditions=>"id=#{self.child_id}")
  end


end
