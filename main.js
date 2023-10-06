import express from 'express';
import cors from 'cors'
import fs from 'fs'

const port = process.env.PORT || 3001;

// fetch the list of all in and out passings from JSON-file
const counts = fs.readFileSync('counts.json')
const jsonCounts = JSON.parse(counts)

const app = express();
app.use(cors())
app.use(express.json());

// API-requests:
// asiakasohjelma saavuttaa palvelimen käskyllä fetch(`${BASE_URL}/...
app.get('/', (req, res) => {
  console.log('get /')
  res.send('OK')
});

app.get('/counter', async (_, res) => {
  try {
    console.log('get /counter')
    res.status(200).json(jsonCounts);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// IoT-laite lähettää dataa palvelimelle post-metodin kautta.
app.post('/counter', async (req, res) => {
  try {
    // req.body näyttää tältä:
    // {
    //  "direction": "in", (tai "out" riippuen portista)
    //  "count": 1 (Karrin ohjelmalogiikan mukaan)
    // }

    // Add timestamp to JSON-object received with req
    const visit = req.body;

    const currentDate = new Date(); 
    const timestamp = currentDate.getTime();

    const visitWithTimestamp = visit
    visitWithTimestamp.timestamp = timestamp

    // Update the list of all passings with current JSON-obejct and write to JSON-file.
    if (visit.direction === "in"){
      jsonCounts.inPassings.push(visitWithTimestamp);
    } else {
      jsonCounts.outPassings.push(visitWithTimestamp);
    }
    fs.writeFileSync('counts.json', JSON.stringify(jsonCounts))

    console.log(`created visit: ${JSON.stringify(visitWithTimestamp)}`);
    res.status(201).json({ visit });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// millainen pyyntö tulee jos on get-pyyntö ja siinä tietoa mukana?
// app.get('/counter-add', async (req, res) => {
//   try {
//     // Add timestamp to reqeust.body-JSON-object
//     const visit = req.body;
// 
//     const currentDate = new Date(); 
//     const timestamp = currentDate.getTime();
// 
//     const visitWithTimestamp = visit
//     visitWithTimestamp.timestamp = timestamp
// 
//     // Update the list of all passings with current data and write to JSON-file.
//     if (visit.direction === "in"){
//       jsonCounts.inPassings.push(visitWithTimestamp);
//       fs.writeFileSync('counts.json', JSON.stringify(jsonCounts))
//     } else {
//       jsonCounts.outPassings.push(visitWithTimestamp);
//       fs.writeFileSync('counts.json', JSON.stringify(jsonCounts))
//     }
// 
//     console.log(`created visit: ${JSON.stringify(visitWithTimestamp)}`);
//     res.status(201).json({ visit });
//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// });

app.get('/counter-reset', async (req, res) => {
  try {
      jsonCounts.inPassings = []
      jsonCounts.outPassings = []
      fs.writeFileSync('counts.json', JSON.stringify(jsonCounts))

      console.log('reset')
      res.send('reset succeeded.');
 
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});