/* global calculatePrimeNumbers */
importScripts('./prime-numbers.js');

// Utils
const workerLog = (message, ...params) => {
  console.log(`%c${message}`, 'color: #e91e63', ...params);
};

const handleMessage = ({ data: topNumber }) => {
  workerLog('Start message received by worker');
  calculatePrimeNumbers(topNumber, (numbers) => {
    self.postMessage(numbers);
    workerLog('Result message sent by worker', numbers);
    self.close();
  });
};

self.addEventListener('message', handleMessage);
