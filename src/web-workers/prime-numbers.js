// Utils
const primeNumbersLog = (message, ...params) => {
  console.log(`%c${message}`, 'color: #FF9800', ...params);
};

const isPrime = (number) => {
  if (number < 2) return false;
  for (let i = 2; i < number; i += 1) {
    if (number % i === 0) return false;
  }
  return true;
};

// eslint-disable-next-line no-unused-vars
const calculatePrimeNumbers = (topNumber, callback) => {
  const primeNumbers = [];
  for (let i = 0; i < topNumber; i += 1) {
    if (isPrime(i)) {
      primeNumbersLog('Prime number found:', i);
      primeNumbers.push(i);
    }
  }
  callback(primeNumbers);
};
