import csv

# Open the csv file
database = open('data.txt', "r")
database_reader = csv.DictReader(database, delimiter=';')

# Planets
MercuryInfo = []
VenusInfo = []
EarthInfo = []
MarsInfo = []
JupiterInfo = []
SaturnInfo = []
UranusInfo = []
NeptuneInfo = []
PlutoInfo = []

Mercury = {}
Venus = {}
Earth = {}
Mars = {}
Jupiter = {}
Saturn = {}
Uranus = {}
Neptune = {}
Pluto = {}


for row in database_reader:
    MercuryInfo.append(row['Mercury'])
    VenusInfo.append(row['Venus'])
    EarthInfo.append(row['Earth'])
    MarsInfo.append(row['Mars'])
    JupiterInfo.append(row['Jupiter'])   
    SaturnInfo.append(row['Saturn'])
    UranusInfo.append(row['Uranus'])
    NeptuneInfo.append(row['Neptune'])
    PlutoInfo.append(row['Pluto'])

database.close()

# Retrieve the desired data
database = open('data.txt', 'r')
planetInfo = []
for row, data in enumerate(database):
    if row != 0:
        planetInfo.append(data.strip().split(';')[:1][0])

for i in range(len(planetInfo)):
    Mercury[planetInfo[i]] = MercuryInfo[i]
    Venus[planetInfo[i]] = VenusInfo[i]
    Earth[planetInfo[i]] = EarthInfo[i]
    Mars[planetInfo[i]] = MarsInfo[i]
    Jupiter[planetInfo[i]] = JupiterInfo[i]
    Saturn[planetInfo[i]] = SaturnInfo[i]
    Uranus[planetInfo[i]] = UranusInfo[i]
    Neptune[planetInfo[i]] = NeptuneInfo[i]
    Pluto[planetInfo[i]] = PlutoInfo[i]
print(Mercury, flush=True, end='')

database.close()



const {spawn} = require('child_process');
const childPython = spawn('python', ['test.py']);

childPython.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
});
