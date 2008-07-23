require 'test_helper'

class SourcesControllerTest < ActionController::TestCase
  def test_should_get_index
    get :index
    assert_response :success
    assert_not_nil assigns(:sources)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end

  def test_should_create_source
    assert_difference('Source.count') do
      post :create, :source => { }
    end

    assert_redirected_to source_path(assigns(:source))
  end

  def test_should_show_source
    get :show, :id => sources(:one).id
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => sources(:one).id
    assert_response :success
  end

  def test_should_update_source
    put :update, :id => sources(:one).id, :source => { }
    assert_redirected_to source_path(assigns(:source))
  end

  def test_should_destroy_source
    assert_difference('Source.count', -1) do
      delete :destroy, :id => sources(:one).id
    end

    assert_redirected_to sources_path
  end
end
