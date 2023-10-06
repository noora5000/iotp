Palvelinohjelma iotp-kurssille

Palvelin vastaanottaa dataa IoT-laitteilta ja tallentaa sen JSON-tiedostoon counts.json
  - IoT-laitteelta lähtevä data on muotoa: {"direction":"in","count":5}
  - Palvelimella dataan lisätään vielä aikaleima ja se kirjoitetaan JSON-tiedostoon fs-kirjaston avulla.
  - JSON-tiedostoon on tallennetu yhteen olioon kaksi arrayta, joissa on lueteltu porteista kulut suunnan mukaan; sisään ja ulos
    esim: {"inPassings":[{"direction":"in","count":5,"timestamp":1696164543417}],"outPassings":[]}

Asiakaspääteohjelma saavuttaa palvelimen datan GET-pyynnöllä api/counter-endpointista
  - Pyyntöön vastataan oliolla, joka sisältää kaksi listaa: inPassings ja outPassings

Palvelimen datan voi resetoida api/counter-reset-endpointista


Rest-pyynnöt:

@baseUrl = http://98.71.87.121

### send GET request to the server
GET http://{{baseUrl}} HTTP/1.1

### Send request to the /counter-endpoint
GET {{baseUrl}}/api/counter/ HTTP/1.1

### Send request to the /counter-endpoint
GET {{baseUrl}}/api/counter-reset/ HTTP/1.1

### Send POST request to '/counter' endpoint
POST {{baseUrl}}/api/counter/ HTTP/1.1
Content-Type: application/json

{
    "direction": "in",
    "count": 1
}

