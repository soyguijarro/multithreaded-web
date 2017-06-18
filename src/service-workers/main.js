// Constants
const USERNAME_FORM_SELECTOR = '#form';
const USERNAME_INPUT_SELECTOR = '#username';
const ADD_PIC_TO_STRIP_SELECTOR = '#add';
const CLEAR_STRIP_SELECTOR = '#clear';
const STRIP_SELECTOR = '#strip';

// Utils
const mainLog = (message, ...params) => {
  console.log(`%c${message}`, 'color: #009688', ...params);
};

const getGithubPicUrl = username =>
  fetch(`https://api.github.com/users/${username}?size=192`)
    .then(response => response.json())
    .then(json => json.avatar_url);

// DOM operations
const toggleDisabledProperty = (...domNodes) => () => {
  domNodes.forEach((domNode) => {
    domNode.disabled = !domNode.disabled;
  });
};

const createImgNode = (url) => {
  const imgNode = document.createElement('img');
  imgNode.src = url;
  return imgNode;
};

const addPicTo = (domNode, toggleButtons) => (username) => {
  toggleButtons();
  getGithubPicUrl(username)
    .then((url) => {
      const pic = createImgNode(url);
      domNode.insertBefore(pic, domNode.firstChild);
      toggleButtons();
    })
    .catch(() => {
      toggleButtons();
    });
};

const clearNode = domNode => () => {
  domNode.innerHTML = '';
};

// Main
const requestNotificationPermission = Notification.requestPermission;

const initServiceWorker = () => {
  navigator.serviceWorker.register('./service-worker.js')
    .then((registration) => {
      mainLog('Service worker registrated:', registration.scope);
    })
    .catch((err) => {
      mainLog('Service worker failed:', err);
    });
};

const initEventListeners = () => {
  const usernameInput = document.querySelector(USERNAME_INPUT_SELECTOR);
  const addPicToStripButton = document.querySelector(ADD_PIC_TO_STRIP_SELECTOR);
  const usernameForm = document.querySelector(USERNAME_FORM_SELECTOR);
  const clearWallButton = document.querySelector(CLEAR_STRIP_SELECTOR);
  const wallDiv = document.querySelector(STRIP_SELECTOR);

  const getUsername = () => usernameInput.value;
  const toggleAllButtons = toggleDisabledProperty(addPicToStripButton, clearWallButton);
  const addPicToStrip = addPicTo(wallDiv, toggleAllButtons);
  const clearWall = clearNode(wallDiv);

  usernameForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  addPicToStripButton.addEventListener('click', () => {
    addPicToStrip(getUsername());
  });
  clearWallButton.addEventListener('click', clearWall);
  navigator.serviceWorker.addEventListener('message', ({ data: username }) => {
    addPicToStrip(username);
  });
};

const main = () => {
  initServiceWorker();
  initEventListeners();
  requestNotificationPermission();
};

window.addEventListener('load', main);

