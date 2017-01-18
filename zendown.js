(function () {
'use strict';

// select relevant elements
var editor = document.getElementById('editor'),
    viewer = document.getElementById('viewer'),
    theme = document.getElementById('theme'),
    format = document.getElementById('format'),
    save = document.getElementById('save');

// function call debouncer
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
        var isCompiled = (err === null),
            isEmpty = (rendered.length === 0);
        save.disabled = (!isCompiled || isEmpty);
        if (isCompiled) {
            viewer.innerHTML = rendered;
        } else {
            window.alert(err);
        }
        safeViewerScroll();
    });
}

var safeRenderMarkdown = debounce(renderMarkdown, RENDER_LATENCY);

editor.addEventListener('input', safeRenderMarkdown);

// file download generator
var CONTENT = {
    html: function () { return viewer.innerHTML; },
    markdown: function () { return editor.value; },
    text: function () { return editor.value; },
};

function download(content, mime, name, ext) {
    var blob = new Blob([content], {
        type: mime + ';charset=utf-8'
    });
    saveAs(blob, name + '.' + ext);
}

save.addEventListener('click', function () {
    var meta = format.querySelector(':checked');
    download(
        CONTENT[meta.value](),
        'text/' + meta.dataset.mime,
        'document', meta.dataset.ext
    );
});

// theme switcher
function enableTheme(name) {
    var styles = document.getElementsByTagName('link');
    for (var style of styles) {
        var title = style.title;
        if (title !== '') {
            style.disabled = (title !== name);
        }
    }
}

theme.addEventListener('click', function () {
    var name = theme.querySelector(':checked').value;
    enableTheme(name);
});
}());
