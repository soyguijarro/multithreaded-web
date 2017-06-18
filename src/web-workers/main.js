/* global calculatePrimeNumbers */

// Constants
const TOP_NUMBER_THOUSANDS_INPUT_SELECTOR = '#top-number';
const WORKER_BUTTON_SELECTOR = '#worker';
const NO_WORKER_BUTTON_SELECTOR = '#no-worker';
const RESULT_NODE_SELECTOR = '#result';
const CIRCLE_NODE_SELECTOR = '#circle';
const PROCESSING_MESSAGE = 'Calculating...';
const RESULT_MESSAGE = amount => `Found ${amount} prime numbers`;

// Utils
const mainLog = (message, ...params) => {
  console.log(`%c${message}`, 'color: #009688', ...params);
};

// DOM operations
const renderText = domNode => (text) => {
  domNode.textContent = text;
};

const toggleDisabledProperty = (...domNodes) => () => {
  domNodes.forEach((domNode) => {
    domNode.disabled = !domNode.disabled;
  });
};

const animateCircle = (domNode, shouldMoveRight) => () => {
  const currentLeft = domNode.style.left ? parseInt(domNode.style.left, 10) : 0;

  const newLeft = currentLeft + (shouldMoveRight ? 1 : -1);
  const newShouldMoveRight = (
    (shouldMoveRight && newLeft < 10) ||
    (!shouldMoveRight && newLeft < -10)
  );

  domNode.style.left = `${newLeft}%`;
  requestAnimationFrame(animateCircle(domNode, newShouldMoveRight));
};

// Processing functions
const handleWorkerMessage = (renderResult, toggleButtons, { data: numbers }) => {
  renderResult(RESULT_MESSAGE(numbers.length));
  toggleButtons();
  mainLog('Result message received from worker', numbers);
};

const runWithWorker = (topNumber, renderResult, toggleButtons) => {
  const worker = new Worker('./worker.js');

  renderResult(PROCESSING_MESSAGE);
  toggleButtons();

  worker.postMessage(topNumber);
  mainLog('Start message sent to worker');
  worker.addEventListener('message', handleWorkerMessage.bind(null, renderResult, toggleButtons));
};

const runWithoutWorker = (topNumber, renderResult, toggleButtons) => {
  renderResult(PROCESSING_MESSAGE);
  toggleButtons();

  calculatePrimeNumbers(topNumber, (numbers) => {
    renderResult(RESULT_MESSAGE(numbers.length));
    toggleButtons();
  });
};

const main = () => {
  const workerButton = document.querySelector(WORKER_BUTTON_SELECTOR);
  const noWorkerButton = document.querySelector(NO_WORKER_BUTTON_SELECTOR);
  const resultDiv = document.querySelector(RESULT_NODE_SELECTOR);
  const circleDiv = document.querySelector(CIRCLE_NODE_SELECTOR);
  const topNumberThousandsInput = document.querySelector(TOP_NUMBER_THOUSANDS_INPUT_SELECTOR);

  requestAnimationFrame(animateCircle(circleDiv, true));

  const getTopNumber = () => topNumberThousandsInput.value * 1000;
  const renderResult = renderText(resultDiv);
  const toggleAllButtons = toggleDisabledProperty(workerButton, noWorkerButton);

  noWorkerButton.addEventListener('click', () => {
    runWithoutWorker(getTopNumber(), renderResult, toggleAllButtons);
  });
  workerButton.addEventListener('click', () => {
    runWithWorker(getTopNumber(), renderResult, toggleAllButtons);
  });
};

window.addEventListener('load', main);
