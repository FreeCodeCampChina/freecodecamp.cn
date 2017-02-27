'use strict';

window.common = function (global) {
  // common namespace
  // all classes should be stored here
  // called at the beginning of dom ready
  var _global$Rx = global.Rx,
      Disposable = _global$Rx.Disposable,
      Observable = _global$Rx.Observable,
      config = _global$Rx.config,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  config.longStackSupport = true;
  common.head = common.head || [];
  common.tail = common.tail || [];
  common.salt = Math.random();

  common.challengeTypes = {
    HTML: '0',
    JS: '1',
    VIDEO: '2',
    ZIPLINE: '3',
    BASEJUMP: '4',
    BONFIRE: '5',
    HIKES: '6',
    STEP: '7'
  };

  common.arrayToNewLineString = function arrayToNewLineString(seedData) {
    seedData = Array.isArray(seedData) ? seedData : [seedData];
    return seedData.reduce(function (seed, line) {
      return '' + seed + line + '\n';
    }, '');
  };

  common.seed = common.arrayToNewLineString(common.challengeSeed);

  common.replaceScriptTags = function replaceScriptTags(value) {
    return value.replace(/<script>/gi, 'fccss').replace(/<\/script>/gi, 'fcces');
  };

  common.replaceSafeTags = function replaceSafeTags(value) {
    return value.replace(/fccss/gi, '<script>').replace(/fcces/gi, '</script>');
  };

  common.replaceFormActionAttr = function replaceFormAction(value) {
    return value.replace(/<form[^>]*>/, function (val) {
      return val.replace(/action(\s*?)=/, 'fccfaa$1=');
    });
  };

  common.replaceFccfaaAttr = function replaceFccfaaAttr(value) {
    return value.replace(/<form[^>]*>/, function (val) {
      return val.replace(/fccfaa(\s*?)=/, 'action$1=');
    });
  };

  common.scopejQuery = function scopejQuery(str) {
    return str.replace(/\$/gi, 'j$').replace(/document/gi, 'jdocument').replace(/jQuery/gi, 'jjQuery');
  };

  common.unScopeJQuery = function unScopeJQuery(str) {
    return str.replace(/j\$/gi, '$').replace(/jdocument/gi, 'document').replace(/jjQuery/gi, 'jQuery');
  };

  var commentRegex = /(\/\*[^(\*\/)]*\*\/)|([ \n]\/\/[^\n]*)/g;
  common.removeComments = function removeComments(str) {
    return str.replace(commentRegex, '');
  };

  var logRegex = /(console\.[\w]+\s*\(.*\;)/g;
  common.removeLogs = function removeLogs(str) {
    return str.replace(logRegex, '');
  };

  common.reassembleTest = function reassembleTest() {
    var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var _ref = arguments[1];
    var line = _ref.line,
        text = _ref.text;

    var regexp = new RegExp('//' + line + common.salt);
    return code.replace(regexp, text);
  };

  common.getScriptContent$ = function getScriptContent$(script) {
    return Observable.create(function (observer) {
      var jqXHR = $.get(script, null, null, 'text').success(function (data) {
        observer.onNext(data);
        observer.onCompleted();
      }).fail(function (e) {
        return observer.onError(e);
      }).always(function () {
        return observer.onCompleted();
      });

      return new Disposable(function () {
        jqXHR.abort();
      });
    });
  };

  var openScript = /\<\s?script\s?\>/gi;
  var closingScript = /\<\s?\/\s?script\s?\>/gi;

  // detects if there is JavaScript in the first script tag
  common.hasJs = function hasJs(code) {
    return !!common.getJsFromHtml(code);
  };

  // grabs the content from the first script tag in the code
  common.getJsFromHtml = function getJsFromHtml(code) {
    // grab user javaScript
    return (code.split(openScript)[1] || '').split(closingScript)[0] || '';
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var $ = global.$,
      Observable = global.Rx.Observable,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  common.ctrlEnterClickHandler = function ctrlEnterClickHandler(e) {
    // ctrl + enter or cmd + enter
    if (e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {
      $('#complete-courseware-dialog').off('keydown', ctrlEnterClickHandler);
      if ($('#submit-challenge').length > 0) {
        $('#submit-challenge').click();
      } else {
        window.location = '/challenges/next-challenge?id=' + common.challengeId;
      }
    }
  };

  common.init.push(function ($) {

    var $marginFix = $('.innerMarginFix');
    $marginFix.css('min-height', $marginFix.height());

    common.submitBtn$ = Observable.fromEvent($('#submitButton'), 'click');

    common.resetBtn$ = Observable.fromEvent($('#reset-button'), 'click');

    // init modal keybindings on open
    $('#complete-courseware-dialog').on('shown.bs.modal', function () {
      $('#complete-courseware-dialog').keydown(common.ctrlEnterClickHandler);
    });

    // remove modal keybinds on close
    $('#complete-courseware-dialog').on('hidden.bs.modal', function () {
      $('#complete-courseware-dialog').off('keydown', common.ctrlEnterClickHandler);
    });

    // video checklist binding
    $('.challenge-list-checkbox').on('change', function () {
      var checkboxId = $(this).parent().parent().attr('id');
      if ($(this).is(':checked')) {
        $(this).parent().siblings().children().addClass('faded');
        if (!localStorage || !localStorage[checkboxId]) {
          localStorage[checkboxId] = true;
        }
      }

      if (!$(this).is(':checked')) {
        $(this).parent().siblings().children().removeClass('faded');
        if (localStorage[checkboxId]) {
          localStorage.removeItem(checkboxId);
        }
      }
    });

    $('.checklist-element').each(function () {
      var checklistElementId = $(this).attr('id');
      if (localStorage[checklistElementId]) {
        $(this).children().children('li').addClass('faded');
        $(this).children().children('input').trigger('click');
      }
    });

    // video challenge submit
    $('#next-courseware-button').on('click', function () {
      $('#next-courseware-button').unbind('click');
      if ($('.signup-btn-nav').length < 1) {
        var data;
        var solution = $('#public-url').val() || null;
        var githubLink = $('#github-url').val() || null;
        switch (common.challengeType) {
          case common.challengeTypes.VIDEO:
            data = {
              id: common.challengeId,
              name: common.challengeName,
              challengeType: +common.challengeType
            };
            $.ajax({
              url: '/completed-challenge/',
              type: 'POST',
              data: JSON.stringify(data),
              contentType: 'application/json',
              dataType: 'json'
            }).success(function (res) {
              if (!res) {
                return;
              }
              window.location.href = '/challenges/next-challenge?id=' + common.challengeId;
            }).fail(function () {
              window.location.replace(window.location.href);
            });

            break;
          case common.challengeTypes.BASEJUMP:
          case common.challengeTypes.ZIPLINE:
            data = {
              id: common.challengeId,
              name: common.challengeName,
              challengeType: +common.challengeType,
              solution: solution,
              githubLink: githubLink
            };

            $.ajax({
              url: '/completed-zipline-or-basejump/',
              type: 'POST',
              data: JSON.stringify(data),
              contentType: 'application/json',
              dataType: 'json'
            }).success(function () {
              window.location.href = '/challenges/next-challenge?id=' + common.challengeId;
            }).fail(function () {
              window.location.replace(window.location.href);
            });
            break;

          case common.challengeTypes.BONFIRE:
            window.location.href = '/challenges/next-challenge?id=' + common.challengeId;
            break;

          default:
            console.log('Happy Coding!');
            break;
        }
      }
    });

    if (common.challengeName) {
      window.ga('send', 'event', 'Challenge', 'load', common.gaName);
    }

    $('#complete-courseware-dialog').on('hidden.bs.modal', function () {
      if (common.editor.focus) {
        common.editor.focus();
      }
    });

    $('#trigger-issue-modal').on('click', function () {
      $('#issue-modal').modal('show');
    });

    $('#trigger-help-modal').on('click', function () {
      $('#help-modal').modal('show');
    });

    $('#trigger-reset-modal').on('click', function () {
      $('#reset-modal').modal('show');
    });

    $('#trigger-pair-modal').on('click', function () {
      $('#pair-modal').modal('show');
    });

    $('#completed-courseware').on('click', function () {
      $('#complete-courseware-dialog').modal('show');
    });

    $('#help-ive-found-a-bug-wiki-article').on('click', function () {
      window.open('https://github.com/freecodecampchina/freecodecamp.cn/wiki/' + "Help-I've-Found-a-Bug", '_blank');
    });

    $('#search-issue').on('click', function () {
      var queryIssue = window.location.href.toString().split('?')[0].replace(/(#*)$/, '');
      window.open('https://github.com/freecodecampchina/freecodecamp.cn/issues?q=' + 'is:issue is:all ' + common.challengeName + ' OR ' + queryIssue.substr(queryIssue.lastIndexOf('challenges/') + 11).replace('/', ''), '_blank');
    });
  });

  return common;
}(window);
'use strict';

// depends on: codeUri
window.common = function (global) {
  var localStorage = global.localStorage,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  var challengePrefix = ['Bonfire: ', 'Waypoint: ', 'Zipline: ', 'Basejump: ', 'Checkpoint: '],
      item;

  var codeStorage = {
    getStoredValue: function getStoredValue(key) {
      if (!localStorage || typeof localStorage.getItem !== 'function' || !key || typeof key !== 'string') {
        console.log('unable to read from storage');
        return '';
      }
      if (localStorage.getItem(key + 'Val')) {
        return '' + localStorage.getItem(key + 'Val');
      } else {
        for (var i = 0; i <= challengePrefix.length; i++) {
          item = localStorage.getItem(challengePrefix[i] + key + 'Val');
          if (item) {
            return '' + item;
          }
        }
      }
      return null;
    },


    isAlive: function isAlive(key) {
      var val = this.getStoredValue(key);
      return val !== 'null' && val !== 'undefined' && val && val.length > 0;
    },

    updateStorage: function updateStorage(key, code) {
      if (!localStorage || typeof localStorage.setItem !== 'function' || !key || typeof key !== 'string') {
        console.log('unable to save to storage');
        return code;
      }
      localStorage.setItem(key + 'Val', code);
      return code;
    }
  };

  common.codeStorage = codeStorage;

  return common;
}(window, window.common);
'use strict';

// store code in the URL
window.common = function (global) {
  var _encode = global.encodeURIComponent,
      _decode = global.decodeURIComponent,
      location = global.location,
      history = global.history,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;
  var replaceScriptTags = common.replaceScriptTags,
      replaceSafeTags = common.replaceSafeTags,
      replaceFormActionAttr = common.replaceFormActionAttr,
      replaceFccfaaAttr = common.replaceFccfaaAttr;


  var queryRegex = /^(\?|#\?)/;
  function encodeFcc(val) {
    return replaceScriptTags(replaceFormActionAttr(val));
  }

  function decodeFcc(val) {
    return replaceSafeTags(replaceFccfaaAttr(val));
  }

  var codeUri = {
    encode: function encode(code) {
      return _encode(code);
    },
    decode: function decode(code) {
      try {
        return _decode(code);
      } catch (ignore) {
        return null;
      }
    },
    isInQuery: function isInQuery(query) {
      var decoded = codeUri.decode(query);
      if (!decoded || typeof decoded.split !== 'function') {
        return false;
      }
      return decoded.replace(queryRegex, '').split('&').reduce(function (found, param) {
        var key = param.split('=')[0];
        if (key === 'solution') {
          return true;
        }
        return found;
      }, false);
    },
    isAlive: function isAlive() {
      return codeUri.enabled && codeUri.isInQuery(location.search) || codeUri.isInQuery(location.hash);
    },
    getKeyInQuery: function getKeyInQuery(query) {
      var keyToFind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      return query.split('&').reduce(function (oldValue, param) {
        var key = param.split('=')[0];
        var value = param.split('=').slice(1).join('=');

        if (key === keyToFind) {
          return value;
        }
        return oldValue;
      }, null);
    },
    getSolutionFromQuery: function getSolutionFromQuery() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      return decodeFcc(codeUri.decode(codeUri.getKeyInQuery(query, 'solution')));
    },

    parse: function parse() {
      if (!codeUri.enabled) {
        return null;
      }
      var query;
      if (location.search && codeUri.isInQuery(location.search)) {
        query = location.search.replace(/^\?/, '');

        if (history && typeof history.replaceState === 'function') {
          history.replaceState(history.state, null, location.href.split('?')[0]);
          location.hash = '#?' + encodeFcc(query);
        }
      } else {
        query = location.hash.replace(/^\#\?/, '');
      }

      if (!query) {
        return null;
      }

      return this.getSolutionFromQuery(query);
    },
    querify: function querify(solution) {
      if (!codeUri.enabled) {
        return null;
      }
      if (history && typeof history.replaceState === 'function') {
        // grab the url up to the query
        // destroy any hash symbols still clinging to life
        var url = location.href.split('?')[0].replace(/(#*)$/, '');
        history.replaceState(history.state, null, url + '#?' + (codeUri.shouldRun() ? '' : 'run=disabled&') + 'solution=' + codeUri.encode(encodeFcc(solution)));
      } else {
        location.hash = '?solution=' + codeUri.encode(encodeFcc(solution));
      }

      return solution;
    },
    enabled: true,
    shouldRun: function shouldRun() {
      return !this.getKeyInQuery((location.search || location.hash).replace(queryRegex, ''), 'run');
    }
  };

  common.init.push(function () {
    codeUri.parse();
  });

  common.codeUri = codeUri;
  common.shouldRun = function () {
    return codeUri.shouldRun();
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var loopProtect = global.loopProtect,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  loopProtect.hit = function hit(line) {
    var err = 'Error: Exiting potential infinite loop at line ' + line + '. To disable loop protection, write: \n\\/\\/ noprotect\nas the first' + 'line. Beware that if you do have an infinite loop in your code' + 'this will crash your browser.';
    console.error(err);
  };

  common.addLoopProtect = function addLoopProtect() {
    var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return loopProtect(code);
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common,
      doc = global.document;


  common.getIframe = function getIframe() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'preview';

    var previewFrame = doc.getElementById(id);

    // create and append a hidden preview frame
    if (!previewFrame) {
      previewFrame = doc.createElement('iframe');
      previewFrame.id = id;
      previewFrame.setAttribute('style', 'display: none');
      doc.body.appendChild(previewFrame);
    }

    return previewFrame.contentDocument || previewFrame.contentWindow.document;
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var _global$Rx = global.Rx,
      BehaviorSubject = _global$Rx.BehaviorSubject,
      Observable = _global$Rx.Observable,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;

  // the first script tag here is to proxy jQuery
  // We use the same jQuery on the main window but we change the
  // context to that of the iframe.

  var libraryIncludes = '\n<script>\n  window.loopProtect = parent.loopProtect;\n  window.__err = null;\n  window.loopProtect.hit = function(line) {\n    window.__err = new Error(\n      \'Potential infinite loop at line \' +\n      line +\n      \'. To disable loop protection, write:\' +\n      \' \\n\\/\\/ noprotect\\nas the first\' +\n      \' line. Beware that if you do have an infinite loop in your code\' +\n      \' this will crash your browser.\'\n    );\n  };\n</script>\n<link\n  rel=\'stylesheet\'\n  href=\'//cdn.bootcss.com/animate.css/3.2.0/animate.min.css\'\n  />\n<link\n  rel=\'stylesheet\'\n  href=\'//cdn.bootcss.com/bootstrap/3.3.1/css/bootstrap.min.css\'\n  />\n\n<link\n  rel=\'stylesheet\'\n  href=\'//cdn.bootcss.com/font-awesome/4.2.0/css/font-awesome.min.css\'\n  />\n<style>\n  body { padding: 0px 3px 0px 3px; }\n</style>\n  ';
  var codeDisabledError = '\n    <script>\n      window.__err = new Error(\'code has been disabled\');\n    </script>\n  ';

  var iFrameScript$ = common.getScriptContent$('/js/iFrameScripts-b55595ec35.js').shareReplay();
  var jQueryScript$ = common.getScriptContent$('/bower_components/jquery/dist/jquery.js').shareReplay();

  // behavior subject allways remembers the last value
  // we use this to determine if runPreviewTest$ is defined
  // and prime it with false
  common.previewReady$ = new BehaviorSubject(false);

  // These should be set up in the preview window
  // if this error is seen it is because the function tried to run
  // before the iframe has completely loaded
  common.runPreviewTests$ = common.checkPreview$ = function () {
    return Observable.throw(new Error('Preview not fully loaded'));
  };

  common.updatePreview$ = function updatePreview$() {
    var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var preview = common.getIframe('preview');

    return Observable.combineLatest(iFrameScript$, jQueryScript$, function (iframe, jQuery) {
      return {
        iframeScript: '<script>' + iframe + '</script>',
        jQuery: '<script>' + jQuery + '</script>'
      };
    }).first().flatMap(function (_ref) {
      var iframeScript = _ref.iframeScript,
          jQuery = _ref.jQuery;

      // we make sure to override the last value in the
      // subject to false here.
      common.previewReady$.onNext(false);
      preview.open();
      preview.write(libraryIncludes + jQuery + (common.shouldRun() ? code : codeDisabledError) + '<!-- -->' + iframeScript);
      preview.close();
      // now we filter false values and wait for the first true
      return common.previewReady$.filter(function (ready) {
        return ready;
      }).first()
      // the delay here is to give code within the iframe
      // control to run
      .delay(400);
    }).map(function () {
      return code;
    });
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var _global$Rx = global.Rx,
      Subject = _global$Rx.Subject,
      Observable = _global$Rx.Observable,
      CodeMirror = global.CodeMirror,
      emmetCodeMirror = global.emmetCodeMirror,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;
  var _common$challengeType = common.challengeType,
      challengeType = _common$challengeType === undefined ? '0' : _common$challengeType,
      challengeTypes = common.challengeTypes;


  if (!CodeMirror || challengeType === challengeTypes.BASEJUMP || challengeType === challengeTypes.ZIPLINE || challengeType === challengeTypes.VIDEO || challengeType === challengeTypes.STEP || challengeType === challengeTypes.HIKES) {
    common.editor = {};
    return common;
  }

  var editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    lint: true,
    lineNumbers: true,
    mode: 'javascript',
    theme: 'monokai',
    runnable: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    scrollbarStyle: 'null',
    lineWrapping: true,
    gutters: ['CodeMirror-lint-markers']
  });

  editor.setSize('100%', 'auto');

  common.editorExecute$ = new Subject();
  common.editorKeyUp$ = Observable.fromEventPattern(function (handler) {
    return editor.on('keyup', handler);
  }, function (handler) {
    return editor.off('keyup', handler);
  });

  editor.setOption('extraKeys', {
    Tab: function Tab(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection('add');
      } else {
        var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      }
    },
    'Shift-Tab': function ShiftTab(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection('subtract');
      } else {
        var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      }
    },
    'Ctrl-Enter': function CtrlEnter() {
      common.editorExecute$.onNext();
      return false;
    },
    'Cmd-Enter': function CmdEnter() {
      common.editorExecute$.onNext();
      return false;
    }
  });

  var info = editor.getScrollInfo();

  var after = editor.charCoords({
    line: editor.getCursor().line + 1,
    ch: 0
  }, 'local').top;

  if (info.top + info.clientHeight < after) {
    editor.scrollTo(null, after - info.clientHeight + 3);
  }

  if (emmetCodeMirror) {
    emmetCodeMirror(editor, {
      'Cmd-E': 'emmet.expand_abbreviation',
      Tab: 'emmet.expand_abbreviation_with_tab',
      Enter: 'emmet.insert_formatted_line_break_only'
    });
  }
  common.init.push(function () {
    var editorValue = void 0;
    if (common.codeUri.isAlive()) {
      editorValue = common.codeUri.parse();
    } else {
      editorValue = common.codeStorage.isAlive(common.challengeName) ? common.codeStorage.getStoredValue(common.challengeName) : common.seed;
    }

    editor.setValue(common.replaceSafeTags(editorValue));
    editor.refresh();
  });

  common.editor = editor;

  return common;
}(window);
'use strict';

window.common = function (global) {
  var Observable = global.Rx.Observable,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  var detectFunctionCall = /function\s*?\(|function\s+\w+\s*?\(/gi;
  var detectUnsafeJQ = /\$\s*?\(\s*?\$\s*?\)/gi;
  var detectUnsafeConsoleCall = /if\s\(null\)\sconsole\.log\(1\);/gi;

  common.detectUnsafeCode$ = function detectUnsafeCode$(code) {
    var openingComments = code.match(/\/\*/gi);
    var closingComments = code.match(/\*\//gi);

    // checks if the number of opening comments(/*) matches the number of
    // closing comments(*/)
    if (openingComments && (!closingComments || openingComments.length > closingComments.length)) {

      return Observable.throw(new Error('SyntaxError: Unfinished multi-line comment'));
    }

    if (code.match(detectUnsafeJQ)) {
      return Observable.throw(new Error('Unsafe $($)'));
    }

    if (code.match(/function/g) && !code.match(detectFunctionCall)) {
      return Observable.throw(new Error('SyntaxError: Unsafe or unfinished function declaration'));
    }

    if (code.match(detectUnsafeConsoleCall)) {
      return Observable.throw(new Error('Invalid if (null) console.log(1); detected'));
    }

    return Observable.just(code);
  };

  return common;
}(window);
'use strict';

window.common = function (_ref) {
  var $ = _ref.$,
      _ref$common = _ref.common,
      common = _ref$common === undefined ? { init: [] } : _ref$common;


  common.displayTestResults = function displayTestResults() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    $('#testSuite').children().remove();
    data.forEach(function (_ref2) {
      var _ref2$err = _ref2.err,
          err = _ref2$err === undefined ? false : _ref2$err,
          _ref2$text = _ref2.text,
          text = _ref2$text === undefined ? '' : _ref2$text;

      var iconClass = err ? '"ion-close-circled big-error-icon"' : '"ion-checkmark-circled big-success-icon"';

      $('<div></div>').html('\n        <div class=\'row\'>\n          <div class=\'col-xs-2 text-center\'>\n            <i class=' + iconClass + '></i>\n          </div>\n          <div class=\'col-xs-10 test-output\'>\n            ' + text.split('message: ').pop().replace(/\'\);/g, '') + '\n          </div>\n          <div class=\'ten-pixel-break\'/>\n        </div>\n      ').appendTo($('#testSuite'));
    });

    return data;
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var ga = global.ga,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;
  var addLoopProtect = common.addLoopProtect,
      getJsFromHtml = common.getJsFromHtml,
      detectUnsafeCode$ = common.detectUnsafeCode$,
      updatePreview$ = common.updatePreview$,
      challengeType = common.challengeType,
      challengeTypes = common.challengeTypes;


  common.executeChallenge$ = function executeChallenge$() {
    var code = common.editor.getValue();
    var originalCode = code;
    var head = common.arrayToNewLineString(common.head);
    var tail = common.arrayToNewLineString(common.tail);
    var combinedCode = head + code + tail;

    ga('send', 'event', 'Challenge', 'ran-code', common.gaName);

    // run checks for unsafe code
    return detectUnsafeCode$(code)
    // add head and tail and detect loops
    .map(function () {
      if (challengeType !== challengeTypes.HTML) {
        return '<script>;' + addLoopProtect(combinedCode) + '/**/</script>';
      }

      return addLoopProtect(combinedCode);
    }).flatMap(function (code) {
      return updatePreview$(code);
    }).flatMap(function (code) {
      var output = void 0;

      if (challengeType === challengeTypes.HTML && common.hasJs(code)) {
        output = common.getJsOutput(getJsFromHtml(code));
      } else if (challengeType !== challengeTypes.HTML) {
        output = common.getJsOutput(addLoopProtect(combinedCode));
      }

      return common.runPreviewTests$({
        tests: common.tests.slice(),
        originalCode: originalCode,
        output: output
      });
    });
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var CodeMirror = global.CodeMirror,
      doc = global.document,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;
  var challengeTypes = common.challengeTypes,
      _common$challengeType = common.challengeType,
      challengeType = _common$challengeType === undefined ? '0' : _common$challengeType;


  if (!CodeMirror || challengeType !== challengeTypes.JS && challengeType !== challengeTypes.BONFIRE) {
    common.updateOutputDisplay = function () {};
    common.appendToOutputDisplay = function () {};
    return common;
  }

  var codeOutput = CodeMirror.fromTextArea(doc.getElementById('codeOutput'), {
    lineNumbers: false,
    mode: 'text',
    theme: 'monokai',
    readOnly: 'nocursor',
    lineWrapping: true
  });

  codeOutput.setValue('/**\n  * Your output will go here.\n  * Any console.log() -type\n  * statements will appear in\n  * your browser\'s DevTools\n  * JavaScript console.\n  */');

  codeOutput.setSize('100%', '100%');

  common.updateOutputDisplay = function updateOutputDisplay() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    if (typeof str !== 'string') {
      str = JSON.stringify(str);
    }
    codeOutput.setValue(str);
    return str;
  };

  common.appendToOutputDisplay = function appendToOutputDisplay() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    codeOutput.setValue(codeOutput.getValue() + str);
    return str;
  };

  return common;
}(window);
'use strict';

window.common = function (_ref) {
  var _ref$common = _ref.common,
      common = _ref$common === undefined ? { init: [] } : _ref$common;


  common.lockTop = function lockTop() {
    var magiVal;

    if ($(window).width() >= 990) {
      if ($('.editorScrollDiv').html()) {

        magiVal = $(window).height() - $('.navbar').height();

        if (magiVal < 0) {
          magiVal = 0;
        }
        $('.editorScrollDiv').css('height', magiVal - 50 + 'px');
      }

      magiVal = $(window).height() - $('.navbar').height();

      if (magiVal < 0) {
        magiVal = 0;
      }

      $('.scroll-locker').css('min-height', $('.editorScrollDiv').height()).css('height', magiVal - 50);
    } else {
      $('.editorScrollDiv').css('max-height', 500 + 'px');

      $('.scroll-locker').css('position', 'inherit').css('top', 'inherit').css('width', '100%').css('max-height', '100%');
    }
  };

  common.init.push(function ($) {
    // fakeiphone positioning hotfix
    if ($('.iphone-position').html() || $('.iphone').html()) {
      var startIphonePosition = parseInt($('.iphone-position').css('top').replace('px', ''), 10);

      var startIphone = parseInt($('.iphone').css('top').replace('px', ''), 10);

      $(window).on('scroll', function () {
        var courseHeight = $('.courseware-height').height();
        var courseTop = $('.courseware-height').offset().top;
        var windowScrollTop = $(window).scrollTop();
        var phoneHeight = $('.iphone-position').height();

        if (courseHeight + courseTop - windowScrollTop - phoneHeight <= 0) {
          $('.iphone-position').css('top', startIphonePosition + courseHeight + courseTop - windowScrollTop - phoneHeight);

          $('.iphone').css('top', startIphonePosition + courseHeight + courseTop - windowScrollTop - phoneHeight + 120);
        } else {
          $('.iphone-position').css('top', startIphonePosition);
          $('.iphone').css('top', startIphone);
        }
      });
    }

    if ($('.scroll-locker').html()) {

      if ($('.scroll-locker').html()) {
        common.lockTop();
        $(window).on('resize', function () {
          common.lockTop();
        });
        $(window).on('scroll', function () {
          common.lockTop();
        });
      }

      var execInProgress = false;

      // why is this not $???
      document.getElementById('scroll-locker').addEventListener('previewUpdateSpy', function (e) {
        if (execInProgress) {
          return null;
        }
        execInProgress = true;
        return setTimeout(function () {
          if ($($('.scroll-locker').children()[0]).height() - 800 > e.detail) {
            $('.scroll-locker').scrollTop(e.detail);
          } else {
            var scrollTop = $($('.scroll-locker').children()[0]).height();

            $('.scroll-locker').animate({ scrollTop: scrollTop }, 175);
          }
          execInProgress = false;
        }, 750);
      }, false);
    }
  });

  return common;
}(window);
'use strict';

window.common = function (_ref) {
  var _ref$common = _ref.common,
      common = _ref$common === undefined ? { init: [] } : _ref$common;

  common.init.push(function ($) {
    $('#report-issue').on('click', function () {
      var textMessage = ['Challenge [', common.challengeName || window.location.pathname, '](', window.location.href, ') has an issue.\n', 'User Agent is: <code>', navigator.userAgent, '</code>.\n', 'Please describe how to reproduce this issue, and include ', 'links to screenshots if possible.\n\n'].join('');

      if (common.editor && typeof common.editor.getValue === 'function' && common.editor.getValue().trim()) {
        var type;
        switch (common.challengeType) {
          case common.challengeTypes.HTML:
            type = 'html';
            break;
          case common.challengeTypes.JS:
          case common.challengeTypes.BONFIRE:
            type = 'javascript';
            break;
          default:
            type = '';
        }

        textMessage += ['My code:\n```', type, '\n', common.editor.getValue(), '\n```\n\n'].join('');
      }

      textMessage = encodeURIComponent(textMessage);

      $('#issue-modal').modal('hide');
      window.open('https://github.com/freecodecampchina/freecodecamp.cn/issues/new?&body=' + textMessage, '_blank');
    });
  });

  return common;
}(window);
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

window.common = function (global) {
  var Observable = global.Rx.Observable,
      chai = global.chai,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  common.runTests$ = function runTests$(_ref) {
    var code = _ref.code,
        originalCode = _ref.originalCode,
        userTests = _ref.userTests,
        rest = _objectWithoutProperties(_ref, ["code", "originalCode", "userTests"]);

    return Observable.from(userTests).map(function (test) {

      /* eslint-disable no-unused-vars */
      var assert = chai.assert;
      var editor = {
        getValue: function getValue() {
          return originalCode;
        }
      };
      /* eslint-enable no-unused-vars */

      try {
        if (test) {
          /* eslint-disable no-eval  */
          eval(common.reassembleTest(code, test));
          /* eslint-enable no-eval */
        }
      } catch (e) {
        test.err = e.message;
      }

      return test;
    }).toArray().map(function (tests) {
      return _extends({}, rest, { tests: tests });
    });
  };

  return common;
}(window);
'use strict';

window.common = function (global) {
  var $ = global.$,
      moment = global.moment,
      _global$ga = global.ga,
      ga = _global$ga === undefined ? function () {} : _global$ga,
      _global$common = global.common,
      common = _global$common === undefined ? { init: [] } : _global$common;


  function submitChallengeHandler(e) {
    e.preventDefault();

    var solution = common.editor.getValue();

    $('#submit-challenge').attr('disabled', 'true').removeClass('btn-primary').addClass('btn-warning disabled');

    var $checkmarkContainer = $('#checkmark-container');
    $checkmarkContainer.css({ height: $checkmarkContainer.innerHeight() });

    $('#challenge-checkmark').addClass('zoomOutUp')
    // .removeClass('zoomInDown')
    .delay(1000).queue(function (next) {
      $(this).replaceWith('<div id="challenge-spinner" ' + 'class="animated zoomInUp inner-circles-loader">' + 'submitting...</div>');
      next();
    });

    var timezone = 'UTC';
    try {
      timezone = moment.tz.guess();
    } catch (err) {
      err.message = '\n          known bug, see: https://github.com/moment/moment-timezone/issues/294:\n          ' + err.message + '\n        ';
      console.error(err);
    }
    var data = JSON.stringify({
      id: common.challengeId,
      name: common.challengeName,
      challengeType: +common.challengeType,
      solution: solution,
      timezone: timezone
    });

    $.ajax({
      url: '/completed-challenge/',
      type: 'POST',
      data: data,
      contentType: 'application/json',
      dataType: 'json'
    }).success(function (res) {
      if (res) {
        window.location = '/challenges/next-challenge?id=' + common.challengeId;
      }
    }).fail(function () {
      window.location.replace(window.location.href);
    });
  }

  common.showCompletion = function showCompletion() {

    ga('send', 'event', 'Challenge', 'solved', common.gaName, true);

    $('#complete-courseware-dialog').modal('show');
    $('#complete-courseware-dialog .modal-header').click();

    $('#submit-challenge').off('click');
    $('#submit-challenge').on('click', submitChallengeHandler);
  };

  return common;
}(window);
'use strict';

window.common = function (_ref) {
  var $ = _ref.$,
      _ref$common = _ref.common,
      common = _ref$common === undefined ? { init: [] } : _ref$common;

  var stepClass = '.challenge-step';
  var prevBtnClass = '.challenge-step-btn-prev';
  var nextBtnClass = '.challenge-step-btn-next';
  var actionBtnClass = '.challenge-step-btn-action';
  var finishBtnClass = '.challenge-step-btn-finish';
  var submitBtnId = '#challenge-step-btn-submit';
  var submitModalId = '#challenge-step-modal';

  function getPreviousStep($challengeSteps) {
    var $prevStep = false;
    var prevStepIndex = 0;
    $challengeSteps.each(function (index) {
      var $step = $(this);
      if (!$step.hasClass('hidden')) {
        prevStepIndex = index - 1;
      }
    });

    $prevStep = $challengeSteps[prevStepIndex];

    return $prevStep;
  }

  function getNextStep($challengeSteps) {
    var length = $challengeSteps.length;
    var $nextStep = false;
    var nextStepIndex = 0;
    $challengeSteps.each(function (index) {
      var $step = $(this);
      if (!$step.hasClass('hidden') && index + 1 !== length) {
        nextStepIndex = index + 1;
      }
    });

    $nextStep = $challengeSteps[nextStepIndex];

    return $nextStep;
  }

  function handlePrevStepClick(e) {
    e.preventDefault();
    var prevStep = getPreviousStep($(stepClass));
    $(this).parent().parent().removeClass('slideInLeft slideInRight').addClass('animated fadeOutRight fast-animation').delay(250).queue(function (prev) {
      $(this).addClass('hidden');
      if (prevStep) {
        $(prevStep).removeClass('hidden').removeClass('fadeOutLeft fadeOutRight').addClass('animated slideInLeft fast-animation').delay(500).queue(function (prev) {
          prev();
        });
      }
      prev();
    });
  }

  function handleNextStepClick(e) {
    e.preventDefault();
    var nextStep = getNextStep($(stepClass));
    $(this).parent().parent().removeClass('slideInRight slideInLeft').addClass('animated fadeOutLeft fast-animation').delay(250).queue(function (next) {
      $(this).addClass('hidden');
      if (nextStep) {
        $(nextStep).removeClass('hidden').removeClass('fadeOutRight fadeOutLeft').addClass('animated slideInRight fast-animation').delay(500).queue(function (next) {
          next();
        });
      }
      next();
    });
  }

  function handleActionClick(e) {
    var props = common.challengeSeed[0] || { stepIndex: [] };

    var $el = $(this);
    var index = +$el.attr('id');
    var propIndex = props.stepIndex.indexOf(index);

    if (propIndex === -1) {
      return $el.parent().find('.disabled').removeClass('disabled');
    }

    // an API action
    // prevent link from opening
    e.preventDefault();
    var prop = props.properties[propIndex];
    var api = props.apis[propIndex];
    if (common[prop]) {
      return $el.parent().find('.disabled').removeClass('disabled');
    }
    return $.post(api).done(function (data) {
      // assume a boolean indicates passing
      if (typeof data === 'boolean') {
        return $el.parent().find('.disabled').removeClass('disabled');
      }
      // assume api returns string when fails
      return $el.parent().find('.disabled').replaceWith('<p>' + data + '</p>');
    }).fail(function () {
      console.log('failed');
    });
  }

  function handleFinishClick(e) {
    e.preventDefault();
    $(submitModalId).modal('show');
    $(submitModalId + '.modal-header').click();
    $(submitBtnId).click(handleSubmitClick);
  }

  function handleSubmitClick(e) {
    e.preventDefault();

    $('#submit-challenge').attr('disabled', 'true').removeClass('btn-primary').addClass('btn-warning disabled');

    var $checkmarkContainer = $('#checkmark-container');
    $checkmarkContainer.css({ height: $checkmarkContainer.innerHeight() });

    $('#challenge-checkmark').addClass('zoomOutUp').delay(1000).queue(function (next) {
      $(this).replaceWith('<div id="challenge-spinner" ' + 'class="animated zoomInUp inner-circles-loader">' + 'submitting...</div>');
      next();
    });

    $.ajax({
      url: '/completed-challenge/',
      type: 'POST',
      data: JSON.stringify({
        id: common.challengeId,
        name: common.challengeName,
        challengeType: +common.challengeType
      }),
      contentType: 'application/json',
      dataType: 'json'
    }).success(function (res) {
      if (res) {
        window.location = '/challenges/next-challenge?id=' + common.challengeId;
      }
    }).fail(function () {
      window.location.replace(window.location.href);
    });
  }

  common.init.push(function ($) {
    if (common.challengeType !== '7') {
      return null;
    }

    $(prevBtnClass).click(handlePrevStepClick);
    $(nextBtnClass).click(handleNextStepClick);
    $(actionBtnClass).click(handleActionClick);
    $(finishBtnClass).click(handleFinishClick);
    return null;
  });

  return common;
}(window);
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

$(document).ready(function () {
  var common = window.common;
  var Observable = window.Rx.Observable;
  var addLoopProtect = common.addLoopProtect,
      challengeName = common.challengeName,
      challengeType = common.challengeType,
      challengeTypes = common.challengeTypes;


  common.init.forEach(function (init) {
    init($);
  });

  // only run if editor present
  if (common.editor.getValue) {
    var code$ = common.editorKeyUp$.debounce(750).map(function () {
      return common.editor.getValue();
    }).distinctUntilChanged().shareReplay();

    // update storage
    code$.subscribe(function (code) {
      common.codeStorage.updateStorage(common.challengeName, code);
      common.codeUri.querify(code);
    }, function (err) {
      return console.error(err);
    });

    code$
    // only run for HTML
    .filter(function () {
      return common.challengeType === challengeTypes.HTML;
    }).flatMap(function (code) {
      return common.detectUnsafeCode$(code).map(function () {
        var combinedCode = common.head + code + common.tail;

        return addLoopProtect(combinedCode);
      }).flatMap(function (code) {
        return common.updatePreview$(code);
      }).flatMap(function () {
        return common.checkPreview$({ code: code });
      }).catch(function (err) {
        return Observable.just({ err: err });
      });
    }).subscribe(function (_ref) {
      var err = _ref.err;

      if (err) {
        console.error(err);
        return common.updatePreview$('\n              <h1>' + err + '</h1>\n            ').subscribe(function () {});
      }
      return null;
    }, function (err) {
      return console.error(err);
    });
  }

  common.resetBtn$.doOnNext(function () {
    common.editor.setValue(common.replaceSafeTags(common.seed));
  }).flatMap(function () {
    return common.executeChallenge$().catch(function (err) {
      return Observable.just({ err: err });
    });
  }).subscribe(function (_ref2) {
    var err = _ref2.err,
        output = _ref2.output,
        originalCode = _ref2.originalCode;

    if (err) {
      console.error(err);
      return common.updateOutputDisplay('' + err);
    }
    common.codeStorage.updateStorage(challengeName, originalCode);
    common.codeUri.querify(originalCode);
    common.updateOutputDisplay(output);
    return null;
  }, function (err) {
    if (err) {
      console.error(err);
    }
    common.updateOutputDisplay('' + err);
  });

  Observable.merge(common.editorExecute$, common.submitBtn$).flatMap(function () {
    common.appendToOutputDisplay('\n// testing challenge...');
    return common.executeChallenge$().map(function (_ref3) {
      var tests = _ref3.tests,
          rest = _objectWithoutProperties(_ref3, ['tests']);

      var solved = tests.every(function (test) {
        return !test.err;
      });
      return _extends({}, rest, { tests: tests, solved: solved });
    }).catch(function (err) {
      return Observable.just({ err: err });
    });
  }).subscribe(function (_ref4) {
    var err = _ref4.err,
        solved = _ref4.solved,
        output = _ref4.output,
        tests = _ref4.tests;

    if (err) {
      console.error(err);
      if (common.challengeType === common.challengeTypes.HTML) {
        return common.updatePreview$('\n              <h1>' + err + '</h1>\n            ').first().subscribe(function () {});
      }
      return common.updateOutputDisplay('' + err);
    }
    common.updateOutputDisplay(output);
    common.displayTestResults(tests);
    if (solved) {
      common.showCompletion();
    }
    return null;
  }, function (_ref5) {
    var err = _ref5.err;

    console.error(err);
    common.updateOutputDisplay('' + err);
  });

  // initial challenge run to populate tests
  if (challengeType === challengeTypes.HTML) {
    var $preview = $('#preview');
    return Observable.fromCallback($preview.ready, $preview)().delay(500).flatMap(function () {
      return common.executeChallenge$();
    }).catch(function (err) {
      return Observable.just({ err: err });
    }).subscribe(function (_ref6) {
      var err = _ref6.err,
          tests = _ref6.tests;

      if (err) {
        console.error(err);
        if (common.challengeType === common.challengeTypes.HTML) {
          return common.updatePreview$('\n                <h1>' + err + '</h1>\n              ').subscribe(function () {});
        }
        return common.updateOutputDisplay('' + err);
      }
      common.displayTestResults(tests);
      return null;
    }, function (_ref7) {
      var err = _ref7.err;

      console.error(err);
    });
  }

  if (challengeType === challengeTypes.BONFIRE || challengeType === challengeTypes.JS) {
    return Observable.just({}).delay(500).flatMap(function () {
      return common.executeChallenge$();
    }).catch(function (err) {
      return Observable.just({ err: err });
    }).subscribe(function (_ref8) {
      var err = _ref8.err,
          originalCode = _ref8.originalCode,
          tests = _ref8.tests;

      if (err) {
        console.error(err);
        return common.updateOutputDisplay('' + err);
      }
      common.codeStorage.updateStorage(challengeName, originalCode);
      common.displayTestResults(tests);
      return null;
    }, function (err) {
      console.error(err);
      common.updateOutputDisplay('' + err);
    });
  }
  return null;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluaXQuanMiLCJiaW5kaW5ncy5qcyIsImNvZGUtc3RvcmFnZS5qcyIsImNvZGUtdXJpLmpzIiwiYWRkLWxvb3AtcHJvdGVjdC5qcyIsImdldC1pZnJhbWUuanMiLCJ1cGRhdGUtcHJldmlldy5qcyIsImNyZWF0ZS1lZGl0b3IuanMiLCJkZXRlY3QtdW5zYWZlLWNvZGUtc3RyZWFtLmpzIiwiZGlzcGxheS10ZXN0LXJlc3VsdHMuanMiLCJleGVjdXRlLWNoYWxsZW5nZS1zdHJlYW0uanMiLCJvdXRwdXQtZGlzcGxheS5qcyIsInBob25lLXNjcm9sbC1sb2NrLmpzIiwicmVwb3J0LWlzc3VlLmpzIiwicnVuLXRlc3RzLXN0cmVhbS5qcyIsInNob3ctY29tcGxldGlvbi5qcyIsInN0ZXAtY2hhbGxlbmdlLmpzIiwiZW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb21tb25GcmFtZXdvcmsuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5jb21tb24gPSBmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIC8vIGNvbW1vbiBuYW1lc3BhY2VcbiAgLy8gYWxsIGNsYXNzZXMgc2hvdWxkIGJlIHN0b3JlZCBoZXJlXG4gIC8vIGNhbGxlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGRvbSByZWFkeVxuICB2YXIgX2dsb2JhbCRSeCA9IGdsb2JhbC5SeCxcbiAgICAgIERpc3Bvc2FibGUgPSBfZ2xvYmFsJFJ4LkRpc3Bvc2FibGUsXG4gICAgICBPYnNlcnZhYmxlID0gX2dsb2JhbCRSeC5PYnNlcnZhYmxlLFxuICAgICAgY29uZmlnID0gX2dsb2JhbCRSeC5jb25maWcsXG4gICAgICBfZ2xvYmFsJGNvbW1vbiA9IGdsb2JhbC5jb21tb24sXG4gICAgICBjb21tb24gPSBfZ2xvYmFsJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX2dsb2JhbCRjb21tb247XG5cblxuICBjb25maWcubG9uZ1N0YWNrU3VwcG9ydCA9IHRydWU7XG4gIGNvbW1vbi5oZWFkID0gY29tbW9uLmhlYWQgfHwgW107XG4gIGNvbW1vbi50YWlsID0gY29tbW9uLnRhaWwgfHwgW107XG4gIGNvbW1vbi5zYWx0ID0gTWF0aC5yYW5kb20oKTtcblxuICBjb21tb24uY2hhbGxlbmdlVHlwZXMgPSB7XG4gICAgSFRNTDogJzAnLFxuICAgIEpTOiAnMScsXG4gICAgVklERU86ICcyJyxcbiAgICBaSVBMSU5FOiAnMycsXG4gICAgQkFTRUpVTVA6ICc0JyxcbiAgICBCT05GSVJFOiAnNScsXG4gICAgSElLRVM6ICc2JyxcbiAgICBTVEVQOiAnNydcbiAgfTtcblxuICBjb21tb24uYXJyYXlUb05ld0xpbmVTdHJpbmcgPSBmdW5jdGlvbiBhcnJheVRvTmV3TGluZVN0cmluZyhzZWVkRGF0YSkge1xuICAgIHNlZWREYXRhID0gQXJyYXkuaXNBcnJheShzZWVkRGF0YSkgPyBzZWVkRGF0YSA6IFtzZWVkRGF0YV07XG4gICAgcmV0dXJuIHNlZWREYXRhLnJlZHVjZShmdW5jdGlvbiAoc2VlZCwgbGluZSkge1xuICAgICAgcmV0dXJuICcnICsgc2VlZCArIGxpbmUgKyAnXFxuJztcbiAgICB9LCAnJyk7XG4gIH07XG5cbiAgY29tbW9uLnNlZWQgPSBjb21tb24uYXJyYXlUb05ld0xpbmVTdHJpbmcoY29tbW9uLmNoYWxsZW5nZVNlZWQpO1xuXG4gIGNvbW1vbi5yZXBsYWNlU2NyaXB0VGFncyA9IGZ1bmN0aW9uIHJlcGxhY2VTY3JpcHRUYWdzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLzxzY3JpcHQ+L2dpLCAnZmNjc3MnKS5yZXBsYWNlKC88XFwvc2NyaXB0Pi9naSwgJ2ZjY2VzJyk7XG4gIH07XG5cbiAgY29tbW9uLnJlcGxhY2VTYWZlVGFncyA9IGZ1bmN0aW9uIHJlcGxhY2VTYWZlVGFncyh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9mY2Nzcy9naSwgJzxzY3JpcHQ+JykucmVwbGFjZSgvZmNjZXMvZ2ksICc8L3NjcmlwdD4nKTtcbiAgfTtcblxuICBjb21tb24ucmVwbGFjZUZvcm1BY3Rpb25BdHRyID0gZnVuY3Rpb24gcmVwbGFjZUZvcm1BY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvPGZvcm1bXj5dKj4vLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gdmFsLnJlcGxhY2UoL2FjdGlvbihcXHMqPyk9LywgJ2ZjY2ZhYSQxPScpO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbW1vbi5yZXBsYWNlRmNjZmFhQXR0ciA9IGZ1bmN0aW9uIHJlcGxhY2VGY2NmYWFBdHRyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLzxmb3JtW14+XSo+LywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbC5yZXBsYWNlKC9mY2NmYWEoXFxzKj8pPS8sICdhY3Rpb24kMT0nKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb21tb24uc2NvcGVqUXVlcnkgPSBmdW5jdGlvbiBzY29wZWpRdWVyeShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcJC9naSwgJ2okJykucmVwbGFjZSgvZG9jdW1lbnQvZ2ksICdqZG9jdW1lbnQnKS5yZXBsYWNlKC9qUXVlcnkvZ2ksICdqalF1ZXJ5Jyk7XG4gIH07XG5cbiAgY29tbW9uLnVuU2NvcGVKUXVlcnkgPSBmdW5jdGlvbiB1blNjb3BlSlF1ZXJ5KHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvalxcJC9naSwgJyQnKS5yZXBsYWNlKC9qZG9jdW1lbnQvZ2ksICdkb2N1bWVudCcpLnJlcGxhY2UoL2pqUXVlcnkvZ2ksICdqUXVlcnknKTtcbiAgfTtcblxuICB2YXIgY29tbWVudFJlZ2V4ID0gLyhcXC9cXCpbXihcXCpcXC8pXSpcXCpcXC8pfChbIFxcbl1cXC9cXC9bXlxcbl0qKS9nO1xuICBjb21tb24ucmVtb3ZlQ29tbWVudHMgPSBmdW5jdGlvbiByZW1vdmVDb21tZW50cyhzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoY29tbWVudFJlZ2V4LCAnJyk7XG4gIH07XG5cbiAgdmFyIGxvZ1JlZ2V4ID0gLyhjb25zb2xlXFwuW1xcd10rXFxzKlxcKC4qXFw7KS9nO1xuICBjb21tb24ucmVtb3ZlTG9ncyA9IGZ1bmN0aW9uIHJlbW92ZUxvZ3Moc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKGxvZ1JlZ2V4LCAnJyk7XG4gIH07XG5cbiAgY29tbW9uLnJlYXNzZW1ibGVUZXN0ID0gZnVuY3Rpb24gcmVhc3NlbWJsZVRlc3QoKSB7XG4gICAgdmFyIGNvZGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgIHZhciBfcmVmID0gYXJndW1lbnRzWzFdO1xuICAgIHZhciBsaW5lID0gX3JlZi5saW5lLFxuICAgICAgICB0ZXh0ID0gX3JlZi50ZXh0O1xuXG4gICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJy8vJyArIGxpbmUgKyBjb21tb24uc2FsdCk7XG4gICAgcmV0dXJuIGNvZGUucmVwbGFjZShyZWdleHAsIHRleHQpO1xuICB9O1xuXG4gIGNvbW1vbi5nZXRTY3JpcHRDb250ZW50JCA9IGZ1bmN0aW9uIGdldFNjcmlwdENvbnRlbnQkKHNjcmlwdCkge1xuICAgIHJldHVybiBPYnNlcnZhYmxlLmNyZWF0ZShmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbiAgICAgIHZhciBqcVhIUiA9ICQuZ2V0KHNjcmlwdCwgbnVsbCwgbnVsbCwgJ3RleHQnKS5zdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIG9ic2VydmVyLm9uTmV4dChkYXRhKTtcbiAgICAgICAgb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIG9ic2VydmVyLm9uRXJyb3IoZSk7XG4gICAgICB9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gb2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24gKCkge1xuICAgICAgICBqcVhIUi5hYm9ydCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIG9wZW5TY3JpcHQgPSAvXFw8XFxzP3NjcmlwdFxccz9cXD4vZ2k7XG4gIHZhciBjbG9zaW5nU2NyaXB0ID0gL1xcPFxccz9cXC9cXHM/c2NyaXB0XFxzP1xcPi9naTtcblxuICAvLyBkZXRlY3RzIGlmIHRoZXJlIGlzIEphdmFTY3JpcHQgaW4gdGhlIGZpcnN0IHNjcmlwdCB0YWdcbiAgY29tbW9uLmhhc0pzID0gZnVuY3Rpb24gaGFzSnMoY29kZSkge1xuICAgIHJldHVybiAhIWNvbW1vbi5nZXRKc0Zyb21IdG1sKGNvZGUpO1xuICB9O1xuXG4gIC8vIGdyYWJzIHRoZSBjb250ZW50IGZyb20gdGhlIGZpcnN0IHNjcmlwdCB0YWcgaW4gdGhlIGNvZGVcbiAgY29tbW9uLmdldEpzRnJvbUh0bWwgPSBmdW5jdGlvbiBnZXRKc0Zyb21IdG1sKGNvZGUpIHtcbiAgICAvLyBncmFiIHVzZXIgamF2YVNjcmlwdFxuICAgIHJldHVybiAoY29kZS5zcGxpdChvcGVuU2NyaXB0KVsxXSB8fCAnJykuc3BsaXQoY2xvc2luZ1NjcmlwdClbMF0gfHwgJyc7XG4gIH07XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5jb21tb24gPSBmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIHZhciAkID0gZ2xvYmFsLiQsXG4gICAgICBPYnNlcnZhYmxlID0gZ2xvYmFsLlJ4Lk9ic2VydmFibGUsXG4gICAgICBfZ2xvYmFsJGNvbW1vbiA9IGdsb2JhbC5jb21tb24sXG4gICAgICBjb21tb24gPSBfZ2xvYmFsJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX2dsb2JhbCRjb21tb247XG5cblxuICBjb21tb24uY3RybEVudGVyQ2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gY3RybEVudGVyQ2xpY2tIYW5kbGVyKGUpIHtcbiAgICAvLyBjdHJsICsgZW50ZXIgb3IgY21kICsgZW50ZXJcbiAgICBpZiAoZS5rZXlDb2RlID09PSAxMyAmJiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSkpIHtcbiAgICAgICQoJyNjb21wbGV0ZS1jb3Vyc2V3YXJlLWRpYWxvZycpLm9mZigna2V5ZG93bicsIGN0cmxFbnRlckNsaWNrSGFuZGxlcik7XG4gICAgICBpZiAoJCgnI3N1Ym1pdC1jaGFsbGVuZ2UnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICQoJyNzdWJtaXQtY2hhbGxlbmdlJykuY2xpY2soKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvY2hhbGxlbmdlcy9uZXh0LWNoYWxsZW5nZT9pZD0nICsgY29tbW9uLmNoYWxsZW5nZUlkO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb21tb24uaW5pdC5wdXNoKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgJG1hcmdpbkZpeCA9ICQoJy5pbm5lck1hcmdpbkZpeCcpO1xuICAgICRtYXJnaW5GaXguY3NzKCdtaW4taGVpZ2h0JywgJG1hcmdpbkZpeC5oZWlnaHQoKSk7XG5cbiAgICBjb21tb24uc3VibWl0QnRuJCA9IE9ic2VydmFibGUuZnJvbUV2ZW50KCQoJyNzdWJtaXRCdXR0b24nKSwgJ2NsaWNrJyk7XG5cbiAgICBjb21tb24ucmVzZXRCdG4kID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnQoJCgnI3Jlc2V0LWJ1dHRvbicpLCAnY2xpY2snKTtcblxuICAgIC8vIGluaXQgbW9kYWwga2V5YmluZGluZ3Mgb24gb3BlblxuICAgICQoJyNjb21wbGV0ZS1jb3Vyc2V3YXJlLWRpYWxvZycpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJyNjb21wbGV0ZS1jb3Vyc2V3YXJlLWRpYWxvZycpLmtleWRvd24oY29tbW9uLmN0cmxFbnRlckNsaWNrSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyByZW1vdmUgbW9kYWwga2V5YmluZHMgb24gY2xvc2VcbiAgICAkKCcjY29tcGxldGUtY291cnNld2FyZS1kaWFsb2cnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xuICAgICAgJCgnI2NvbXBsZXRlLWNvdXJzZXdhcmUtZGlhbG9nJykub2ZmKCdrZXlkb3duJywgY29tbW9uLmN0cmxFbnRlckNsaWNrSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICAvLyB2aWRlbyBjaGVja2xpc3QgYmluZGluZ1xuICAgICQoJy5jaGFsbGVuZ2UtbGlzdC1jaGVja2JveCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2hlY2tib3hJZCA9ICQodGhpcykucGFyZW50KCkucGFyZW50KCkuYXR0cignaWQnKTtcbiAgICAgIGlmICgkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgICQodGhpcykucGFyZW50KCkuc2libGluZ3MoKS5jaGlsZHJlbigpLmFkZENsYXNzKCdmYWRlZCcpO1xuICAgICAgICBpZiAoIWxvY2FsU3RvcmFnZSB8fCAhbG9jYWxTdG9yYWdlW2NoZWNrYm94SWRdKSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlW2NoZWNrYm94SWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoISQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5zaWJsaW5ncygpLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoJ2ZhZGVkJyk7XG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2VbY2hlY2tib3hJZF0pIHtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShjaGVja2JveElkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnLmNoZWNrbGlzdC1lbGVtZW50JykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2hlY2tsaXN0RWxlbWVudElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgICAgaWYgKGxvY2FsU3RvcmFnZVtjaGVja2xpc3RFbGVtZW50SWRdKSB7XG4gICAgICAgICQodGhpcykuY2hpbGRyZW4oKS5jaGlsZHJlbignbGknKS5hZGRDbGFzcygnZmFkZWQnKTtcbiAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigpLmNoaWxkcmVuKCdpbnB1dCcpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyB2aWRlbyBjaGFsbGVuZ2Ugc3VibWl0XG4gICAgJCgnI25leHQtY291cnNld2FyZS1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcjbmV4dC1jb3Vyc2V3YXJlLWJ1dHRvbicpLnVuYmluZCgnY2xpY2snKTtcbiAgICAgIGlmICgkKCcuc2lnbnVwLWJ0bi1uYXYnKS5sZW5ndGggPCAxKSB7XG4gICAgICAgIHZhciBkYXRhO1xuICAgICAgICB2YXIgc29sdXRpb24gPSAkKCcjcHVibGljLXVybCcpLnZhbCgpIHx8IG51bGw7XG4gICAgICAgIHZhciBnaXRodWJMaW5rID0gJCgnI2dpdGh1Yi11cmwnKS52YWwoKSB8fCBudWxsO1xuICAgICAgICBzd2l0Y2ggKGNvbW1vbi5jaGFsbGVuZ2VUeXBlKSB7XG4gICAgICAgICAgY2FzZSBjb21tb24uY2hhbGxlbmdlVHlwZXMuVklERU86XG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICBpZDogY29tbW9uLmNoYWxsZW5nZUlkLFxuICAgICAgICAgICAgICBuYW1lOiBjb21tb24uY2hhbGxlbmdlTmFtZSxcbiAgICAgICAgICAgICAgY2hhbGxlbmdlVHlwZTogK2NvbW1vbi5jaGFsbGVuZ2VUeXBlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgdXJsOiAnL2NvbXBsZXRlZC1jaGFsbGVuZ2UvJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgIGlmICghcmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9jaGFsbGVuZ2VzL25leHQtY2hhbGxlbmdlP2lkPScgKyBjb21tb24uY2hhbGxlbmdlSWQ7XG4gICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2Uod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgY29tbW9uLmNoYWxsZW5nZVR5cGVzLkJBU0VKVU1QOlxuICAgICAgICAgIGNhc2UgY29tbW9uLmNoYWxsZW5nZVR5cGVzLlpJUExJTkU6XG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICBpZDogY29tbW9uLmNoYWxsZW5nZUlkLFxuICAgICAgICAgICAgICBuYW1lOiBjb21tb24uY2hhbGxlbmdlTmFtZSxcbiAgICAgICAgICAgICAgY2hhbGxlbmdlVHlwZTogK2NvbW1vbi5jaGFsbGVuZ2VUeXBlLFxuICAgICAgICAgICAgICBzb2x1dGlvbjogc29sdXRpb24sXG4gICAgICAgICAgICAgIGdpdGh1Ykxpbms6IGdpdGh1YkxpbmtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgIHVybDogJy9jb21wbGV0ZWQtemlwbGluZS1vci1iYXNlanVtcC8nLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2NoYWxsZW5nZXMvbmV4dC1jaGFsbGVuZ2U/aWQ9JyArIGNvbW1vbi5jaGFsbGVuZ2VJZDtcbiAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZSh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBjb21tb24uY2hhbGxlbmdlVHlwZXMuQk9ORklSRTpcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9jaGFsbGVuZ2VzL25leHQtY2hhbGxlbmdlP2lkPScgKyBjb21tb24uY2hhbGxlbmdlSWQ7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnSGFwcHkgQ29kaW5nIScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChjb21tb24uY2hhbGxlbmdlTmFtZSkge1xuICAgICAgd2luZG93LmdhKCdzZW5kJywgJ2V2ZW50JywgJ0NoYWxsZW5nZScsICdsb2FkJywgY29tbW9uLmdhTmFtZSk7XG4gICAgfVxuXG4gICAgJCgnI2NvbXBsZXRlLWNvdXJzZXdhcmUtZGlhbG9nJykub24oJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChjb21tb24uZWRpdG9yLmZvY3VzKSB7XG4gICAgICAgIGNvbW1vbi5lZGl0b3IuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJyN0cmlnZ2VyLWlzc3VlLW1vZGFsJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgJCgnI2lzc3VlLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICB9KTtcblxuICAgICQoJyN0cmlnZ2VyLWhlbHAtbW9kYWwnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcjaGVscC1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgfSk7XG5cbiAgICAkKCcjdHJpZ2dlci1yZXNldC1tb2RhbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJyNyZXNldC1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgfSk7XG5cbiAgICAkKCcjdHJpZ2dlci1wYWlyLW1vZGFsJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgJCgnI3BhaXItbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgIH0pO1xuXG4gICAgJCgnI2NvbXBsZXRlZC1jb3Vyc2V3YXJlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgJCgnI2NvbXBsZXRlLWNvdXJzZXdhcmUtZGlhbG9nJykubW9kYWwoJ3Nob3cnKTtcbiAgICB9KTtcblxuICAgICQoJyNoZWxwLWl2ZS1mb3VuZC1hLWJ1Zy13aWtpLWFydGljbGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICB3aW5kb3cub3BlbignaHR0cHM6Ly9naXRodWIuY29tL2ZyZWVjb2RlY2FtcGNoaW5hL2ZyZWVjb2RlY2FtcC5jbi93aWtpLycgKyBcIkhlbHAtSSd2ZS1Gb3VuZC1hLUJ1Z1wiLCAnX2JsYW5rJyk7XG4gICAgfSk7XG5cbiAgICAkKCcjc2VhcmNoLWlzc3VlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHF1ZXJ5SXNzdWUgPSB3aW5kb3cubG9jYXRpb24uaHJlZi50b1N0cmluZygpLnNwbGl0KCc/JylbMF0ucmVwbGFjZSgvKCMqKSQvLCAnJyk7XG4gICAgICB3aW5kb3cub3BlbignaHR0cHM6Ly9naXRodWIuY29tL2ZyZWVjb2RlY2FtcGNoaW5hL2ZyZWVjb2RlY2FtcC5jbi9pc3N1ZXM/cT0nICsgJ2lzOmlzc3VlIGlzOmFsbCAnICsgY29tbW9uLmNoYWxsZW5nZU5hbWUgKyAnIE9SICcgKyBxdWVyeUlzc3VlLnN1YnN0cihxdWVyeUlzc3VlLmxhc3RJbmRleE9mKCdjaGFsbGVuZ2VzLycpICsgMTEpLnJlcGxhY2UoJy8nLCAnJyksICdfYmxhbmsnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIGRlcGVuZHMgb246IGNvZGVVcmlcbndpbmRvdy5jb21tb24gPSBmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIHZhciBsb2NhbFN0b3JhZ2UgPSBnbG9iYWwubG9jYWxTdG9yYWdlLFxuICAgICAgX2dsb2JhbCRjb21tb24gPSBnbG9iYWwuY29tbW9uLFxuICAgICAgY29tbW9uID0gX2dsb2JhbCRjb21tb24gPT09IHVuZGVmaW5lZCA/IHsgaW5pdDogW10gfSA6IF9nbG9iYWwkY29tbW9uO1xuXG5cbiAgdmFyIGNoYWxsZW5nZVByZWZpeCA9IFsnQm9uZmlyZTogJywgJ1dheXBvaW50OiAnLCAnWmlwbGluZTogJywgJ0Jhc2VqdW1wOiAnLCAnQ2hlY2twb2ludDogJ10sXG4gICAgICBpdGVtO1xuXG4gIHZhciBjb2RlU3RvcmFnZSA9IHtcbiAgICBnZXRTdG9yZWRWYWx1ZTogZnVuY3Rpb24gZ2V0U3RvcmVkVmFsdWUoa2V5KSB7XG4gICAgICBpZiAoIWxvY2FsU3RvcmFnZSB8fCB0eXBlb2YgbG9jYWxTdG9yYWdlLmdldEl0ZW0gIT09ICdmdW5jdGlvbicgfHwgIWtleSB8fCB0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zb2xlLmxvZygndW5hYmxlIHRvIHJlYWQgZnJvbSBzdG9yYWdlJyk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkgKyAnVmFsJykpIHtcbiAgICAgICAgcmV0dXJuICcnICsgbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5ICsgJ1ZhbCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gY2hhbGxlbmdlUHJlZml4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaXRlbSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGNoYWxsZW5nZVByZWZpeFtpXSArIGtleSArICdWYWwnKTtcbiAgICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuICcnICsgaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cblxuICAgIGlzQWxpdmU6IGZ1bmN0aW9uIGlzQWxpdmUoa2V5KSB7XG4gICAgICB2YXIgdmFsID0gdGhpcy5nZXRTdG9yZWRWYWx1ZShrZXkpO1xuICAgICAgcmV0dXJuIHZhbCAhPT0gJ251bGwnICYmIHZhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsICYmIHZhbC5sZW5ndGggPiAwO1xuICAgIH0sXG5cbiAgICB1cGRhdGVTdG9yYWdlOiBmdW5jdGlvbiB1cGRhdGVTdG9yYWdlKGtleSwgY29kZSkge1xuICAgICAgaWYgKCFsb2NhbFN0b3JhZ2UgfHwgdHlwZW9mIGxvY2FsU3RvcmFnZS5zZXRJdGVtICE9PSAnZnVuY3Rpb24nIHx8ICFrZXkgfHwgdHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3VuYWJsZSB0byBzYXZlIHRvIHN0b3JhZ2UnKTtcbiAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICB9XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXkgKyAnVmFsJywgY29kZSk7XG4gICAgICByZXR1cm4gY29kZTtcbiAgICB9XG4gIH07XG5cbiAgY29tbW9uLmNvZGVTdG9yYWdlID0gY29kZVN0b3JhZ2U7XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93LCB3aW5kb3cuY29tbW9uKTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIHN0b3JlIGNvZGUgaW4gdGhlIFVSTFxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgdmFyIF9lbmNvZGUgPSBnbG9iYWwuZW5jb2RlVVJJQ29tcG9uZW50LFxuICAgICAgX2RlY29kZSA9IGdsb2JhbC5kZWNvZGVVUklDb21wb25lbnQsXG4gICAgICBsb2NhdGlvbiA9IGdsb2JhbC5sb2NhdGlvbixcbiAgICAgIGhpc3RvcnkgPSBnbG9iYWwuaGlzdG9yeSxcbiAgICAgIF9nbG9iYWwkY29tbW9uID0gZ2xvYmFsLmNvbW1vbixcbiAgICAgIGNvbW1vbiA9IF9nbG9iYWwkY29tbW9uID09PSB1bmRlZmluZWQgPyB7IGluaXQ6IFtdIH0gOiBfZ2xvYmFsJGNvbW1vbjtcbiAgdmFyIHJlcGxhY2VTY3JpcHRUYWdzID0gY29tbW9uLnJlcGxhY2VTY3JpcHRUYWdzLFxuICAgICAgcmVwbGFjZVNhZmVUYWdzID0gY29tbW9uLnJlcGxhY2VTYWZlVGFncyxcbiAgICAgIHJlcGxhY2VGb3JtQWN0aW9uQXR0ciA9IGNvbW1vbi5yZXBsYWNlRm9ybUFjdGlvbkF0dHIsXG4gICAgICByZXBsYWNlRmNjZmFhQXR0ciA9IGNvbW1vbi5yZXBsYWNlRmNjZmFhQXR0cjtcblxuXG4gIHZhciBxdWVyeVJlZ2V4ID0gL14oXFw/fCNcXD8pLztcbiAgZnVuY3Rpb24gZW5jb2RlRmNjKHZhbCkge1xuICAgIHJldHVybiByZXBsYWNlU2NyaXB0VGFncyhyZXBsYWNlRm9ybUFjdGlvbkF0dHIodmFsKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGVGY2ModmFsKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VTYWZlVGFncyhyZXBsYWNlRmNjZmFhQXR0cih2YWwpKTtcbiAgfVxuXG4gIHZhciBjb2RlVXJpID0ge1xuICAgIGVuY29kZTogZnVuY3Rpb24gZW5jb2RlKGNvZGUpIHtcbiAgICAgIHJldHVybiBfZW5jb2RlKGNvZGUpO1xuICAgIH0sXG4gICAgZGVjb2RlOiBmdW5jdGlvbiBkZWNvZGUoY29kZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIF9kZWNvZGUoY29kZSk7XG4gICAgICB9IGNhdGNoIChpZ25vcmUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSxcbiAgICBpc0luUXVlcnk6IGZ1bmN0aW9uIGlzSW5RdWVyeShxdWVyeSkge1xuICAgICAgdmFyIGRlY29kZWQgPSBjb2RlVXJpLmRlY29kZShxdWVyeSk7XG4gICAgICBpZiAoIWRlY29kZWQgfHwgdHlwZW9mIGRlY29kZWQuc3BsaXQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlY29kZWQucmVwbGFjZShxdWVyeVJlZ2V4LCAnJykuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24gKGZvdW5kLCBwYXJhbSkge1xuICAgICAgICB2YXIga2V5ID0gcGFyYW0uc3BsaXQoJz0nKVswXTtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3NvbHV0aW9uJykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9LFxuICAgIGlzQWxpdmU6IGZ1bmN0aW9uIGlzQWxpdmUoKSB7XG4gICAgICByZXR1cm4gY29kZVVyaS5lbmFibGVkICYmIGNvZGVVcmkuaXNJblF1ZXJ5KGxvY2F0aW9uLnNlYXJjaCkgfHwgY29kZVVyaS5pc0luUXVlcnkobG9jYXRpb24uaGFzaCk7XG4gICAgfSxcbiAgICBnZXRLZXlJblF1ZXJ5OiBmdW5jdGlvbiBnZXRLZXlJblF1ZXJ5KHF1ZXJ5KSB7XG4gICAgICB2YXIga2V5VG9GaW5kID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnJztcblxuICAgICAgcmV0dXJuIHF1ZXJ5LnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uIChvbGRWYWx1ZSwgcGFyYW0pIHtcbiAgICAgICAgdmFyIGtleSA9IHBhcmFtLnNwbGl0KCc9JylbMF07XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtLnNwbGl0KCc9Jykuc2xpY2UoMSkuam9pbignPScpO1xuXG4gICAgICAgIGlmIChrZXkgPT09IGtleVRvRmluZCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2xkVmFsdWU7XG4gICAgICB9LCBudWxsKTtcbiAgICB9LFxuICAgIGdldFNvbHV0aW9uRnJvbVF1ZXJ5OiBmdW5jdGlvbiBnZXRTb2x1dGlvbkZyb21RdWVyeSgpIHtcbiAgICAgIHZhciBxdWVyeSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG5cbiAgICAgIHJldHVybiBkZWNvZGVGY2MoY29kZVVyaS5kZWNvZGUoY29kZVVyaS5nZXRLZXlJblF1ZXJ5KHF1ZXJ5LCAnc29sdXRpb24nKSkpO1xuICAgIH0sXG5cbiAgICBwYXJzZTogZnVuY3Rpb24gcGFyc2UoKSB7XG4gICAgICBpZiAoIWNvZGVVcmkuZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBxdWVyeTtcbiAgICAgIGlmIChsb2NhdGlvbi5zZWFyY2ggJiYgY29kZVVyaS5pc0luUXVlcnkobG9jYXRpb24uc2VhcmNoKSkge1xuICAgICAgICBxdWVyeSA9IGxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpO1xuXG4gICAgICAgIGlmIChoaXN0b3J5ICYmIHR5cGVvZiBoaXN0b3J5LnJlcGxhY2VTdGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKGhpc3Rvcnkuc3RhdGUsIG51bGwsIGxvY2F0aW9uLmhyZWYuc3BsaXQoJz8nKVswXSk7XG4gICAgICAgICAgbG9jYXRpb24uaGFzaCA9ICcjPycgKyBlbmNvZGVGY2MocXVlcnkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeSA9IGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXlxcI1xcPy8sICcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFxdWVyeSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0U29sdXRpb25Gcm9tUXVlcnkocXVlcnkpO1xuICAgIH0sXG4gICAgcXVlcmlmeTogZnVuY3Rpb24gcXVlcmlmeShzb2x1dGlvbikge1xuICAgICAgaWYgKCFjb2RlVXJpLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoaGlzdG9yeSAmJiB0eXBlb2YgaGlzdG9yeS5yZXBsYWNlU3RhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gZ3JhYiB0aGUgdXJsIHVwIHRvIHRoZSBxdWVyeVxuICAgICAgICAvLyBkZXN0cm95IGFueSBoYXNoIHN5bWJvbHMgc3RpbGwgY2xpbmdpbmcgdG8gbGlmZVxuICAgICAgICB2YXIgdXJsID0gbG9jYXRpb24uaHJlZi5zcGxpdCgnPycpWzBdLnJlcGxhY2UoLygjKikkLywgJycpO1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShoaXN0b3J5LnN0YXRlLCBudWxsLCB1cmwgKyAnIz8nICsgKGNvZGVVcmkuc2hvdWxkUnVuKCkgPyAnJyA6ICdydW49ZGlzYWJsZWQmJykgKyAnc29sdXRpb249JyArIGNvZGVVcmkuZW5jb2RlKGVuY29kZUZjYyhzb2x1dGlvbikpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSAnP3NvbHV0aW9uPScgKyBjb2RlVXJpLmVuY29kZShlbmNvZGVGY2Moc29sdXRpb24pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNvbHV0aW9uO1xuICAgIH0sXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBzaG91bGRSdW46IGZ1bmN0aW9uIHNob3VsZFJ1bigpIHtcbiAgICAgIHJldHVybiAhdGhpcy5nZXRLZXlJblF1ZXJ5KChsb2NhdGlvbi5zZWFyY2ggfHwgbG9jYXRpb24uaGFzaCkucmVwbGFjZShxdWVyeVJlZ2V4LCAnJyksICdydW4nKTtcbiAgICB9XG4gIH07XG5cbiAgY29tbW9uLmluaXQucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgY29kZVVyaS5wYXJzZSgpO1xuICB9KTtcblxuICBjb21tb24uY29kZVVyaSA9IGNvZGVVcmk7XG4gIGNvbW1vbi5zaG91bGRSdW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNvZGVVcmkuc2hvdWxkUnVuKCk7XG4gIH07XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5jb21tb24gPSBmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIHZhciBsb29wUHJvdGVjdCA9IGdsb2JhbC5sb29wUHJvdGVjdCxcbiAgICAgIF9nbG9iYWwkY29tbW9uID0gZ2xvYmFsLmNvbW1vbixcbiAgICAgIGNvbW1vbiA9IF9nbG9iYWwkY29tbW9uID09PSB1bmRlZmluZWQgPyB7IGluaXQ6IFtdIH0gOiBfZ2xvYmFsJGNvbW1vbjtcblxuXG4gIGxvb3BQcm90ZWN0LmhpdCA9IGZ1bmN0aW9uIGhpdChsaW5lKSB7XG4gICAgdmFyIGVyciA9ICdFcnJvcjogRXhpdGluZyBwb3RlbnRpYWwgaW5maW5pdGUgbG9vcCBhdCBsaW5lICcgKyBsaW5lICsgJy4gVG8gZGlzYWJsZSBsb29wIHByb3RlY3Rpb24sIHdyaXRlOiBcXG5cXFxcL1xcXFwvIG5vcHJvdGVjdFxcbmFzIHRoZSBmaXJzdCcgKyAnbGluZS4gQmV3YXJlIHRoYXQgaWYgeW91IGRvIGhhdmUgYW4gaW5maW5pdGUgbG9vcCBpbiB5b3VyIGNvZGUnICsgJ3RoaXMgd2lsbCBjcmFzaCB5b3VyIGJyb3dzZXIuJztcbiAgICBjb25zb2xlLmVycm9yKGVycik7XG4gIH07XG5cbiAgY29tbW9uLmFkZExvb3BQcm90ZWN0ID0gZnVuY3Rpb24gYWRkTG9vcFByb3RlY3QoKSB7XG4gICAgdmFyIGNvZGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuXG4gICAgcmV0dXJuIGxvb3BQcm90ZWN0KGNvZGUpO1xuICB9O1xuXG4gIHJldHVybiBjb21tb247XG59KHdpbmRvdyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cuY29tbW9uID0gZnVuY3Rpb24gKGdsb2JhbCkge1xuICB2YXIgX2dsb2JhbCRjb21tb24gPSBnbG9iYWwuY29tbW9uLFxuICAgICAgY29tbW9uID0gX2dsb2JhbCRjb21tb24gPT09IHVuZGVmaW5lZCA/IHsgaW5pdDogW10gfSA6IF9nbG9iYWwkY29tbW9uLFxuICAgICAgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xuXG5cbiAgY29tbW9uLmdldElmcmFtZSA9IGZ1bmN0aW9uIGdldElmcmFtZSgpIHtcbiAgICB2YXIgaWQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICdwcmV2aWV3JztcblxuICAgIHZhciBwcmV2aWV3RnJhbWUgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG4gICAgLy8gY3JlYXRlIGFuZCBhcHBlbmQgYSBoaWRkZW4gcHJldmlldyBmcmFtZVxuICAgIGlmICghcHJldmlld0ZyYW1lKSB7XG4gICAgICBwcmV2aWV3RnJhbWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICBwcmV2aWV3RnJhbWUuaWQgPSBpZDtcbiAgICAgIHByZXZpZXdGcmFtZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmUnKTtcbiAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHByZXZpZXdGcmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZXZpZXdGcmFtZS5jb250ZW50RG9jdW1lbnQgfHwgcHJldmlld0ZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIH07XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5jb21tb24gPSBmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIHZhciBfZ2xvYmFsJFJ4ID0gZ2xvYmFsLlJ4LFxuICAgICAgQmVoYXZpb3JTdWJqZWN0ID0gX2dsb2JhbCRSeC5CZWhhdmlvclN1YmplY3QsXG4gICAgICBPYnNlcnZhYmxlID0gX2dsb2JhbCRSeC5PYnNlcnZhYmxlLFxuICAgICAgX2dsb2JhbCRjb21tb24gPSBnbG9iYWwuY29tbW9uLFxuICAgICAgY29tbW9uID0gX2dsb2JhbCRjb21tb24gPT09IHVuZGVmaW5lZCA/IHsgaW5pdDogW10gfSA6IF9nbG9iYWwkY29tbW9uO1xuXG4gIC8vIHRoZSBmaXJzdCBzY3JpcHQgdGFnIGhlcmUgaXMgdG8gcHJveHkgalF1ZXJ5XG4gIC8vIFdlIHVzZSB0aGUgc2FtZSBqUXVlcnkgb24gdGhlIG1haW4gd2luZG93IGJ1dCB3ZSBjaGFuZ2UgdGhlXG4gIC8vIGNvbnRleHQgdG8gdGhhdCBvZiB0aGUgaWZyYW1lLlxuXG4gIHZhciBsaWJyYXJ5SW5jbHVkZXMgPSAnXFxuPHNjcmlwdD5cXG4gIHdpbmRvdy5sb29wUHJvdGVjdCA9IHBhcmVudC5sb29wUHJvdGVjdDtcXG4gIHdpbmRvdy5fX2VyciA9IG51bGw7XFxuICB3aW5kb3cubG9vcFByb3RlY3QuaGl0ID0gZnVuY3Rpb24obGluZSkge1xcbiAgICB3aW5kb3cuX19lcnIgPSBuZXcgRXJyb3IoXFxuICAgICAgXFwnUG90ZW50aWFsIGluZmluaXRlIGxvb3AgYXQgbGluZSBcXCcgK1xcbiAgICAgIGxpbmUgK1xcbiAgICAgIFxcJy4gVG8gZGlzYWJsZSBsb29wIHByb3RlY3Rpb24sIHdyaXRlOlxcJyArXFxuICAgICAgXFwnIFxcXFxuXFxcXC9cXFxcLyBub3Byb3RlY3RcXFxcbmFzIHRoZSBmaXJzdFxcJyArXFxuICAgICAgXFwnIGxpbmUuIEJld2FyZSB0aGF0IGlmIHlvdSBkbyBoYXZlIGFuIGluZmluaXRlIGxvb3AgaW4geW91ciBjb2RlXFwnICtcXG4gICAgICBcXCcgdGhpcyB3aWxsIGNyYXNoIHlvdXIgYnJvd3Nlci5cXCdcXG4gICAgKTtcXG4gIH07XFxuPC9zY3JpcHQ+XFxuPGxpbmtcXG4gIHJlbD1cXCdzdHlsZXNoZWV0XFwnXFxuICBocmVmPVxcJy8vY2RuLmJvb3Rjc3MuY29tL2FuaW1hdGUuY3NzLzMuMi4wL2FuaW1hdGUubWluLmNzc1xcJ1xcbiAgLz5cXG48bGlua1xcbiAgcmVsPVxcJ3N0eWxlc2hlZXRcXCdcXG4gIGhyZWY9XFwnLy9jZG4uYm9vdGNzcy5jb20vYm9vdHN0cmFwLzMuMy4xL2Nzcy9ib290c3RyYXAubWluLmNzc1xcJ1xcbiAgLz5cXG5cXG48bGlua1xcbiAgcmVsPVxcJ3N0eWxlc2hlZXRcXCdcXG4gIGhyZWY9XFwnLy9jZG4uYm9vdGNzcy5jb20vZm9udC1hd2Vzb21lLzQuMi4wL2Nzcy9mb250LWF3ZXNvbWUubWluLmNzc1xcJ1xcbiAgLz5cXG48c3R5bGU+XFxuICBib2R5IHsgcGFkZGluZzogMHB4IDNweCAwcHggM3B4OyB9XFxuPC9zdHlsZT5cXG4gICc7XG4gIHZhciBjb2RlRGlzYWJsZWRFcnJvciA9ICdcXG4gICAgPHNjcmlwdD5cXG4gICAgICB3aW5kb3cuX19lcnIgPSBuZXcgRXJyb3IoXFwnY29kZSBoYXMgYmVlbiBkaXNhYmxlZFxcJyk7XFxuICAgIDwvc2NyaXB0PlxcbiAgJztcblxuICB2YXIgaUZyYW1lU2NyaXB0JCA9IGNvbW1vbi5nZXRTY3JpcHRDb250ZW50JCgnL2pzL2lGcmFtZVNjcmlwdHMuanMnKS5zaGFyZVJlcGxheSgpO1xuICB2YXIgalF1ZXJ5U2NyaXB0JCA9IGNvbW1vbi5nZXRTY3JpcHRDb250ZW50JCgnL2Jvd2VyX2NvbXBvbmVudHMvanF1ZXJ5L2Rpc3QvanF1ZXJ5LmpzJykuc2hhcmVSZXBsYXkoKTtcblxuICAvLyBiZWhhdmlvciBzdWJqZWN0IGFsbHdheXMgcmVtZW1iZXJzIHRoZSBsYXN0IHZhbHVlXG4gIC8vIHdlIHVzZSB0aGlzIHRvIGRldGVybWluZSBpZiBydW5QcmV2aWV3VGVzdCQgaXMgZGVmaW5lZFxuICAvLyBhbmQgcHJpbWUgaXQgd2l0aCBmYWxzZVxuICBjb21tb24ucHJldmlld1JlYWR5JCA9IG5ldyBCZWhhdmlvclN1YmplY3QoZmFsc2UpO1xuXG4gIC8vIFRoZXNlIHNob3VsZCBiZSBzZXQgdXAgaW4gdGhlIHByZXZpZXcgd2luZG93XG4gIC8vIGlmIHRoaXMgZXJyb3IgaXMgc2VlbiBpdCBpcyBiZWNhdXNlIHRoZSBmdW5jdGlvbiB0cmllZCB0byBydW5cbiAgLy8gYmVmb3JlIHRoZSBpZnJhbWUgaGFzIGNvbXBsZXRlbHkgbG9hZGVkXG4gIGNvbW1vbi5ydW5QcmV2aWV3VGVzdHMkID0gY29tbW9uLmNoZWNrUHJldmlldyQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIE9ic2VydmFibGUudGhyb3cobmV3IEVycm9yKCdQcmV2aWV3IG5vdCBmdWxseSBsb2FkZWQnKSk7XG4gIH07XG5cbiAgY29tbW9uLnVwZGF0ZVByZXZpZXckID0gZnVuY3Rpb24gdXBkYXRlUHJldmlldyQoKSB7XG4gICAgdmFyIGNvZGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuXG4gICAgdmFyIHByZXZpZXcgPSBjb21tb24uZ2V0SWZyYW1lKCdwcmV2aWV3Jyk7XG5cbiAgICByZXR1cm4gT2JzZXJ2YWJsZS5jb21iaW5lTGF0ZXN0KGlGcmFtZVNjcmlwdCQsIGpRdWVyeVNjcmlwdCQsIGZ1bmN0aW9uIChpZnJhbWUsIGpRdWVyeSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWZyYW1lU2NyaXB0OiAnPHNjcmlwdD4nICsgaWZyYW1lICsgJzwvc2NyaXB0PicsXG4gICAgICAgIGpRdWVyeTogJzxzY3JpcHQ+JyArIGpRdWVyeSArICc8L3NjcmlwdD4nXG4gICAgICB9O1xuICAgIH0pLmZpcnN0KCkuZmxhdE1hcChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIGlmcmFtZVNjcmlwdCA9IF9yZWYuaWZyYW1lU2NyaXB0LFxuICAgICAgICAgIGpRdWVyeSA9IF9yZWYualF1ZXJ5O1xuXG4gICAgICAvLyB3ZSBtYWtlIHN1cmUgdG8gb3ZlcnJpZGUgdGhlIGxhc3QgdmFsdWUgaW4gdGhlXG4gICAgICAvLyBzdWJqZWN0IHRvIGZhbHNlIGhlcmUuXG4gICAgICBjb21tb24ucHJldmlld1JlYWR5JC5vbk5leHQoZmFsc2UpO1xuICAgICAgcHJldmlldy5vcGVuKCk7XG4gICAgICBwcmV2aWV3LndyaXRlKGxpYnJhcnlJbmNsdWRlcyArIGpRdWVyeSArIChjb21tb24uc2hvdWxkUnVuKCkgPyBjb2RlIDogY29kZURpc2FibGVkRXJyb3IpICsgJzwhLS0gLS0+JyArIGlmcmFtZVNjcmlwdCk7XG4gICAgICBwcmV2aWV3LmNsb3NlKCk7XG4gICAgICAvLyBub3cgd2UgZmlsdGVyIGZhbHNlIHZhbHVlcyBhbmQgd2FpdCBmb3IgdGhlIGZpcnN0IHRydWVcbiAgICAgIHJldHVybiBjb21tb24ucHJldmlld1JlYWR5JC5maWx0ZXIoZnVuY3Rpb24gKHJlYWR5KSB7XG4gICAgICAgIHJldHVybiByZWFkeTtcbiAgICAgIH0pLmZpcnN0KClcbiAgICAgIC8vIHRoZSBkZWxheSBoZXJlIGlzIHRvIGdpdmUgY29kZSB3aXRoaW4gdGhlIGlmcmFtZVxuICAgICAgLy8gY29udHJvbCB0byBydW5cbiAgICAgIC5kZWxheSg0MDApO1xuICAgIH0pLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY29kZTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gY29tbW9uO1xufSh3aW5kb3cpOyIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgdmFyIF9nbG9iYWwkUnggPSBnbG9iYWwuUngsXG4gICAgICBTdWJqZWN0ID0gX2dsb2JhbCRSeC5TdWJqZWN0LFxuICAgICAgT2JzZXJ2YWJsZSA9IF9nbG9iYWwkUnguT2JzZXJ2YWJsZSxcbiAgICAgIENvZGVNaXJyb3IgPSBnbG9iYWwuQ29kZU1pcnJvcixcbiAgICAgIGVtbWV0Q29kZU1pcnJvciA9IGdsb2JhbC5lbW1ldENvZGVNaXJyb3IsXG4gICAgICBfZ2xvYmFsJGNvbW1vbiA9IGdsb2JhbC5jb21tb24sXG4gICAgICBjb21tb24gPSBfZ2xvYmFsJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX2dsb2JhbCRjb21tb247XG4gIHZhciBfY29tbW9uJGNoYWxsZW5nZVR5cGUgPSBjb21tb24uY2hhbGxlbmdlVHlwZSxcbiAgICAgIGNoYWxsZW5nZVR5cGUgPSBfY29tbW9uJGNoYWxsZW5nZVR5cGUgPT09IHVuZGVmaW5lZCA/ICcwJyA6IF9jb21tb24kY2hhbGxlbmdlVHlwZSxcbiAgICAgIGNoYWxsZW5nZVR5cGVzID0gY29tbW9uLmNoYWxsZW5nZVR5cGVzO1xuXG5cbiAgaWYgKCFDb2RlTWlycm9yIHx8IGNoYWxsZW5nZVR5cGUgPT09IGNoYWxsZW5nZVR5cGVzLkJBU0VKVU1QIHx8IGNoYWxsZW5nZVR5cGUgPT09IGNoYWxsZW5nZVR5cGVzLlpJUExJTkUgfHwgY2hhbGxlbmdlVHlwZSA9PT0gY2hhbGxlbmdlVHlwZXMuVklERU8gfHwgY2hhbGxlbmdlVHlwZSA9PT0gY2hhbGxlbmdlVHlwZXMuU1RFUCB8fCBjaGFsbGVuZ2VUeXBlID09PSBjaGFsbGVuZ2VUeXBlcy5ISUtFUykge1xuICAgIGNvbW1vbi5lZGl0b3IgPSB7fTtcbiAgICByZXR1cm4gY29tbW9uO1xuICB9XG5cbiAgdmFyIGVkaXRvciA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlRWRpdG9yJyksIHtcbiAgICBsaW50OiB0cnVlLFxuICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgIG1vZGU6ICdqYXZhc2NyaXB0JyxcbiAgICB0aGVtZTogJ21vbm9rYWknLFxuICAgIHJ1bm5hYmxlOiB0cnVlLFxuICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgYXV0b0Nsb3NlQnJhY2tldHM6IHRydWUsXG4gICAgc2Nyb2xsYmFyU3R5bGU6ICdudWxsJyxcbiAgICBsaW5lV3JhcHBpbmc6IHRydWUsXG4gICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddXG4gIH0pO1xuXG4gIGVkaXRvci5zZXRTaXplKCcxMDAlJywgJ2F1dG8nKTtcblxuICBjb21tb24uZWRpdG9yRXhlY3V0ZSQgPSBuZXcgU3ViamVjdCgpO1xuICBjb21tb24uZWRpdG9yS2V5VXAkID0gT2JzZXJ2YWJsZS5mcm9tRXZlbnRQYXR0ZXJuKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgcmV0dXJuIGVkaXRvci5vbigna2V5dXAnLCBoYW5kbGVyKTtcbiAgfSwgZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICByZXR1cm4gZWRpdG9yLm9mZigna2V5dXAnLCBoYW5kbGVyKTtcbiAgfSk7XG5cbiAgZWRpdG9yLnNldE9wdGlvbignZXh0cmFLZXlzJywge1xuICAgIFRhYjogZnVuY3Rpb24gVGFiKGNtKSB7XG4gICAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgICBjbS5pbmRlbnRTZWxlY3Rpb24oJ2FkZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNwYWNlcyA9IEFycmF5KGNtLmdldE9wdGlvbignaW5kZW50VW5pdCcpICsgMSkuam9pbignICcpO1xuICAgICAgICBjbS5yZXBsYWNlU2VsZWN0aW9uKHNwYWNlcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICAnU2hpZnQtVGFiJzogZnVuY3Rpb24gU2hpZnRUYWIoY20pIHtcbiAgICAgIGlmIChjbS5zb21ldGhpbmdTZWxlY3RlZCgpKSB7XG4gICAgICAgIGNtLmluZGVudFNlbGVjdGlvbignc3VidHJhY3QnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzcGFjZXMgPSBBcnJheShjbS5nZXRPcHRpb24oJ2luZGVudFVuaXQnKSArIDEpLmpvaW4oJyAnKTtcbiAgICAgICAgY20ucmVwbGFjZVNlbGVjdGlvbihzcGFjZXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ0N0cmwtRW50ZXInOiBmdW5jdGlvbiBDdHJsRW50ZXIoKSB7XG4gICAgICBjb21tb24uZWRpdG9yRXhlY3V0ZSQub25OZXh0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICAnQ21kLUVudGVyJzogZnVuY3Rpb24gQ21kRW50ZXIoKSB7XG4gICAgICBjb21tb24uZWRpdG9yRXhlY3V0ZSQub25OZXh0KCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICB2YXIgaW5mbyA9IGVkaXRvci5nZXRTY3JvbGxJbmZvKCk7XG5cbiAgdmFyIGFmdGVyID0gZWRpdG9yLmNoYXJDb29yZHMoe1xuICAgIGxpbmU6IGVkaXRvci5nZXRDdXJzb3IoKS5saW5lICsgMSxcbiAgICBjaDogMFxuICB9LCAnbG9jYWwnKS50b3A7XG5cbiAgaWYgKGluZm8udG9wICsgaW5mby5jbGllbnRIZWlnaHQgPCBhZnRlcikge1xuICAgIGVkaXRvci5zY3JvbGxUbyhudWxsLCBhZnRlciAtIGluZm8uY2xpZW50SGVpZ2h0ICsgMyk7XG4gIH1cblxuICBpZiAoZW1tZXRDb2RlTWlycm9yKSB7XG4gICAgZW1tZXRDb2RlTWlycm9yKGVkaXRvciwge1xuICAgICAgJ0NtZC1FJzogJ2VtbWV0LmV4cGFuZF9hYmJyZXZpYXRpb24nLFxuICAgICAgVGFiOiAnZW1tZXQuZXhwYW5kX2FiYnJldmlhdGlvbl93aXRoX3RhYicsXG4gICAgICBFbnRlcjogJ2VtbWV0Lmluc2VydF9mb3JtYXR0ZWRfbGluZV9icmVha19vbmx5J1xuICAgIH0pO1xuICB9XG4gIGNvbW1vbi5pbml0LnB1c2goZnVuY3Rpb24gKCkge1xuICAgIHZhciBlZGl0b3JWYWx1ZSA9IHZvaWQgMDtcbiAgICBpZiAoY29tbW9uLmNvZGVVcmkuaXNBbGl2ZSgpKSB7XG4gICAgICBlZGl0b3JWYWx1ZSA9IGNvbW1vbi5jb2RlVXJpLnBhcnNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVkaXRvclZhbHVlID0gY29tbW9uLmNvZGVTdG9yYWdlLmlzQWxpdmUoY29tbW9uLmNoYWxsZW5nZU5hbWUpID8gY29tbW9uLmNvZGVTdG9yYWdlLmdldFN0b3JlZFZhbHVlKGNvbW1vbi5jaGFsbGVuZ2VOYW1lKSA6IGNvbW1vbi5zZWVkO1xuICAgIH1cblxuICAgIGVkaXRvci5zZXRWYWx1ZShjb21tb24ucmVwbGFjZVNhZmVUYWdzKGVkaXRvclZhbHVlKSk7XG4gICAgZWRpdG9yLnJlZnJlc2goKTtcbiAgfSk7XG5cbiAgY29tbW9uLmVkaXRvciA9IGVkaXRvcjtcblxuICByZXR1cm4gY29tbW9uO1xufSh3aW5kb3cpOyIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgdmFyIE9ic2VydmFibGUgPSBnbG9iYWwuUnguT2JzZXJ2YWJsZSxcbiAgICAgIF9nbG9iYWwkY29tbW9uID0gZ2xvYmFsLmNvbW1vbixcbiAgICAgIGNvbW1vbiA9IF9nbG9iYWwkY29tbW9uID09PSB1bmRlZmluZWQgPyB7IGluaXQ6IFtdIH0gOiBfZ2xvYmFsJGNvbW1vbjtcblxuXG4gIHZhciBkZXRlY3RGdW5jdGlvbkNhbGwgPSAvZnVuY3Rpb25cXHMqP1xcKHxmdW5jdGlvblxccytcXHcrXFxzKj9cXCgvZ2k7XG4gIHZhciBkZXRlY3RVbnNhZmVKUSA9IC9cXCRcXHMqP1xcKFxccyo/XFwkXFxzKj9cXCkvZ2k7XG4gIHZhciBkZXRlY3RVbnNhZmVDb25zb2xlQ2FsbCA9IC9pZlxcc1xcKG51bGxcXClcXHNjb25zb2xlXFwubG9nXFwoMVxcKTsvZ2k7XG5cbiAgY29tbW9uLmRldGVjdFVuc2FmZUNvZGUkID0gZnVuY3Rpb24gZGV0ZWN0VW5zYWZlQ29kZSQoY29kZSkge1xuICAgIHZhciBvcGVuaW5nQ29tbWVudHMgPSBjb2RlLm1hdGNoKC9cXC9cXCovZ2kpO1xuICAgIHZhciBjbG9zaW5nQ29tbWVudHMgPSBjb2RlLm1hdGNoKC9cXCpcXC8vZ2kpO1xuXG4gICAgLy8gY2hlY2tzIGlmIHRoZSBudW1iZXIgb2Ygb3BlbmluZyBjb21tZW50cygvKikgbWF0Y2hlcyB0aGUgbnVtYmVyIG9mXG4gICAgLy8gY2xvc2luZyBjb21tZW50cygqLylcbiAgICBpZiAob3BlbmluZ0NvbW1lbnRzICYmICghY2xvc2luZ0NvbW1lbnRzIHx8IG9wZW5pbmdDb21tZW50cy5sZW5ndGggPiBjbG9zaW5nQ29tbWVudHMubGVuZ3RoKSkge1xuXG4gICAgICByZXR1cm4gT2JzZXJ2YWJsZS50aHJvdyhuZXcgRXJyb3IoJ1N5bnRheEVycm9yOiBVbmZpbmlzaGVkIG11bHRpLWxpbmUgY29tbWVudCcpKTtcbiAgICB9XG5cbiAgICBpZiAoY29kZS5tYXRjaChkZXRlY3RVbnNhZmVKUSkpIHtcbiAgICAgIHJldHVybiBPYnNlcnZhYmxlLnRocm93KG5ldyBFcnJvcignVW5zYWZlICQoJCknKSk7XG4gICAgfVxuXG4gICAgaWYgKGNvZGUubWF0Y2goL2Z1bmN0aW9uL2cpICYmICFjb2RlLm1hdGNoKGRldGVjdEZ1bmN0aW9uQ2FsbCkpIHtcbiAgICAgIHJldHVybiBPYnNlcnZhYmxlLnRocm93KG5ldyBFcnJvcignU3ludGF4RXJyb3I6IFVuc2FmZSBvciB1bmZpbmlzaGVkIGZ1bmN0aW9uIGRlY2xhcmF0aW9uJykpO1xuICAgIH1cblxuICAgIGlmIChjb2RlLm1hdGNoKGRldGVjdFVuc2FmZUNvbnNvbGVDYWxsKSkge1xuICAgICAgcmV0dXJuIE9ic2VydmFibGUudGhyb3cobmV3IEVycm9yKCdJbnZhbGlkIGlmIChudWxsKSBjb25zb2xlLmxvZygxKTsgZGV0ZWN0ZWQnKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIE9ic2VydmFibGUuanVzdChjb2RlKTtcbiAgfTtcblxuICByZXR1cm4gY29tbW9uO1xufSh3aW5kb3cpOyIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChfcmVmKSB7XG4gIHZhciAkID0gX3JlZi4kLFxuICAgICAgX3JlZiRjb21tb24gPSBfcmVmLmNvbW1vbixcbiAgICAgIGNvbW1vbiA9IF9yZWYkY29tbW9uID09PSB1bmRlZmluZWQgPyB7IGluaXQ6IFtdIH0gOiBfcmVmJGNvbW1vbjtcblxuXG4gIGNvbW1vbi5kaXNwbGF5VGVzdFJlc3VsdHMgPSBmdW5jdGlvbiBkaXNwbGF5VGVzdFJlc3VsdHMoKSB7XG4gICAgdmFyIGRhdGEgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFtdO1xuXG4gICAgJCgnI3Rlc3RTdWl0ZScpLmNoaWxkcmVuKCkucmVtb3ZlKCk7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChfcmVmMikge1xuICAgICAgdmFyIF9yZWYyJGVyciA9IF9yZWYyLmVycixcbiAgICAgICAgICBlcnIgPSBfcmVmMiRlcnIgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZjIkZXJyLFxuICAgICAgICAgIF9yZWYyJHRleHQgPSBfcmVmMi50ZXh0LFxuICAgICAgICAgIHRleHQgPSBfcmVmMiR0ZXh0ID09PSB1bmRlZmluZWQgPyAnJyA6IF9yZWYyJHRleHQ7XG5cbiAgICAgIHZhciBpY29uQ2xhc3MgPSBlcnIgPyAnXCJpb24tY2xvc2UtY2lyY2xlZCBiaWctZXJyb3ItaWNvblwiJyA6ICdcImlvbi1jaGVja21hcmstY2lyY2xlZCBiaWctc3VjY2Vzcy1pY29uXCInO1xuXG4gICAgICAkKCc8ZGl2PjwvZGl2PicpLmh0bWwoJ1xcbiAgICAgICAgPGRpdiBjbGFzcz1cXCdyb3dcXCc+XFxuICAgICAgICAgIDxkaXYgY2xhc3M9XFwnY29sLXhzLTIgdGV4dC1jZW50ZXJcXCc+XFxuICAgICAgICAgICAgPGkgY2xhc3M9JyArIGljb25DbGFzcyArICc+PC9pPlxcbiAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgPGRpdiBjbGFzcz1cXCdjb2wteHMtMTAgdGVzdC1vdXRwdXRcXCc+XFxuICAgICAgICAgICAgJyArIHRleHQuc3BsaXQoJ21lc3NhZ2U6ICcpLnBvcCgpLnJlcGxhY2UoL1xcJ1xcKTsvZywgJycpICsgJ1xcbiAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgPGRpdiBjbGFzcz1cXCd0ZW4tcGl4ZWwtYnJlYWtcXCcvPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgJykuYXBwZW5kVG8oJCgnI3Rlc3RTdWl0ZScpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIHJldHVybiBjb21tb247XG59KHdpbmRvdyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cuY29tbW9uID0gZnVuY3Rpb24gKGdsb2JhbCkge1xuICB2YXIgZ2EgPSBnbG9iYWwuZ2EsXG4gICAgICBfZ2xvYmFsJGNvbW1vbiA9IGdsb2JhbC5jb21tb24sXG4gICAgICBjb21tb24gPSBfZ2xvYmFsJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX2dsb2JhbCRjb21tb247XG4gIHZhciBhZGRMb29wUHJvdGVjdCA9IGNvbW1vbi5hZGRMb29wUHJvdGVjdCxcbiAgICAgIGdldEpzRnJvbUh0bWwgPSBjb21tb24uZ2V0SnNGcm9tSHRtbCxcbiAgICAgIGRldGVjdFVuc2FmZUNvZGUkID0gY29tbW9uLmRldGVjdFVuc2FmZUNvZGUkLFxuICAgICAgdXBkYXRlUHJldmlldyQgPSBjb21tb24udXBkYXRlUHJldmlldyQsXG4gICAgICBjaGFsbGVuZ2VUeXBlID0gY29tbW9uLmNoYWxsZW5nZVR5cGUsXG4gICAgICBjaGFsbGVuZ2VUeXBlcyA9IGNvbW1vbi5jaGFsbGVuZ2VUeXBlcztcblxuXG4gIGNvbW1vbi5leGVjdXRlQ2hhbGxlbmdlJCA9IGZ1bmN0aW9uIGV4ZWN1dGVDaGFsbGVuZ2UkKCkge1xuICAgIHZhciBjb2RlID0gY29tbW9uLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIHZhciBvcmlnaW5hbENvZGUgPSBjb2RlO1xuICAgIHZhciBoZWFkID0gY29tbW9uLmFycmF5VG9OZXdMaW5lU3RyaW5nKGNvbW1vbi5oZWFkKTtcbiAgICB2YXIgdGFpbCA9IGNvbW1vbi5hcnJheVRvTmV3TGluZVN0cmluZyhjb21tb24udGFpbCk7XG4gICAgdmFyIGNvbWJpbmVkQ29kZSA9IGhlYWQgKyBjb2RlICsgdGFpbDtcblxuICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgJ0NoYWxsZW5nZScsICdyYW4tY29kZScsIGNvbW1vbi5nYU5hbWUpO1xuXG4gICAgLy8gcnVuIGNoZWNrcyBmb3IgdW5zYWZlIGNvZGVcbiAgICByZXR1cm4gZGV0ZWN0VW5zYWZlQ29kZSQoY29kZSlcbiAgICAvLyBhZGQgaGVhZCBhbmQgdGFpbCBhbmQgZGV0ZWN0IGxvb3BzXG4gICAgLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY2hhbGxlbmdlVHlwZSAhPT0gY2hhbGxlbmdlVHlwZXMuSFRNTCkge1xuICAgICAgICByZXR1cm4gJzxzY3JpcHQ+OycgKyBhZGRMb29wUHJvdGVjdChjb21iaW5lZENvZGUpICsgJy8qKi88L3NjcmlwdD4nO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYWRkTG9vcFByb3RlY3QoY29tYmluZWRDb2RlKTtcbiAgICB9KS5mbGF0TWFwKGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICByZXR1cm4gdXBkYXRlUHJldmlldyQoY29kZSk7XG4gICAgfSkuZmxhdE1hcChmdW5jdGlvbiAoY29kZSkge1xuICAgICAgdmFyIG91dHB1dCA9IHZvaWQgMDtcblxuICAgICAgaWYgKGNoYWxsZW5nZVR5cGUgPT09IGNoYWxsZW5nZVR5cGVzLkhUTUwgJiYgY29tbW9uLmhhc0pzKGNvZGUpKSB7XG4gICAgICAgIG91dHB1dCA9IGNvbW1vbi5nZXRKc091dHB1dChnZXRKc0Zyb21IdG1sKGNvZGUpKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hhbGxlbmdlVHlwZSAhPT0gY2hhbGxlbmdlVHlwZXMuSFRNTCkge1xuICAgICAgICBvdXRwdXQgPSBjb21tb24uZ2V0SnNPdXRwdXQoYWRkTG9vcFByb3RlY3QoY29tYmluZWRDb2RlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21tb24ucnVuUHJldmlld1Rlc3RzJCh7XG4gICAgICAgIHRlc3RzOiBjb21tb24udGVzdHMuc2xpY2UoKSxcbiAgICAgICAgb3JpZ2luYWxDb2RlOiBvcmlnaW5hbENvZGUsXG4gICAgICAgIG91dHB1dDogb3V0cHV0XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gY29tbW9uO1xufSh3aW5kb3cpOyIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgdmFyIENvZGVNaXJyb3IgPSBnbG9iYWwuQ29kZU1pcnJvcixcbiAgICAgIGRvYyA9IGdsb2JhbC5kb2N1bWVudCxcbiAgICAgIF9nbG9iYWwkY29tbW9uID0gZ2xvYmFsLmNvbW1vbixcbiAgICAgIGNvbW1vbiA9IF9nbG9iYWwkY29tbW9uID09PSB1bmRlZmluZWQgPyB7IGluaXQ6IFtdIH0gOiBfZ2xvYmFsJGNvbW1vbjtcbiAgdmFyIGNoYWxsZW5nZVR5cGVzID0gY29tbW9uLmNoYWxsZW5nZVR5cGVzLFxuICAgICAgX2NvbW1vbiRjaGFsbGVuZ2VUeXBlID0gY29tbW9uLmNoYWxsZW5nZVR5cGUsXG4gICAgICBjaGFsbGVuZ2VUeXBlID0gX2NvbW1vbiRjaGFsbGVuZ2VUeXBlID09PSB1bmRlZmluZWQgPyAnMCcgOiBfY29tbW9uJGNoYWxsZW5nZVR5cGU7XG5cblxuICBpZiAoIUNvZGVNaXJyb3IgfHwgY2hhbGxlbmdlVHlwZSAhPT0gY2hhbGxlbmdlVHlwZXMuSlMgJiYgY2hhbGxlbmdlVHlwZSAhPT0gY2hhbGxlbmdlVHlwZXMuQk9ORklSRSkge1xuICAgIGNvbW1vbi51cGRhdGVPdXRwdXREaXNwbGF5ID0gZnVuY3Rpb24gKCkge307XG4gICAgY29tbW9uLmFwcGVuZFRvT3V0cHV0RGlzcGxheSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIHJldHVybiBjb21tb247XG4gIH1cblxuICB2YXIgY29kZU91dHB1dCA9IENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKGRvYy5nZXRFbGVtZW50QnlJZCgnY29kZU91dHB1dCcpLCB7XG4gICAgbGluZU51bWJlcnM6IGZhbHNlLFxuICAgIG1vZGU6ICd0ZXh0JyxcbiAgICB0aGVtZTogJ21vbm9rYWknLFxuICAgIHJlYWRPbmx5OiAnbm9jdXJzb3InLFxuICAgIGxpbmVXcmFwcGluZzogdHJ1ZVxuICB9KTtcblxuICBjb2RlT3V0cHV0LnNldFZhbHVlKCcvKipcXG4gICogWW91ciBvdXRwdXQgd2lsbCBnbyBoZXJlLlxcbiAgKiBBbnkgY29uc29sZS5sb2coKSAtdHlwZVxcbiAgKiBzdGF0ZW1lbnRzIHdpbGwgYXBwZWFyIGluXFxuICAqIHlvdXIgYnJvd3NlclxcJ3MgRGV2VG9vbHNcXG4gICogSmF2YVNjcmlwdCBjb25zb2xlLlxcbiAgKi8nKTtcblxuICBjb2RlT3V0cHV0LnNldFNpemUoJzEwMCUnLCAnMTAwJScpO1xuXG4gIGNvbW1vbi51cGRhdGVPdXRwdXREaXNwbGF5ID0gZnVuY3Rpb24gdXBkYXRlT3V0cHV0RGlzcGxheSgpIHtcbiAgICB2YXIgc3RyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcblxuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgc3RyID0gSlNPTi5zdHJpbmdpZnkoc3RyKTtcbiAgICB9XG4gICAgY29kZU91dHB1dC5zZXRWYWx1ZShzdHIpO1xuICAgIHJldHVybiBzdHI7XG4gIH07XG5cbiAgY29tbW9uLmFwcGVuZFRvT3V0cHV0RGlzcGxheSA9IGZ1bmN0aW9uIGFwcGVuZFRvT3V0cHV0RGlzcGxheSgpIHtcbiAgICB2YXIgc3RyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcblxuICAgIGNvZGVPdXRwdXQuc2V0VmFsdWUoY29kZU91dHB1dC5nZXRWYWx1ZSgpICsgc3RyKTtcbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHJldHVybiBjb21tb247XG59KHdpbmRvdyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cuY29tbW9uID0gZnVuY3Rpb24gKF9yZWYpIHtcbiAgdmFyIF9yZWYkY29tbW9uID0gX3JlZi5jb21tb24sXG4gICAgICBjb21tb24gPSBfcmVmJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX3JlZiRjb21tb247XG5cblxuICBjb21tb24ubG9ja1RvcCA9IGZ1bmN0aW9uIGxvY2tUb3AoKSB7XG4gICAgdmFyIG1hZ2lWYWw7XG5cbiAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPj0gOTkwKSB7XG4gICAgICBpZiAoJCgnLmVkaXRvclNjcm9sbERpdicpLmh0bWwoKSkge1xuXG4gICAgICAgIG1hZ2lWYWwgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKCcubmF2YmFyJykuaGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKG1hZ2lWYWwgPCAwKSB7XG4gICAgICAgICAgbWFnaVZhbCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgJCgnLmVkaXRvclNjcm9sbERpdicpLmNzcygnaGVpZ2h0JywgbWFnaVZhbCAtIDUwICsgJ3B4Jyk7XG4gICAgICB9XG5cbiAgICAgIG1hZ2lWYWwgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKCcubmF2YmFyJykuaGVpZ2h0KCk7XG5cbiAgICAgIGlmIChtYWdpVmFsIDwgMCkge1xuICAgICAgICBtYWdpVmFsID0gMDtcbiAgICAgIH1cblxuICAgICAgJCgnLnNjcm9sbC1sb2NrZXInKS5jc3MoJ21pbi1oZWlnaHQnLCAkKCcuZWRpdG9yU2Nyb2xsRGl2JykuaGVpZ2h0KCkpLmNzcygnaGVpZ2h0JywgbWFnaVZhbCAtIDUwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCgnLmVkaXRvclNjcm9sbERpdicpLmNzcygnbWF4LWhlaWdodCcsIDUwMCArICdweCcpO1xuXG4gICAgICAkKCcuc2Nyb2xsLWxvY2tlcicpLmNzcygncG9zaXRpb24nLCAnaW5oZXJpdCcpLmNzcygndG9wJywgJ2luaGVyaXQnKS5jc3MoJ3dpZHRoJywgJzEwMCUnKS5jc3MoJ21heC1oZWlnaHQnLCAnMTAwJScpO1xuICAgIH1cbiAgfTtcblxuICBjb21tb24uaW5pdC5wdXNoKGZ1bmN0aW9uICgkKSB7XG4gICAgLy8gZmFrZWlwaG9uZSBwb3NpdGlvbmluZyBob3RmaXhcbiAgICBpZiAoJCgnLmlwaG9uZS1wb3NpdGlvbicpLmh0bWwoKSB8fCAkKCcuaXBob25lJykuaHRtbCgpKSB7XG4gICAgICB2YXIgc3RhcnRJcGhvbmVQb3NpdGlvbiA9IHBhcnNlSW50KCQoJy5pcGhvbmUtcG9zaXRpb24nKS5jc3MoJ3RvcCcpLnJlcGxhY2UoJ3B4JywgJycpLCAxMCk7XG5cbiAgICAgIHZhciBzdGFydElwaG9uZSA9IHBhcnNlSW50KCQoJy5pcGhvbmUnKS5jc3MoJ3RvcCcpLnJlcGxhY2UoJ3B4JywgJycpLCAxMCk7XG5cbiAgICAgICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY291cnNlSGVpZ2h0ID0gJCgnLmNvdXJzZXdhcmUtaGVpZ2h0JykuaGVpZ2h0KCk7XG4gICAgICAgIHZhciBjb3Vyc2VUb3AgPSAkKCcuY291cnNld2FyZS1oZWlnaHQnKS5vZmZzZXQoKS50b3A7XG4gICAgICAgIHZhciB3aW5kb3dTY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHZhciBwaG9uZUhlaWdodCA9ICQoJy5pcGhvbmUtcG9zaXRpb24nKS5oZWlnaHQoKTtcblxuICAgICAgICBpZiAoY291cnNlSGVpZ2h0ICsgY291cnNlVG9wIC0gd2luZG93U2Nyb2xsVG9wIC0gcGhvbmVIZWlnaHQgPD0gMCkge1xuICAgICAgICAgICQoJy5pcGhvbmUtcG9zaXRpb24nKS5jc3MoJ3RvcCcsIHN0YXJ0SXBob25lUG9zaXRpb24gKyBjb3Vyc2VIZWlnaHQgKyBjb3Vyc2VUb3AgLSB3aW5kb3dTY3JvbGxUb3AgLSBwaG9uZUhlaWdodCk7XG5cbiAgICAgICAgICAkKCcuaXBob25lJykuY3NzKCd0b3AnLCBzdGFydElwaG9uZVBvc2l0aW9uICsgY291cnNlSGVpZ2h0ICsgY291cnNlVG9wIC0gd2luZG93U2Nyb2xsVG9wIC0gcGhvbmVIZWlnaHQgKyAxMjApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoJy5pcGhvbmUtcG9zaXRpb24nKS5jc3MoJ3RvcCcsIHN0YXJ0SXBob25lUG9zaXRpb24pO1xuICAgICAgICAgICQoJy5pcGhvbmUnKS5jc3MoJ3RvcCcsIHN0YXJ0SXBob25lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCQoJy5zY3JvbGwtbG9ja2VyJykuaHRtbCgpKSB7XG5cbiAgICAgIGlmICgkKCcuc2Nyb2xsLWxvY2tlcicpLmh0bWwoKSkge1xuICAgICAgICBjb21tb24ubG9ja1RvcCgpO1xuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjb21tb24ubG9ja1RvcCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29tbW9uLmxvY2tUb3AoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBleGVjSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXG4gICAgICAvLyB3aHkgaXMgdGhpcyBub3QgJD8/P1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njcm9sbC1sb2NrZXInKS5hZGRFdmVudExpc3RlbmVyKCdwcmV2aWV3VXBkYXRlU3B5JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGV4ZWNJblByb2dyZXNzKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZXhlY0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCQoJCgnLnNjcm9sbC1sb2NrZXInKS5jaGlsZHJlbigpWzBdKS5oZWlnaHQoKSAtIDgwMCA+IGUuZGV0YWlsKSB7XG4gICAgICAgICAgICAkKCcuc2Nyb2xsLWxvY2tlcicpLnNjcm9sbFRvcChlLmRldGFpbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzY3JvbGxUb3AgPSAkKCQoJy5zY3JvbGwtbG9ja2VyJykuY2hpbGRyZW4oKVswXSkuaGVpZ2h0KCk7XG5cbiAgICAgICAgICAgICQoJy5zY3JvbGwtbG9ja2VyJykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogc2Nyb2xsVG9wIH0sIDE3NSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4ZWNJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIH0sIDc1MCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY29tbW9uO1xufSh3aW5kb3cpOyIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChfcmVmKSB7XG4gIHZhciBfcmVmJGNvbW1vbiA9IF9yZWYuY29tbW9uLFxuICAgICAgY29tbW9uID0gX3JlZiRjb21tb24gPT09IHVuZGVmaW5lZCA/IHsgaW5pdDogW10gfSA6IF9yZWYkY29tbW9uO1xuXG4gIGNvbW1vbi5pbml0LnB1c2goZnVuY3Rpb24gKCQpIHtcbiAgICAkKCcjcmVwb3J0LWlzc3VlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRleHRNZXNzYWdlID0gWydDaGFsbGVuZ2UgWycsIGNvbW1vbi5jaGFsbGVuZ2VOYW1lIHx8IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSwgJ10oJywgd2luZG93LmxvY2F0aW9uLmhyZWYsICcpIGhhcyBhbiBpc3N1ZS5cXG4nLCAnVXNlciBBZ2VudCBpczogPGNvZGU+JywgbmF2aWdhdG9yLnVzZXJBZ2VudCwgJzwvY29kZT4uXFxuJywgJ1BsZWFzZSBkZXNjcmliZSBob3cgdG8gcmVwcm9kdWNlIHRoaXMgaXNzdWUsIGFuZCBpbmNsdWRlICcsICdsaW5rcyB0byBzY3JlZW5zaG90cyBpZiBwb3NzaWJsZS5cXG5cXG4nXS5qb2luKCcnKTtcblxuICAgICAgaWYgKGNvbW1vbi5lZGl0b3IgJiYgdHlwZW9mIGNvbW1vbi5lZGl0b3IuZ2V0VmFsdWUgPT09ICdmdW5jdGlvbicgJiYgY29tbW9uLmVkaXRvci5nZXRWYWx1ZSgpLnRyaW0oKSkge1xuICAgICAgICB2YXIgdHlwZTtcbiAgICAgICAgc3dpdGNoIChjb21tb24uY2hhbGxlbmdlVHlwZSkge1xuICAgICAgICAgIGNhc2UgY29tbW9uLmNoYWxsZW5nZVR5cGVzLkhUTUw6XG4gICAgICAgICAgICB0eXBlID0gJ2h0bWwnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBjb21tb24uY2hhbGxlbmdlVHlwZXMuSlM6XG4gICAgICAgICAgY2FzZSBjb21tb24uY2hhbGxlbmdlVHlwZXMuQk9ORklSRTpcbiAgICAgICAgICAgIHR5cGUgPSAnamF2YXNjcmlwdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdHlwZSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dE1lc3NhZ2UgKz0gWydNeSBjb2RlOlxcbmBgYCcsIHR5cGUsICdcXG4nLCBjb21tb24uZWRpdG9yLmdldFZhbHVlKCksICdcXG5gYGBcXG5cXG4nXS5qb2luKCcnKTtcbiAgICAgIH1cblxuICAgICAgdGV4dE1lc3NhZ2UgPSBlbmNvZGVVUklDb21wb25lbnQodGV4dE1lc3NhZ2UpO1xuXG4gICAgICAkKCcjaXNzdWUtbW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgd2luZG93Lm9wZW4oJ2h0dHBzOi8vZ2l0aHViLmNvbS9mcmVlY29kZWNhbXBjaGluYS9mcmVlY29kZWNhbXAuY24vaXNzdWVzL25ldz8mYm9keT0nICsgdGV4dE1lc3NhZ2UsICdfYmxhbmsnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKG9iaiwga2V5cykgeyB2YXIgdGFyZ2V0ID0ge307IGZvciAodmFyIGkgaW4gb2JqKSB7IGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7IGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaSkpIGNvbnRpbnVlOyB0YXJnZXRbaV0gPSBvYmpbaV07IH0gcmV0dXJuIHRhcmdldDsgfVxuXG53aW5kb3cuY29tbW9uID0gZnVuY3Rpb24gKGdsb2JhbCkge1xuICB2YXIgT2JzZXJ2YWJsZSA9IGdsb2JhbC5SeC5PYnNlcnZhYmxlLFxuICAgICAgY2hhaSA9IGdsb2JhbC5jaGFpLFxuICAgICAgX2dsb2JhbCRjb21tb24gPSBnbG9iYWwuY29tbW9uLFxuICAgICAgY29tbW9uID0gX2dsb2JhbCRjb21tb24gPT09IHVuZGVmaW5lZCA/IHsgaW5pdDogW10gfSA6IF9nbG9iYWwkY29tbW9uO1xuXG5cbiAgY29tbW9uLnJ1blRlc3RzJCA9IGZ1bmN0aW9uIHJ1blRlc3RzJChfcmVmKSB7XG4gICAgdmFyIGNvZGUgPSBfcmVmLmNvZGUsXG4gICAgICAgIG9yaWdpbmFsQ29kZSA9IF9yZWYub3JpZ2luYWxDb2RlLFxuICAgICAgICB1c2VyVGVzdHMgPSBfcmVmLnVzZXJUZXN0cyxcbiAgICAgICAgcmVzdCA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVmLCBbXCJjb2RlXCIsIFwib3JpZ2luYWxDb2RlXCIsIFwidXNlclRlc3RzXCJdKTtcblxuICAgIHJldHVybiBPYnNlcnZhYmxlLmZyb20odXNlclRlc3RzKS5tYXAoZnVuY3Rpb24gKHRlc3QpIHtcblxuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICAgIHZhciBhc3NlcnQgPSBjaGFpLmFzc2VydDtcbiAgICAgIHZhciBlZGl0b3IgPSB7XG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDb2RlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAodGVzdCkge1xuICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWV2YWwgICovXG4gICAgICAgICAgZXZhbChjb21tb24ucmVhc3NlbWJsZVRlc3QoY29kZSwgdGVzdCkpO1xuICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRlc3QuZXJyID0gZS5tZXNzYWdlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGVzdDtcbiAgICB9KS50b0FycmF5KCkubWFwKGZ1bmN0aW9uICh0ZXN0cykge1xuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCByZXN0LCB7IHRlc3RzOiB0ZXN0cyB9KTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gY29tbW9uO1xufSh3aW5kb3cpOyIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LmNvbW1vbiA9IGZ1bmN0aW9uIChnbG9iYWwpIHtcbiAgdmFyICQgPSBnbG9iYWwuJCxcbiAgICAgIG1vbWVudCA9IGdsb2JhbC5tb21lbnQsXG4gICAgICBfZ2xvYmFsJGdhID0gZ2xvYmFsLmdhLFxuICAgICAgZ2EgPSBfZ2xvYmFsJGdhID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoKSB7fSA6IF9nbG9iYWwkZ2EsXG4gICAgICBfZ2xvYmFsJGNvbW1vbiA9IGdsb2JhbC5jb21tb24sXG4gICAgICBjb21tb24gPSBfZ2xvYmFsJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX2dsb2JhbCRjb21tb247XG5cblxuICBmdW5jdGlvbiBzdWJtaXRDaGFsbGVuZ2VIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc29sdXRpb24gPSBjb21tb24uZWRpdG9yLmdldFZhbHVlKCk7XG5cbiAgICAkKCcjc3VibWl0LWNoYWxsZW5nZScpLmF0dHIoJ2Rpc2FibGVkJywgJ3RydWUnKS5yZW1vdmVDbGFzcygnYnRuLXByaW1hcnknKS5hZGRDbGFzcygnYnRuLXdhcm5pbmcgZGlzYWJsZWQnKTtcblxuICAgIHZhciAkY2hlY2ttYXJrQ29udGFpbmVyID0gJCgnI2NoZWNrbWFyay1jb250YWluZXInKTtcbiAgICAkY2hlY2ttYXJrQ29udGFpbmVyLmNzcyh7IGhlaWdodDogJGNoZWNrbWFya0NvbnRhaW5lci5pbm5lckhlaWdodCgpIH0pO1xuXG4gICAgJCgnI2NoYWxsZW5nZS1jaGVja21hcmsnKS5hZGRDbGFzcygnem9vbU91dFVwJylcbiAgICAvLyAucmVtb3ZlQ2xhc3MoJ3pvb21JbkRvd24nKVxuICAgIC5kZWxheSgxMDAwKS5xdWV1ZShmdW5jdGlvbiAobmV4dCkge1xuICAgICAgJCh0aGlzKS5yZXBsYWNlV2l0aCgnPGRpdiBpZD1cImNoYWxsZW5nZS1zcGlubmVyXCIgJyArICdjbGFzcz1cImFuaW1hdGVkIHpvb21JblVwIGlubmVyLWNpcmNsZXMtbG9hZGVyXCI+JyArICdzdWJtaXR0aW5nLi4uPC9kaXY+Jyk7XG4gICAgICBuZXh0KCk7XG4gICAgfSk7XG5cbiAgICB2YXIgdGltZXpvbmUgPSAnVVRDJztcbiAgICB0cnkge1xuICAgICAgdGltZXpvbmUgPSBtb21lbnQudHouZ3Vlc3MoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gJ1xcbiAgICAgICAgICBrbm93biBidWcsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQtdGltZXpvbmUvaXNzdWVzLzI5NDpcXG4gICAgICAgICAgJyArIGVyci5tZXNzYWdlICsgJ1xcbiAgICAgICAgJztcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9XG4gICAgdmFyIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBpZDogY29tbW9uLmNoYWxsZW5nZUlkLFxuICAgICAgbmFtZTogY29tbW9uLmNoYWxsZW5nZU5hbWUsXG4gICAgICBjaGFsbGVuZ2VUeXBlOiArY29tbW9uLmNoYWxsZW5nZVR5cGUsXG4gICAgICBzb2x1dGlvbjogc29sdXRpb24sXG4gICAgICB0aW1lem9uZTogdGltZXpvbmVcbiAgICB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICB1cmw6ICcvY29tcGxldGVkLWNoYWxsZW5nZS8nLFxuICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgZGF0YTogZGF0YSxcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgfSkuc3VjY2VzcyhmdW5jdGlvbiAocmVzKSB7XG4gICAgICBpZiAocmVzKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvY2hhbGxlbmdlcy9uZXh0LWNoYWxsZW5nZT9pZD0nICsgY29tbW9uLmNoYWxsZW5nZUlkO1xuICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2Uod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgIH0pO1xuICB9XG5cbiAgY29tbW9uLnNob3dDb21wbGV0aW9uID0gZnVuY3Rpb24gc2hvd0NvbXBsZXRpb24oKSB7XG5cbiAgICBnYSgnc2VuZCcsICdldmVudCcsICdDaGFsbGVuZ2UnLCAnc29sdmVkJywgY29tbW9uLmdhTmFtZSwgdHJ1ZSk7XG5cbiAgICAkKCcjY29tcGxldGUtY291cnNld2FyZS1kaWFsb2cnKS5tb2RhbCgnc2hvdycpO1xuICAgICQoJyNjb21wbGV0ZS1jb3Vyc2V3YXJlLWRpYWxvZyAubW9kYWwtaGVhZGVyJykuY2xpY2soKTtcblxuICAgICQoJyNzdWJtaXQtY2hhbGxlbmdlJykub2ZmKCdjbGljaycpO1xuICAgICQoJyNzdWJtaXQtY2hhbGxlbmdlJykub24oJ2NsaWNrJywgc3VibWl0Q2hhbGxlbmdlSGFuZGxlcik7XG4gIH07XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5jb21tb24gPSBmdW5jdGlvbiAoX3JlZikge1xuICB2YXIgJCA9IF9yZWYuJCxcbiAgICAgIF9yZWYkY29tbW9uID0gX3JlZi5jb21tb24sXG4gICAgICBjb21tb24gPSBfcmVmJGNvbW1vbiA9PT0gdW5kZWZpbmVkID8geyBpbml0OiBbXSB9IDogX3JlZiRjb21tb247XG5cbiAgdmFyIHN0ZXBDbGFzcyA9ICcuY2hhbGxlbmdlLXN0ZXAnO1xuICB2YXIgcHJldkJ0bkNsYXNzID0gJy5jaGFsbGVuZ2Utc3RlcC1idG4tcHJldic7XG4gIHZhciBuZXh0QnRuQ2xhc3MgPSAnLmNoYWxsZW5nZS1zdGVwLWJ0bi1uZXh0JztcbiAgdmFyIGFjdGlvbkJ0bkNsYXNzID0gJy5jaGFsbGVuZ2Utc3RlcC1idG4tYWN0aW9uJztcbiAgdmFyIGZpbmlzaEJ0bkNsYXNzID0gJy5jaGFsbGVuZ2Utc3RlcC1idG4tZmluaXNoJztcbiAgdmFyIHN1Ym1pdEJ0bklkID0gJyNjaGFsbGVuZ2Utc3RlcC1idG4tc3VibWl0JztcbiAgdmFyIHN1Ym1pdE1vZGFsSWQgPSAnI2NoYWxsZW5nZS1zdGVwLW1vZGFsJztcblxuICBmdW5jdGlvbiBnZXRQcmV2aW91c1N0ZXAoJGNoYWxsZW5nZVN0ZXBzKSB7XG4gICAgdmFyICRwcmV2U3RlcCA9IGZhbHNlO1xuICAgIHZhciBwcmV2U3RlcEluZGV4ID0gMDtcbiAgICAkY2hhbGxlbmdlU3RlcHMuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHZhciAkc3RlcCA9ICQodGhpcyk7XG4gICAgICBpZiAoISRzdGVwLmhhc0NsYXNzKCdoaWRkZW4nKSkge1xuICAgICAgICBwcmV2U3RlcEluZGV4ID0gaW5kZXggLSAxO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHByZXZTdGVwID0gJGNoYWxsZW5nZVN0ZXBzW3ByZXZTdGVwSW5kZXhdO1xuXG4gICAgcmV0dXJuICRwcmV2U3RlcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5leHRTdGVwKCRjaGFsbGVuZ2VTdGVwcykge1xuICAgIHZhciBsZW5ndGggPSAkY2hhbGxlbmdlU3RlcHMubGVuZ3RoO1xuICAgIHZhciAkbmV4dFN0ZXAgPSBmYWxzZTtcbiAgICB2YXIgbmV4dFN0ZXBJbmRleCA9IDA7XG4gICAgJGNoYWxsZW5nZVN0ZXBzLmVhY2goZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB2YXIgJHN0ZXAgPSAkKHRoaXMpO1xuICAgICAgaWYgKCEkc3RlcC5oYXNDbGFzcygnaGlkZGVuJykgJiYgaW5kZXggKyAxICE9PSBsZW5ndGgpIHtcbiAgICAgICAgbmV4dFN0ZXBJbmRleCA9IGluZGV4ICsgMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRuZXh0U3RlcCA9ICRjaGFsbGVuZ2VTdGVwc1tuZXh0U3RlcEluZGV4XTtcblxuICAgIHJldHVybiAkbmV4dFN0ZXA7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQcmV2U3RlcENsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHByZXZTdGVwID0gZ2V0UHJldmlvdXNTdGVwKCQoc3RlcENsYXNzKSk7XG4gICAgJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnc2xpZGVJbkxlZnQgc2xpZGVJblJpZ2h0JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIGZhZGVPdXRSaWdodCBmYXN0LWFuaW1hdGlvbicpLmRlbGF5KDI1MCkucXVldWUoZnVuY3Rpb24gKHByZXYpIHtcbiAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgaWYgKHByZXZTdGVwKSB7XG4gICAgICAgICQocHJldlN0ZXApLnJlbW92ZUNsYXNzKCdoaWRkZW4nKS5yZW1vdmVDbGFzcygnZmFkZU91dExlZnQgZmFkZU91dFJpZ2h0JykuYWRkQ2xhc3MoJ2FuaW1hdGVkIHNsaWRlSW5MZWZ0IGZhc3QtYW5pbWF0aW9uJykuZGVsYXkoNTAwKS5xdWV1ZShmdW5jdGlvbiAocHJldikge1xuICAgICAgICAgIHByZXYoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBwcmV2KCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVOZXh0U3RlcENsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG5leHRTdGVwID0gZ2V0TmV4dFN0ZXAoJChzdGVwQ2xhc3MpKTtcbiAgICAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdzbGlkZUluUmlnaHQgc2xpZGVJbkxlZnQnKS5hZGRDbGFzcygnYW5pbWF0ZWQgZmFkZU91dExlZnQgZmFzdC1hbmltYXRpb24nKS5kZWxheSgyNTApLnF1ZXVlKGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAkKHRoaXMpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIGlmIChuZXh0U3RlcCkge1xuICAgICAgICAkKG5leHRTdGVwKS5yZW1vdmVDbGFzcygnaGlkZGVuJykucmVtb3ZlQ2xhc3MoJ2ZhZGVPdXRSaWdodCBmYWRlT3V0TGVmdCcpLmFkZENsYXNzKCdhbmltYXRlZCBzbGlkZUluUmlnaHQgZmFzdC1hbmltYXRpb24nKS5kZWxheSg1MDApLnF1ZXVlKGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIG5leHQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUFjdGlvbkNsaWNrKGUpIHtcbiAgICB2YXIgcHJvcHMgPSBjb21tb24uY2hhbGxlbmdlU2VlZFswXSB8fCB7IHN0ZXBJbmRleDogW10gfTtcblxuICAgIHZhciAkZWwgPSAkKHRoaXMpO1xuICAgIHZhciBpbmRleCA9ICskZWwuYXR0cignaWQnKTtcbiAgICB2YXIgcHJvcEluZGV4ID0gcHJvcHMuc3RlcEluZGV4LmluZGV4T2YoaW5kZXgpO1xuXG4gICAgaWYgKHByb3BJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiAkZWwucGFyZW50KCkuZmluZCgnLmRpc2FibGVkJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgLy8gYW4gQVBJIGFjdGlvblxuICAgIC8vIHByZXZlbnQgbGluayBmcm9tIG9wZW5pbmdcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHByb3AgPSBwcm9wcy5wcm9wZXJ0aWVzW3Byb3BJbmRleF07XG4gICAgdmFyIGFwaSA9IHByb3BzLmFwaXNbcHJvcEluZGV4XTtcbiAgICBpZiAoY29tbW9uW3Byb3BdKSB7XG4gICAgICByZXR1cm4gJGVsLnBhcmVudCgpLmZpbmQoJy5kaXNhYmxlZCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gJC5wb3N0KGFwaSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgLy8gYXNzdW1lIGEgYm9vbGVhbiBpbmRpY2F0ZXMgcGFzc2luZ1xuICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgcmV0dXJuICRlbC5wYXJlbnQoKS5maW5kKCcuZGlzYWJsZWQnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIH1cbiAgICAgIC8vIGFzc3VtZSBhcGkgcmV0dXJucyBzdHJpbmcgd2hlbiBmYWlsc1xuICAgICAgcmV0dXJuICRlbC5wYXJlbnQoKS5maW5kKCcuZGlzYWJsZWQnKS5yZXBsYWNlV2l0aCgnPHA+JyArIGRhdGEgKyAnPC9wPicpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRmluaXNoQ2xpY2soZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkKHN1Ym1pdE1vZGFsSWQpLm1vZGFsKCdzaG93Jyk7XG4gICAgJChzdWJtaXRNb2RhbElkICsgJy5tb2RhbC1oZWFkZXInKS5jbGljaygpO1xuICAgICQoc3VibWl0QnRuSWQpLmNsaWNrKGhhbmRsZVN1Ym1pdENsaWNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVN1Ym1pdENsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAkKCcjc3VibWl0LWNoYWxsZW5nZScpLmF0dHIoJ2Rpc2FibGVkJywgJ3RydWUnKS5yZW1vdmVDbGFzcygnYnRuLXByaW1hcnknKS5hZGRDbGFzcygnYnRuLXdhcm5pbmcgZGlzYWJsZWQnKTtcblxuICAgIHZhciAkY2hlY2ttYXJrQ29udGFpbmVyID0gJCgnI2NoZWNrbWFyay1jb250YWluZXInKTtcbiAgICAkY2hlY2ttYXJrQ29udGFpbmVyLmNzcyh7IGhlaWdodDogJGNoZWNrbWFya0NvbnRhaW5lci5pbm5lckhlaWdodCgpIH0pO1xuXG4gICAgJCgnI2NoYWxsZW5nZS1jaGVja21hcmsnKS5hZGRDbGFzcygnem9vbU91dFVwJykuZGVsYXkoMTAwMCkucXVldWUoZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICQodGhpcykucmVwbGFjZVdpdGgoJzxkaXYgaWQ9XCJjaGFsbGVuZ2Utc3Bpbm5lclwiICcgKyAnY2xhc3M9XCJhbmltYXRlZCB6b29tSW5VcCBpbm5lci1jaXJjbGVzLWxvYWRlclwiPicgKyAnc3VibWl0dGluZy4uLjwvZGl2PicpO1xuICAgICAgbmV4dCgpO1xuICAgIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogJy9jb21wbGV0ZWQtY2hhbGxlbmdlLycsXG4gICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGlkOiBjb21tb24uY2hhbGxlbmdlSWQsXG4gICAgICAgIG5hbWU6IGNvbW1vbi5jaGFsbGVuZ2VOYW1lLFxuICAgICAgICBjaGFsbGVuZ2VUeXBlOiArY29tbW9uLmNoYWxsZW5nZVR5cGVcbiAgICAgIH0pLFxuICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gJy9jaGFsbGVuZ2VzL25leHQtY2hhbGxlbmdlP2lkPScgKyBjb21tb24uY2hhbGxlbmdlSWQ7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZSh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgfSk7XG4gIH1cblxuICBjb21tb24uaW5pdC5wdXNoKGZ1bmN0aW9uICgkKSB7XG4gICAgaWYgKGNvbW1vbi5jaGFsbGVuZ2VUeXBlICE9PSAnNycpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgICQocHJldkJ0bkNsYXNzKS5jbGljayhoYW5kbGVQcmV2U3RlcENsaWNrKTtcbiAgICAkKG5leHRCdG5DbGFzcykuY2xpY2soaGFuZGxlTmV4dFN0ZXBDbGljayk7XG4gICAgJChhY3Rpb25CdG5DbGFzcykuY2xpY2soaGFuZGxlQWN0aW9uQ2xpY2spO1xuICAgICQoZmluaXNoQnRuQ2xhc3MpLmNsaWNrKGhhbmRsZUZpbmlzaENsaWNrKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbW1vbjtcbn0od2luZG93KTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhvYmosIGtleXMpIHsgdmFyIHRhcmdldCA9IHt9OyBmb3IgKHZhciBpIGluIG9iaikgeyBpZiAoa2V5cy5pbmRleE9mKGkpID49IDApIGNvbnRpbnVlOyBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGkpKSBjb250aW51ZTsgdGFyZ2V0W2ldID0gb2JqW2ldOyB9IHJldHVybiB0YXJnZXQ7IH1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICB2YXIgY29tbW9uID0gd2luZG93LmNvbW1vbjtcbiAgdmFyIE9ic2VydmFibGUgPSB3aW5kb3cuUnguT2JzZXJ2YWJsZTtcbiAgdmFyIGFkZExvb3BQcm90ZWN0ID0gY29tbW9uLmFkZExvb3BQcm90ZWN0LFxuICAgICAgY2hhbGxlbmdlTmFtZSA9IGNvbW1vbi5jaGFsbGVuZ2VOYW1lLFxuICAgICAgY2hhbGxlbmdlVHlwZSA9IGNvbW1vbi5jaGFsbGVuZ2VUeXBlLFxuICAgICAgY2hhbGxlbmdlVHlwZXMgPSBjb21tb24uY2hhbGxlbmdlVHlwZXM7XG5cblxuICBjb21tb24uaW5pdC5mb3JFYWNoKGZ1bmN0aW9uIChpbml0KSB7XG4gICAgaW5pdCgkKTtcbiAgfSk7XG5cbiAgLy8gb25seSBydW4gaWYgZWRpdG9yIHByZXNlbnRcbiAgaWYgKGNvbW1vbi5lZGl0b3IuZ2V0VmFsdWUpIHtcbiAgICB2YXIgY29kZSQgPSBjb21tb24uZWRpdG9yS2V5VXAkLmRlYm91bmNlKDc1MCkubWFwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb21tb24uZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgfSkuZGlzdGluY3RVbnRpbENoYW5nZWQoKS5zaGFyZVJlcGxheSgpO1xuXG4gICAgLy8gdXBkYXRlIHN0b3JhZ2VcbiAgICBjb2RlJC5zdWJzY3JpYmUoZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgIGNvbW1vbi5jb2RlU3RvcmFnZS51cGRhdGVTdG9yYWdlKGNvbW1vbi5jaGFsbGVuZ2VOYW1lLCBjb2RlKTtcbiAgICAgIGNvbW1vbi5jb2RlVXJpLnF1ZXJpZnkoY29kZSk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcblxuICAgIGNvZGUkXG4gICAgLy8gb25seSBydW4gZm9yIEhUTUxcbiAgICAuZmlsdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb21tb24uY2hhbGxlbmdlVHlwZSA9PT0gY2hhbGxlbmdlVHlwZXMuSFRNTDtcbiAgICB9KS5mbGF0TWFwKGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICByZXR1cm4gY29tbW9uLmRldGVjdFVuc2FmZUNvZGUkKGNvZGUpLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb21iaW5lZENvZGUgPSBjb21tb24uaGVhZCArIGNvZGUgKyBjb21tb24udGFpbDtcblxuICAgICAgICByZXR1cm4gYWRkTG9vcFByb3RlY3QoY29tYmluZWRDb2RlKTtcbiAgICAgIH0pLmZsYXRNYXAoZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbW1vbi51cGRhdGVQcmV2aWV3JChjb2RlKTtcbiAgICAgIH0pLmZsYXRNYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29tbW9uLmNoZWNrUHJldmlldyQoeyBjb2RlOiBjb2RlIH0pO1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICByZXR1cm4gT2JzZXJ2YWJsZS5qdXN0KHsgZXJyOiBlcnIgfSk7XG4gICAgICB9KTtcbiAgICB9KS5zdWJzY3JpYmUoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBlcnIgPSBfcmVmLmVycjtcblxuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJldHVybiBjb21tb24udXBkYXRlUHJldmlldyQoJ1xcbiAgICAgICAgICAgICAgPGgxPicgKyBlcnIgKyAnPC9oMT5cXG4gICAgICAgICAgICAnKS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbW1vbi5yZXNldEJ0biQuZG9Pbk5leHQoZnVuY3Rpb24gKCkge1xuICAgIGNvbW1vbi5lZGl0b3Iuc2V0VmFsdWUoY29tbW9uLnJlcGxhY2VTYWZlVGFncyhjb21tb24uc2VlZCkpO1xuICB9KS5mbGF0TWFwKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY29tbW9uLmV4ZWN1dGVDaGFsbGVuZ2UkKCkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgcmV0dXJuIE9ic2VydmFibGUuanVzdCh7IGVycjogZXJyIH0pO1xuICAgIH0pO1xuICB9KS5zdWJzY3JpYmUoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIGVyciA9IF9yZWYyLmVycixcbiAgICAgICAgb3V0cHV0ID0gX3JlZjIub3V0cHV0LFxuICAgICAgICBvcmlnaW5hbENvZGUgPSBfcmVmMi5vcmlnaW5hbENvZGU7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gY29tbW9uLnVwZGF0ZU91dHB1dERpc3BsYXkoJycgKyBlcnIpO1xuICAgIH1cbiAgICBjb21tb24uY29kZVN0b3JhZ2UudXBkYXRlU3RvcmFnZShjaGFsbGVuZ2VOYW1lLCBvcmlnaW5hbENvZGUpO1xuICAgIGNvbW1vbi5jb2RlVXJpLnF1ZXJpZnkob3JpZ2luYWxDb2RlKTtcbiAgICBjb21tb24udXBkYXRlT3V0cHV0RGlzcGxheShvdXRwdXQpO1xuICAgIHJldHVybiBudWxsO1xuICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH1cbiAgICBjb21tb24udXBkYXRlT3V0cHV0RGlzcGxheSgnJyArIGVycik7XG4gIH0pO1xuXG4gIE9ic2VydmFibGUubWVyZ2UoY29tbW9uLmVkaXRvckV4ZWN1dGUkLCBjb21tb24uc3VibWl0QnRuJCkuZmxhdE1hcChmdW5jdGlvbiAoKSB7XG4gICAgY29tbW9uLmFwcGVuZFRvT3V0cHV0RGlzcGxheSgnXFxuLy8gdGVzdGluZyBjaGFsbGVuZ2UuLi4nKTtcbiAgICByZXR1cm4gY29tbW9uLmV4ZWN1dGVDaGFsbGVuZ2UkKCkubWFwKGZ1bmN0aW9uIChfcmVmMykge1xuICAgICAgdmFyIHRlc3RzID0gX3JlZjMudGVzdHMsXG4gICAgICAgICAgcmVzdCA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVmMywgWyd0ZXN0cyddKTtcblxuICAgICAgdmFyIHNvbHZlZCA9IHRlc3RzLmV2ZXJ5KGZ1bmN0aW9uICh0ZXN0KSB7XG4gICAgICAgIHJldHVybiAhdGVzdC5lcnI7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBfZXh0ZW5kcyh7fSwgcmVzdCwgeyB0ZXN0czogdGVzdHMsIHNvbHZlZDogc29sdmVkIH0pO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHJldHVybiBPYnNlcnZhYmxlLmp1c3QoeyBlcnI6IGVyciB9KTtcbiAgICB9KTtcbiAgfSkuc3Vic2NyaWJlKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgIHZhciBlcnIgPSBfcmVmNC5lcnIsXG4gICAgICAgIHNvbHZlZCA9IF9yZWY0LnNvbHZlZCxcbiAgICAgICAgb3V0cHV0ID0gX3JlZjQub3V0cHV0LFxuICAgICAgICB0ZXN0cyA9IF9yZWY0LnRlc3RzO1xuXG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgaWYgKGNvbW1vbi5jaGFsbGVuZ2VUeXBlID09PSBjb21tb24uY2hhbGxlbmdlVHlwZXMuSFRNTCkge1xuICAgICAgICByZXR1cm4gY29tbW9uLnVwZGF0ZVByZXZpZXckKCdcXG4gICAgICAgICAgICAgIDxoMT4nICsgZXJyICsgJzwvaDE+XFxuICAgICAgICAgICAgJykuZmlyc3QoKS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbW1vbi51cGRhdGVPdXRwdXREaXNwbGF5KCcnICsgZXJyKTtcbiAgICB9XG4gICAgY29tbW9uLnVwZGF0ZU91dHB1dERpc3BsYXkob3V0cHV0KTtcbiAgICBjb21tb24uZGlzcGxheVRlc3RSZXN1bHRzKHRlc3RzKTtcbiAgICBpZiAoc29sdmVkKSB7XG4gICAgICBjb21tb24uc2hvd0NvbXBsZXRpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sIGZ1bmN0aW9uIChfcmVmNSkge1xuICAgIHZhciBlcnIgPSBfcmVmNS5lcnI7XG5cbiAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgY29tbW9uLnVwZGF0ZU91dHB1dERpc3BsYXkoJycgKyBlcnIpO1xuICB9KTtcblxuICAvLyBpbml0aWFsIGNoYWxsZW5nZSBydW4gdG8gcG9wdWxhdGUgdGVzdHNcbiAgaWYgKGNoYWxsZW5nZVR5cGUgPT09IGNoYWxsZW5nZVR5cGVzLkhUTUwpIHtcbiAgICB2YXIgJHByZXZpZXcgPSAkKCcjcHJldmlldycpO1xuICAgIHJldHVybiBPYnNlcnZhYmxlLmZyb21DYWxsYmFjaygkcHJldmlldy5yZWFkeSwgJHByZXZpZXcpKCkuZGVsYXkoNTAwKS5mbGF0TWFwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb21tb24uZXhlY3V0ZUNoYWxsZW5nZSQoKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICByZXR1cm4gT2JzZXJ2YWJsZS5qdXN0KHsgZXJyOiBlcnIgfSk7XG4gICAgfSkuc3Vic2NyaWJlKGZ1bmN0aW9uIChfcmVmNikge1xuICAgICAgdmFyIGVyciA9IF9yZWY2LmVycixcbiAgICAgICAgICB0ZXN0cyA9IF9yZWY2LnRlc3RzO1xuXG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgaWYgKGNvbW1vbi5jaGFsbGVuZ2VUeXBlID09PSBjb21tb24uY2hhbGxlbmdlVHlwZXMuSFRNTCkge1xuICAgICAgICAgIHJldHVybiBjb21tb24udXBkYXRlUHJldmlldyQoJ1xcbiAgICAgICAgICAgICAgICA8aDE+JyArIGVyciArICc8L2gxPlxcbiAgICAgICAgICAgICAgJykuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbW9uLnVwZGF0ZU91dHB1dERpc3BsYXkoJycgKyBlcnIpO1xuICAgICAgfVxuICAgICAgY29tbW9uLmRpc3BsYXlUZXN0UmVzdWx0cyh0ZXN0cyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LCBmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICAgIHZhciBlcnIgPSBfcmVmNy5lcnI7XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChjaGFsbGVuZ2VUeXBlID09PSBjaGFsbGVuZ2VUeXBlcy5CT05GSVJFIHx8IGNoYWxsZW5nZVR5cGUgPT09IGNoYWxsZW5nZVR5cGVzLkpTKSB7XG4gICAgcmV0dXJuIE9ic2VydmFibGUuanVzdCh7fSkuZGVsYXkoNTAwKS5mbGF0TWFwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb21tb24uZXhlY3V0ZUNoYWxsZW5nZSQoKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICByZXR1cm4gT2JzZXJ2YWJsZS5qdXN0KHsgZXJyOiBlcnIgfSk7XG4gICAgfSkuc3Vic2NyaWJlKGZ1bmN0aW9uIChfcmVmOCkge1xuICAgICAgdmFyIGVyciA9IF9yZWY4LmVycixcbiAgICAgICAgICBvcmlnaW5hbENvZGUgPSBfcmVmOC5vcmlnaW5hbENvZGUsXG4gICAgICAgICAgdGVzdHMgPSBfcmVmOC50ZXN0cztcblxuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJldHVybiBjb21tb24udXBkYXRlT3V0cHV0RGlzcGxheSgnJyArIGVycik7XG4gICAgICB9XG4gICAgICBjb21tb24uY29kZVN0b3JhZ2UudXBkYXRlU3RvcmFnZShjaGFsbGVuZ2VOYW1lLCBvcmlnaW5hbENvZGUpO1xuICAgICAgY29tbW9uLmRpc3BsYXlUZXN0UmVzdWx0cyh0ZXN0cyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICBjb21tb24udXBkYXRlT3V0cHV0RGlzcGxheSgnJyArIGVycik7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59KTsiXSwic291cmNlUm9vdCI6Ii9jb21tb25GcmFtZXdvcmsifQ==
