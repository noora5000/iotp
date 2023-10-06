const BASE_URL = "http://98.71.87.121/api";
// const BASE_URL = "http://localhost:3001";
const COUNTIN_DOM = document.getElementById("countIn");
const COUNTOUT_DOM = document.getElementById("countOut");

const getCount = () => {
  fetch(`${BASE_URL}/counter/`, {
    "method": "GET",
  }).then(response => response.json())
  .then((visitObjects) => {
    // 'visitObjects' contains two arrays of objects: in-gate passings and out-gate passings
    // Objects have following properties: id, direction (in/out), count of passings and timestamp: 
    const inPassings = visitObjects.inPassings
    const outPassings = visitObjects.outPassings

    // function to calculate the sum of passings from a gate-array given as a parameter
    const calculateSum = (array) => {
      let sumCount = 0;
      sumCount = array.reduce((acc, currentElement) => {
        return acc + parseInt(currentElement.count);
      }, 0)
      return sumCount
    }

    const inCount = calculateSum(inPassings);
    const outCount = calculateSum(outPassings);

    COUNTIN_DOM.innerText = inCount;
    COUNTOUT_DOM.innerText = outCount;
  }).catch(err => {
    console.error(err);
  });
};

const resetCount = () => {
  fetch(`${BASE_URL}/counter-reset`, {
    "method": "GET",
  }).then(response => {
     // if response.status == 200...
     COUNTIN_DOM.innerText = "0";
     COUNTOUT_DOM.innerText = "0";
  }).catch(err => {
    console.error(err);
  });
};

