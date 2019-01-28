const scale = window.devicePixelRatio ? 1 / devicePixelRatio : 1;
const metaEl = document.createElement('meta');
metaEl.setAttribute('name', 'viewport');
metaEl.setAttribute('content', `target-densitydpi=device-dpi, user-scalable=no, initial-scale=${scale}, maximum-scale=${scale}, minimum-scale=${scale}`);
const headEl = document.querySelector('head');
headEl.appendChild(metaEl);
