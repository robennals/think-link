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

ActionController::Routing::Routes.draw do |map|
  map.resources :sources
  map.resources :snippets, :collection => {:mine => :get, :list => :get, :friends => :get, :newsnippet => :get}
  map.resources :ratings
  map.resources :users, :member => {:snippets => :get, :points => :get, :topics => :get, :recent => :post}

  map.resources :points, :collection => {:scrach => :post, :list => :get, :search => :post, :mine => :get, :notmine => :get, :searchajax => :post}, :member => {:parents => :post, :summary => :post, :snippets => :get, :show => :get, :expand => :post, :expandfolder => :post, :snippets => :post, :topics => :post, :places=>:post, :showajax => :post, :pathajax => :post, :showold => :get}
  map.resources :topics, :collection => {:hot => :post, :toplevel => :post, :recent => :post, :list => :get, :search => :get, :mine => :get}, :member => {:snippets => :post, :parents => :post, :show => :get, :points => :get, :parents => :get, :children => :get, :expandfolder => :post, :expand => :post, :parents => :post, :summary=>:post, :showajax => :post, :pathajax => :post}


  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  map.root :controller => "news"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  map.connect ':controller/:action/page/:page'
  map.connect ':controller/:id/:action/page/:page'
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
  map.connect ':controller/:action.:format'
  map.connect ':controller.:format'
end
