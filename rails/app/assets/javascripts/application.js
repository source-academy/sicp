// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require codemirror
//= require_tree .
// require turbolinks

// Turbolink fix: https://stackoverflow.com/questions/17600093/rails-javascript-not-loading-after-clicking-through-link-to-helper
var ready = function() {

    // Formatting sidebar
    if (typeof chapter_id !== 'undefined') {
        hightlight_sidebar(chapter_id);
    }

    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 5) {
            next_link = $('a.scroll-next:last').attr('href');
            next_chapter = $(".next-page:last");
            last_chapter = next_chapter.parent();

            if (next_link[next_link.length-1] !== 'e' ) {
                // Last chapter links to 'e' for end; however the link will be
                // expanded by wget, so we check for the last char of the link
                next_chapter.load(next_link + " .chapter-content",
                    function(responseTxt, statusTxt, xhr){
                        // There should be a better way than regex to get chapter id
                        var id_regex = /[0-9]+$/;
                        chapter_id = id_regex.exec(next_link);
                        $(".chapter-content:last").before("<hr/>");
                        newpage_ready();
                    }
                );
            }
        }
    });

    $("#search-button").click(function() {
        $('#gsc-i-id1').val($("#search-box").val());
        $('input.gsc-search-button').trigger("click");
    });
};

var newpage_ready = function() {
    PR.prettyPrint();
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    hightlight_sidebar(chapter_id);
}

function hightlight_sidebar(chapter_id) {
    $('.sidebar-active').removeClass('sidebar-active');
    var active_tab = $('#sidebar-'+chapter_id);
    active_tab.addClass('sidebar-active');
    var parent_tab = active_tab.parent();
    while (parent_tab.attr('id') != 'nav-sidebar') {
        parent_tab.collapse('show');
        parent_tab = parent_tab.parent();
    }
}

$(document).ready(ready);
$(document).on('page:change', ready);
$(document).on('click', function(e){
    var btn = $('#btn');
    var nav_sidebar = $('#nav-sidebar');
    var arrow1 = $('.sidebar-show');
    var arrow2 = $('.sidebar-hide');
    var t1 = $('.mb-0');
    var t2 = $('.card-header');
    var t3 = $('.card-block');
    var t4 = $('.card card-inverse');
    // alert(e.target.getAttribute('class'));
    // alert(e.target.getAttribute('id'));
    if (nav_sidebar.attr("aria-expanded")==="true"){
      if (!nav_sidebar.is(e.target) && !arrow1.is(e.target) && !arrow2.is(e.target) && !t1.is(e.target) && !t2.is(e.target) && !t3.is(e.target) && !t4.is(e.target)){
        btn.click();  
    } 
    }
});
