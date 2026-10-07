function performSearch(query) {
  if (chrome && chrome.search && chrome.search.query) {
    chrome.tabs.getCurrent((tab) => {
      // Execute the search using the default provider, replacing this tab
      chrome.search.query({
        text: query,
        tabId: tab.id,
        disposition: 'CURRENT_TAB'
      }, () => {
        if (chrome.runtime.lastError) {
           console.error("Search error:", chrome.runtime.lastError);
           document.body.innerHTML = `<div>Error performing search: ${chrome.runtime.lastError.message}</div>`;
        }
      });
    });
  } else {
    document.body.innerHTML = `<div>Error: Search API not available. Check permissions.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  const shouldWait = urlParams.get('wait') === '1';

  if (query) {
    document.title = `Search: ${query}`;

    if (shouldWait) {
      // Check if we are already visible
      if (document.visibilityState === 'visible') {
        performSearch(query);
      } else {
        // Wait for the user to select the tab
        const onVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            performSearch(query);
          }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
      }
    } else {
      // Load immediately, even in the background
      performSearch(query);
    }
  } else {
    document.body.innerHTML = `<div>No query provided.</div>`;
  }
});
