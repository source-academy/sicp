require 'test_helper'

class ChapterControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get chapter_index_url
    assert_response :success
  end

end
