// Constants
const CACHE_NAME = 'multithreaded-cache-v1';
const PAGE_URL = '/service-workers/';

// Utils
const workerLog = (message, ...params) => {
  console.log(`%c${message}`, 'color: #e91e63', ...params);
};

// Cache

const urlsToCache = ['./', './main.js', './styles.css'];

const addResourceToCache = (request, response) =>
  caches.open(CACHE_NAME)
    .then(cache => cache.put(request, response))
    .then(() => workerLog('Resource cached:', request.url));

const addResourcesToCache = urls =>
  caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urls))
    .then(() => workerLog('All resources cached'));

const getResourceFromCacheFirst = request =>
  caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        workerLog('Cache hit:', request.url);
        return cachedResponse;
      }

      const requestClone = request.clone();
      return fetch(requestClone)
        .then((response) => {
          if (response && response.status === 200) {
            addResourceToCache(requestClone, response.clone());
          }
          return response;
        });
    });

// Notifications
const showNotification = () => {
  self.registration.showNotification('Multithreaded says hello', {
    icon: '../favicon.png',
    badge: '../favicon.png',
    body: 'I\'m yet another annoying notification',
    actions: [
      {
        action: 'add-pic',
        title: 'Add picture',
        type: 'text',
      },
      {
        action: 'nothing',
        title: 'Do nothing',
      },
    ],
  });
};

const handleNothingNotificationAction = (notification) => {
  workerLog('Do nothing notification action clicked');

  notification.close();
};

const getWindowClient = (path) => {
  const url = new URL(path, self.location.origin).href;
  return clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(windowClients => windowClients.find(client => client.url === url));
};

const sendMessageToWindowClient = (message, windowClient) => () => {
  windowClient.postMessage(message);
};

const runTaskAndFocusWindowClient = (taskFn, windowClient, notification) => {
  taskFn();
  notification.close();
  return windowClient.focus();
};

const handleAddPicNotificationAction = (notification, username) => {
  workerLog('Add picture notification action clicked:', username);

  return getWindowClient(PAGE_URL)
    .then(windowClient => runTaskAndFocusWindowClient(
      sendMessageToWindowClient(username, windowClient),
      windowClient,
      notification,
    ));
};

// Event listeners
const handleInstall = (event) => {
  workerLog('Installed');
  event.waitUntil(addResourcesToCache(urlsToCache));
};

const handleActivate = () => {
  workerLog('Activated');
};

const handleFetch = (event) => {
  event.respondWith(getResourceFromCacheFirst(event.request));
};

const handlePush = () => {
  workerLog('Push received');
  showNotification();
};

const handleNotificationClick = (event) => {
  const { notification, action, reply } = event;

  if (!action || action === 'nothing') {
    handleNothingNotificationAction(notification);
  } else if (action === 'add-pic') {
    event.waitUntil(handleAddPicNotificationAction(notification, reply || 'src-d'));
  }
};

const handleNotificationClose = () => {
  workerLog('Notification dismissed');
};

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('fetch', handleFetch);
self.addEventListener('push', handlePush);
self.addEventListener('notificationclick', handleNotificationClick);
self.addEventListener('notificationclose', handleNotificationClose);
