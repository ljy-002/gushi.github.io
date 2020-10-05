(function() {
      // fix image src
      // setting src="" on <img> causes some images to not lazy load correctly
      var images = document.getElementsByTagName('img');
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        img.src = img.getAttribute('data-src');
      }

      var allFilteredElements = [];
      var updateOnChange = false;

      function enableSelector(el, def, hash) {
        var selectorId = el.dataset.selector;
        var choices = el.children;
        var selection = def;

        var filteredElements = document.querySelectorAll('[data-' + selectorId + ']');
        Array.prototype.forEach.call(filteredElements, function(el) {
          if (allFilteredElements.indexOf(el) === -1) allFilteredElements.push(el);
          if (!el.filters) el.filters = [];
          var fields = el.dataset[selectorId].split(',');
          el.filters.push(function() { return fields.indexOf(selection) !== -1; });
        });

        function setSelection(id) {
          selection = id;

          for (var i = 0; i < choices.length; i++) {
            var otherChoice = choices[i];
            if (otherChoice.dataset.id === id) {
              otherChoice.classList.add('selected');
            } else {
              otherChoice.classList.remove('selected');
            }
          }

          if (updateOnChange) updateFilteredElements();
        }

        function clickHandler(el) {
          return function(event) {
            if (event.keyCode && event.keyCode !== 13) {
              return;
            }
            if (hash) history.replaceState('', '', '#' + el.dataset.id);
            setSelection(el.dataset.id);
          }
        }

        for (var i = 0; i < choices.length; i++) {
          var choiceEl = choices[i];
          choiceEl.onclick = choiceEl.onkeydown = clickHandler(choiceEl);
        }

        setSelection(def);
      }

      function updateFilteredElements() {
        allFilteredElements.forEach(function(el) {
          var falseFilters = el.filters.filter(function(i) { return !i(); });
          var visible = falseFilters.length === 0;
          // we *really* want to make sure that these are hidden and won't be included by things like reader mode
          el.hidden = !visible;
          el.setAttribute('aria-hidden', !visible);
          el.style.display = visible ? '' : 'none';
        });
      }

      function getDefaultgushi() {
        // check location hash
        var hash = location.hash.substr(1);
        if (['译文', '赏析'].indexOf(hash) > -1) return hash;
        if (/cros/i.test(navigator.userAgent)) return '译文';
        if (/iphone/i.test(navigator.userAgent) || /ipad/i.test(navigator.userAgent)) return '赏析';
        return '译文';
      }

      // implement the platform selectors
      enableSelector(document.querySelector('[data-selector=os]'), getDefaultOS(), true);
      enableSelector(document.querySelector('[data-selector=androidmethod]'), 'embed', false);
      enableSelector(document.querySelector('[data-selector=winmethod]'), 'zip', false);

      updateOnChange = true;
      updateFilteredElements();

      document.body.removeAttribute('data-loading');
    })();
