document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    input: document.getElementById('queries-input'),
    ignoreDuplicates: document.getElementById('chk-ignore-duplicates'),
    doNotLoad: document.getElementById('chk-do-not-load'),
    preserveInput: document.getElementById('chk-preserve-input'),
    btnOpen: document.getElementById('btn-open'),
    status: document.getElementById('status')
  };

  // Load saved state
  chrome.storage.local.get(['savedQueries', 'ignoreDuplicates', 'doNotLoad', 'preserveInput'], (result) => {
    if (result.preserveInput !== false) { // Default true
      elements.input.value = result.savedQueries || '';
    }

    if (result.ignoreDuplicates !== undefined) elements.ignoreDuplicates.checked = result.ignoreDuplicates;
    if (result.doNotLoad !== undefined) elements.doNotLoad.checked = result.doNotLoad;
    if (result.preserveInput !== undefined) elements.preserveInput.checked = result.preserveInput;

    updateButtonState();
  });

  // Save state on change
  function saveState() {
    chrome.storage.local.set({
      savedQueries: elements.preserveInput.checked ? elements.input.value : '',
      ignoreDuplicates: elements.ignoreDuplicates.checked,
      doNotLoad: elements.doNotLoad.checked,
      preserveInput: elements.preserveInput.checked
    });
  }

  // Update button text with count
  function updateButtonState() {
    const queries = getQueries();
    const count = queries.length;
    elements.btnOpen.textContent = count > 0 ? `Open Searches (${count})` : 'Open Searches';
    elements.btnOpen.disabled = count === 0;
    saveState();
  }

  function getQueries() {
    let lines = elements.input.value.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (elements.ignoreDuplicates.checked) {
      lines = [...new Set(lines)];
    }
    return lines;
  }

  elements.input.addEventListener('input', updateButtonState);
  elements.ignoreDuplicates.addEventListener('change', updateButtonState);
  elements.doNotLoad.addEventListener('change', saveState);
  elements.preserveInput.addEventListener('change', () => {
    saveState();
    if (!elements.preserveInput.checked) {
      // If unchecked, immediately clear saved state in storage
      chrome.storage.local.set({ savedQueries: '' });
    }
  });

  // Handle open button
  elements.btnOpen.addEventListener('click', async () => {
    const queries = getQueries();
    if (queries.length === 0) return;

    elements.status.textContent = 'Opening...';
    elements.btnOpen.disabled = true;

    const doNotLoad = elements.doNotLoad.checked;

    // Process queries by opening them as background tabs.
    // Creating tabs as active=false prevents the popup from losing focus and closing prematurely,
    // which would otherwise kill this script before the loop finishes.
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const url = chrome.runtime.getURL(`deferred.html?q=${encodeURIComponent(query)}&wait=${doNotLoad ? 1 : 0}`);
      chrome.tabs.create({ url: url, active: false });
    }

    elements.status.textContent = 'Done!';
    setTimeout(() => { elements.status.textContent = ''; }, 2000);

    if (!elements.preserveInput.checked) {
      elements.input.value = '';
      updateButtonState();
    }

    elements.btnOpen.disabled = false;
  });
});
