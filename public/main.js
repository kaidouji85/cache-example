window.onload = async () => {
  try {
    const hasServiceWorker = 'serviceWorker' in navigator;
    if (!hasServiceWorker) {
      return;
    }
    const serviceWorker = await navigator.serviceWorker.register('sw.js');
  } catch (e) {
    throw e;
  }
};
