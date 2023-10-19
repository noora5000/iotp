Palvelinohjelma iotp-kurssille

Palvelin vastaanottaa dataa IoT-laitteilta ja tallentaa sen JSON-tiedostoon counts.json
  - IoT-laitteelta lähtevä data on muotoa: {"countIn": 5,"countOut":0}
  - Palvelimella countIn- ja countOut- arvot kirjoitetaan olioihin, joihin lisätään aikaleima. Ne kirjoitetaan kirjoitetaan JSON-tiedostoon fs-kirjaston avulla.
  - JSON-tiedostoon on tallennetu yhteen olioon kaksi arrayta, joissa on lueteltu porteista kulut suunnan mukaan; sisään ja ulos
    esim: {"inPassings":[{"direction":"in","count":5,"timestamp":1696164543417}],"outPassings":[]}

Asiakaspääteohjelma saavuttaa palvelimen datan GET-pyynnöllä api/counter-endpointista
  - Pyyntöön vastataan oliolla, joka sisältää laskurin tiedot summaavan olion:
  -   let counterVariables = {
         max: 10,
         currentVisitors: 5,
         totalVisitors: 10,
      }

Sallittua vieraiden määrää voi muuttaa endpointista api/change-max
Palvelimen datan voi resetoida api/counter-reset-endpointista
