import express from 'express';
import cors from 'cors'
import fs from 'fs'
// Lisää toiminta maxVisitors muuttamiseen
const port = process.env.PORT || 3001;
let countsJson = {}
let inCount=0;
let outCount=0;
let maxVisitors = 10;
// lue json-tallennustiedosto:
try{
  countsJson = JSON.parse(fs.readFileSync('counts.json'))
} catch(error){
  console.log("Error reading counts.json")
}
// funktio kulkujen summaamiseen. Parametrina lista portin (sisään tai ulos) kuluista
const calculateSum = (array) => {
  let sumCount = 0;
  sumCount = array.reduce((acc, currentElement) => {
    return acc + parseInt(currentElement.count);
  }, 0)
  return sumCount
}

inCount = calculateSum(countsJson.inPassings);
outCount = calculateSum(countsJson.outPassings);

const app = express();
app.use(cors())
app.use(express.json());

// API-requests:
// asiakasohjelma saavuttaa palvelimen käskyllä fetch(`${BASE_URL}/...
app.get('/', (req, res) => {
  console.log('get /')
  res.send('OK')
});
// endpoint /counter palauttaa tiedot maksimimäärästä sallittuja vieraita,
// sisällä olevista vieraista ja yhteenlaskettu tieto kaikista vieraista.
app.get('/counter', async (_, res) => {
  let counterVariables = {
    max: maxVisitors,
    currentVisitors: inCount - outCount,
    totalVisitors: inCount,
  }
  try{
    res.status(200).json(counterVariables)
  } catch(error){
    res.status(500).json({ error: error.message });
  }
})
// endpoint /change-max muuttaa sallitun vierasmäärän
app.post('/change-max', async (req, res) => {
  console.log(req.body)
  maxVisitors = req.body.max
  try{
    res.status(200).json(`Maksimikävijämäärä päivitetty. Uusi arvo ${maxVisitors}`)
  } catch(error){
    res.status(500).json({ error: error.message });
  }
})

// IoT-laite lähettää dataa palvelimelle post-metodin kautta.
// post-pyynnön bodyssa tieto sisääntulleista ja ulosmenneistä
app.post('/counter', async (req, res) => {
  try {
    // Luo aikaleima
    const currentDate = new Date(); 
    const timestamp = currentDate.getTime();
    // lue requestin body ja luo sen pohjalta uudet oliot sisään- ja uloskuluista
    const visit = req.body;
    const visitIn = {
      "count": visit.countIn,
      "timestamp": timestamp
    }
    const visitOut = {
      "count": visit.countOut,
      "timestamp": timestamp
    }
    // liitä luodut oliot countsJson-olion propertyihin
    if(visitIn != 0) {
      countsJson.inPassings.push(visitIn);
    }
    if(visitOut != 0) {
      countsJson.outPassings.push(visitOut);
    }

    // Kirjoita tiedot porttikuluista JSON-tiedostoon
    fs.writeFileSync('counts.json', JSON.stringify(countsJson))
    // päivitä sovelluksen muuttujat
    countsJson = JSON.parse(fs.readFileSync('counts.json'))
    inCount = calculateSum(countsJson.inPassings);
    outCount = calculateSum(countsJson.outPassings);

    console.log(`created visit.`);
    res.status(201).json({ visit });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

// resetoi paikallisen tallennustiedoston
app.get('/counter-reset', async (req, res) => {
  try {
      countsJson.inPassings = []
      countsJson.outPassings = []
      fs.writeFileSync('counts.json', JSON.stringify(countsJson))
      // pävitä sovelluksen muuttujat
      countsJson = JSON.parse(fs.readFileSync('counts.json'))
      inCount = calculateSum(countsJson.inPassings);
      outCount = calculateSum(countsJson.outPassings);

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
