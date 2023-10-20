import express from 'express';
import cors from 'cors'
import {promises as fsPromises } from 'fs'

const port = process.env.PORT || 3001;
// variables
let jsonData = {}
let inCount=0;
let outCount=0;

// read json-file to jsonData and count the sums of inpassings and outpassings
const readFile = async() => {
  try{
    const data = await fsPromises.readFile('counts.json', 'utf8');
    // const data = await fsPromises.readFile('/home/alliumboeing/projects/laskuri/counts.json', 'utf8');
    jsonData = JSON.parse(data);
  } catch(error){
    console.error("Error reading counts.json", error.message)
  }
  
  inCount = calculateSum(jsonData.inPassings);
  outCount = calculateSum(jsonData.outPassings);
}
// function to update json-file
const updateFile = async(res) => {
  try {
    await fsPromises.writeFile('counts.json', JSON.stringify(jsonData));
    console.log('update succeeded');
    res.status(201).json({ jsonData });
  } catch (error) {
    console.error(`Writing json-file failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}
// function to count sums of in- and outpassings from jsonData
const calculateSum = (array) => {
  let sumCount = 0;
  sumCount = array.reduce((acc, currentElement) => {
    return acc + parseInt(currentElement.count);
  }, 0)
  return sumCount
}

const app = express();
app.use(cors());
app.use(express.json());
// middleware to read JSON file on startup
app.use(async(req, res, next) =>{
  await readFile();
  next();
})

// get /counter endpoint returns an object containing maximum number of allowed visitors,
// current number of visitors and number of all visitors since last reset
app.get('/counter', async (_, res) => {
  let counterVariables = {
    max: jsonData.maxVisitors,
    currentVisitors: inCount - outCount,
    totalVisitors: inCount,
  }
  try{
    console.log('get /counter succeeded.')
    res.status(200).json(counterVariables)
  } catch(error){
    console.error(`get /counter failed: ${error.message}`)
    res.status(500).json({ error: error.message });
  }
})
// endpoint /change-max changes the maximun number of allowed visitors 
// and updates the new value to json-file
app.post('/change-max', async (req, res) => {
  // validate request value before updating the the maximum number of allowed visitors
  if(req.body.max < 0) {
    console.error(`number can't be of negative value`);
    res.status(400).json({ error: `number can't be of negative value` })
    return;
  } else if (req.body.max === jsonData.maxVisitors) {
    console.error('the entered new maximum value is already in effect');
    res.status(400).json({ error: "the entered new maximum value is already in effect" })
    return;
  } else {
    // if validation succeeded: update jsonData and write json-file
    jsonData.maxVisitors = req.body.max
    await updateFile(res)
  } 
})

// IoT-device sends data to server via post-request.
// Request body must contain fields for countIn and countOut
app.post('/counter', async (req, res) => {
  const visits = req.body;
  // validate incoming data: check the required fields and values
  if(visits.countIn === undefined || visits.countOut === undefined){
    console.error('error: data is missing a required field');
    res.status(400).json({ error: 'data is missing a required field' })
    return;
  }
  if(!visits.countIn && !visits.countOut){
    console.error('error: values are null');
    res.status(400).json({ error: 'values are null' })
    return;
  }
  if(typeof visits.countIn !== 'number' || visits.countIn < 0 || typeof visits.countOut !== 'number' || visits.countOut < 0) {
    console.error('error: negative values or invalid data type');
    res.status(400).json({ error: 'negative values or invalid data type' })
      return;
     }
  // If validating succeeded:
  // check condition: current visitors can't be less than 0:
  if((inCount - outCount) + (visits.countIn - visits.countOut) < 0){
    console.error(`error: number of current visitors can't be of negative value`)
    res.status(400).json({ error: `number of current visitors can't be of negative value` })
    return;
  }
  // Create timestamp
  const currentDate = new Date(); 
  const timestamp = currentDate.getTime();
  // create objects representing inPassings and outPassings. Push to jsonData-object
  if (visits.countIn!==0){
    const visitIn = {
      "count": visits.countIn,
      "timestamp": timestamp
    }
    jsonData.inPassings.push(visitIn);
  }
  if(visits.countOut !== 0){
    const visitOut = {
      "count": visits.countOut,
      "timestamp": timestamp
    }
    jsonData.outPassings.push(visitOut);
  }
  // Write json-file
  await updateFile(res);
  // update variables
  inCount = inCount + visits.countIn;
  outCount = outCount + visits.countOut;
});

// reset the inpassings and outpassings from json-file
app.get('/counter-reset', async (req, res) => {
  jsonData.inPassings = []
  jsonData.outPassings = []
  await updateFile(res)
  // update variables
  inCount = 0;
  outCount = 0;
});

// Launching the server
try {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
} catch (error) {
  console.error(`Server failed to start: ${error.message}`);
}
