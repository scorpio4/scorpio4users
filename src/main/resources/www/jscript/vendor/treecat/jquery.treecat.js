/**
 * multilevel treeview plugin
 * Copyright (c) 2013 Patric Gutersohn
 * licensed under MIT.
 * Date: 16/05/2013
 *
 * Project Home:
 * http://ladensia.com/jquery-tree-node-plugin/
 */
(function ($) {

    $.fn.extend({
        isChildOf: function (filter_string) {

            var parents = $(this).parents().get();

            for (j = 0; j < parents.length; j++) {
                if ($(parents[j]).is(filter_string)) {
                    return true;
                }
            }

            return false;
        }
    });

	var old = null;
	var old_child = null;
	var old_array = [];

	function toggle(id) {
		var e = document.getElementById(id);

		if(jQuery.inArray(e, old_array) == -1) {
			var span = $(e).parent().find('a:first').find('span:first');
			var parents = $(e).parent().siblings().find('.icon_arrow_down');

			if($(e).isChildOf(".sub")) {
				var others = $(e).parent().siblings().find('.icon_arrow_down');
				$(others).each(function () {
					$(this).removeClass();
					$(this).addClass('icon_plus');
				});
			} else if(!($(e).isChildOf(".sub"))) {
				$(e).children().find('ul').each(function (){
					if(!($(this).css("display") == "none")) {
						var opend = $(this).parent().find('.icon_plus');
						opend.removeClass();
						opend.addClass('icon_arrow_down');
					}
				});

			}

			$(parents).each(function () {
				$(this).removeClass();
				$(this).addClass('icon_plus');
				$(this).each( function() {
					old_array.splice( $.inArray(parents, old_array), 1 );
				});
			});

			span.removeClass();
			span.addClass('icon_arrow_down');
			old_array.push( e );
		} else if(jQuery.inArray(e, old_array) >= 0) {
			var span = $(e).parent().find('a:first').find('span:first');
			var parents = $(e).parent().siblings().find('.icon_arrow_down');

			$(parents).each(function () {
				$(this).removeClass();
				$(this).addClass('icon_plus');
				$(this).each( function() {
					old_array.splice( $.inArray(parents, old_array), 1 );
				});
			});

			span.removeClass();
			span.addClass('icon_plus');
			old_array.splice( $.inArray(e, old_array), 1 );
		}

		if (e != null) {
			if (e.style.display == '') {
				e.style.display = 'none';
			} else {
				if ($(e).isChildOf(".sub")) {
					if (old_child) {
						$(old_child).css('display', 'none');
					}
				} else {
					if (old) {
						$(old).css('display', 'none');
					}
				}

				e.style.display = '';

				if (!$(e).isChildOf(".sub")) {
					old = e;
				} else {
					old_child = e;
				}
			}
		}
	}

	function subManagement() {

		var array = $('.sub').toArray();

		$('.sub:not(:has(ul))').each(function (index, value) {
			$(this).off('click');
			$(this).children('a').remove();
			$(this).prepend('<span class="icon_file" style="margin: 0 4px 0 15px"></span>');


		});

		var sum = $('.sub').length / 2;
		var sum_o = $('.sub').length / 2;

		$('.s_node').each(function () {
			$(this).attr('id', 'node' + sum);
			$('.open_s_node').attr('onclick', "toggle('node" + sum_o + "')");

			sum++;
		});

		$('.open_s_node').each(function () {
			$(this).attr('onclick', "toggle('node" + sum_o + "')");
			sum_o++;
		});

	}

    $.fn.treeNode = function (options) {

        //defaults
        var settings = $.extend({
            "color": "#556B2F",
            "background-color": "white"
        }, options);

        return this.each(function () {
            var box = $(this);

            $.get("library/TreeNodes.php", function (data) {
                box.append(data);
                subManagement();
                box.attr('class', 'category_box');
            });

        });

    }
})(jQuery);


