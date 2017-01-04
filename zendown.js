(function () {
    'use strict';

    // functin call debouncer
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments,
                later = function () {
                    timeout = null;
                    if (!immediate) {
                        func.apply(context, args);
                    }
                },
                callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    }

    // select relevant elements
    var editor = document.getElementById('editor'),
        viewer = document.getElementById('viewer');

    // sync editor and viewer panes
    var SCROLL_LATENCY = 10;

    function scrollableHeight(element) {
        return element.scrollHeight - element.clientHeight;
    }

    function syncScroll(source, target) {
        var multiplier = scrollableHeight(target) / scrollableHeight(source);
        target.scrollTop = Math.round(source.scrollTop * multiplier);
    }

    var safeSyncScroll = debounce(syncScroll, SCROLL_LATENCY),
        safeViewerScroll = function () { safeSyncScroll(editor, viewer); },
        safeEditorScroll = function () { safeSyncScroll(viewer, editor); };

    editor.addEventListener('scroll', safeViewerScroll);
    viewer.addEventListener('scroll', safeEditorScroll);

    // sync editor markdown with viewer html
    var RENDER_LATENCY = 60;

    function renderMarkdown() {
        marked(editor.value, function (err, rendered) {
            viewer.innerHTML = rendered;
            safeViewerScroll();
        });
    }

    var safeRenderMarkdown = debounce(renderMarkdown, RENDER_LATENCY);

    editor.addEventListener('input', safeRenderMarkdown);


}());
