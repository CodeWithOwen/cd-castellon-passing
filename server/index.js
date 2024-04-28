const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;
// put functions in their own file
function getUniqueMatchIds(players) {
  const uniqueMatches = {};
  players.forEach(player => {
    const matchId = player.match_id;
    if (!uniqueMatches.hasOwnProperty(matchId)) {
      uniqueMatches[matchId] = true;
    }
  });
  return uniqueMatches;
}
function getRandomKey(obj) {
  const keys = Object.keys(obj);
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}
function formatDate(isoDateString) {
  const date = new Date(isoDateString + 'T00:00:00Z');
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return `${monthNames[month]} ${day}, ${year}`;
}
async function getData() {
  return new Promise((resolve, reject) => {
    //hanlde reject
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    });
  })
}
app.use(express.static(path.join(__dirname, 'public')));

app.get('/matches', async (req, res) => {
  let data = await getData();
  data = JSON.parse(data);
  const uniqueMatchIds = getUniqueMatchIds(data.formation_players);
  let arrayOfMatches = []
  let index = 0
  for (let matchID in uniqueMatchIds) {
    arrayOfMatches.push({ id: matchID, ...data.matches[index] })
    index++
  }
  arrayOfMatches = arrayOfMatches.map(match => {
    return {
      ...match,
      human_readable_date: formatDate(match.match_date)
    }
  })
  res.send(arrayOfMatches);
})
app.get('/passing-data/:matchID', (req, res) => {
  const matchID = req.params.matchID;
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send("Error getting data.");
    }
    try {
      const jsonData = JSON.parse(data);
      for (let key in jsonData) {
        console.log(key);
        console.log(jsonData[key].length)
        console.log(jsonData[key][0])
        console.log("\n\n\n")
      }
      let passesFromThisMatch = jsonData.passes.filter(pass =>
        matchID === "0" || pass.match_id.toString() === matchID
      );

      passesFromThisMatch.sort((a, b) => {
        if (a.period !== b.period) {
          return a.period - b.period;
        }
        if (a.minute !== b.minute) {
          return a.minute - b.minute;
        }
        return a.second - b.second;
      });
      let uniquePlayersCount = 0;
      const groupedByPlayer = {};
      const eligiblePlayerIds = new Set();

      passesFromThisMatch.forEach(pass => {
        const playerId = pass.player_id;
        if (!groupedByPlayer[playerId]) {
          if (uniquePlayersCount >= 11) {
            return;
          }
          groupedByPlayer[playerId] = [];
          eligiblePlayerIds.add(playerId);
          uniquePlayersCount++;
        }
        groupedByPlayer[playerId].push(pass);
      });

      let megaObject = {};

      console.log(eligiblePlayerIds)
      passesFromThisMatch.forEach(pass => {
        if (eligiblePlayerIds.has(pass.player_id) && eligiblePlayerIds.has(pass.pass_recipient_id)) {
          const key = `${pass.player_id}-${pass.pass_recipient_id}`;
          if (!megaObject[key]) {
            megaObject[key] = {};
            megaObject[key].passes = [];
          }
          megaObject[key].passes.push(pass);
        }
      });
      const numberOfCombinations = Object.keys(megaObject).length;
      // console.log(Object.keys(megaObject))
      // console.log(numberOfCombinations);
      console.log(megaObject)
      const playerAverages = {};

      for (const playerId in groupedByPlayer) {
        const passes = groupedByPlayer[playerId];
        let totalX = 0;
        let totalY = 0;
        let count = 0
        const playerName = passes[0].player_name;

        passes.forEach(pass => {
          count++
          totalX += pass.location_x;
          totalY += pass.location_y;
        });

        const avgX = totalX / passes.length;
        const avgY = totalY / passes.length;

        playerAverages[playerId] = { avg_x: avgX, avg_y: avgY, player_name: playerName, count: count };
      }

      res.send({ players: playerAverages, passMap: megaObject });
    } catch (e) {
      res.status(500).send("Error parsing JSON.");
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
