# coding: utf-8
module ApplicationHelper
    def content_links(chapter, parent, type)
        if (chapter.has_children?)
            link = link_to(chapter.title, chapter_path(chapter))
            subtree = ""
            chapter.children.all.order(:order).each do |child|
                subtree << content_links(child, "#{type}-#{chapter.id}", type)
            end
            re = <<EOD
            <div class="card card-inverse">
              <div class="card-header" role="tab" id="#{type}-#{chapter.id}">
                <h5 class="mb-0">
                  <a class="#{type}-show collapsed" data-toggle="collapse" href="##{type}-collapse-#{chapter.id}" aria-expanded="true" aria-controls="#{type}-collapse-#{chapter.id}">
                     &#10148;   <!-- ➤ (because this one is rendered blue on mobile: ▶  -->
                  </a>
                  <a class="#{type}-hide collapsed" data-toggle="collapse" href="##{type}-collapse-#{chapter.id}" aria-expanded="true" aria-controls="#{type}-collapse-#{chapter.id}">
                    &#x25BC;    <!-- ▼ (because the corresponding one is not rendered) -->
                  </a>
                    #{link}
                </h5>
              </div>
              <div id="#{type}-collapse-#{chapter.id}" class="collapse" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
                    #{subtree}
                </div>
              </div>
            </div>
EOD
            return re
        else
            link = link_to(chapter.title, chapter_path(chapter))
            re = <<EOD
            <div class="card card-inverse">
              <div class="card-header" role="tab" id="sidebar-#{chapter.id}">
                <h5 class="mb-0">
                  <span class="collapsed" data-toggle="collapse" href="##{type}-collapse-#{chapter.id}" aria-expanded="false" aria-controls="#{type}-collapse-#{chapter.id}">
                    #{link}
                  </span>
                </h5>
              </div>
            </div>
EOD
            return re
        end
    end
end
