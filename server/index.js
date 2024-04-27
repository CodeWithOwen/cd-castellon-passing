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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/passing-data', (req, res) => {
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
      const uniqueMatchIds = getUniqueMatchIds(jsonData.formation_players);
      console.log(uniqueMatchIds)
      const randomKey = getRandomKey(uniqueMatchIds);
      const passesFromThisMatch = jsonData.passes.filter(pass => pass.match_id.toString() === randomKey);
      console.log("passesFromThisMatch", passesFromThisMatch.length)
      const groupedByPlayer = {};

      passesFromThisMatch.forEach(pass => {
        const playerId = pass.player_id;
        if (!groupedByPlayer[playerId]) {
          groupedByPlayer[playerId] = [];
        }
        groupedByPlayer[playerId].push(pass);
      });
      // console.log("a", groupedByPlayer)

      const playerAverages = {};

      for (const playerId in groupedByPlayer) {
        const passes = groupedByPlayer[playerId];
        let totalX = 0;
        let totalY = 0;
        const playerName = passes[0].player_name;

        passes.forEach(pass => {
          totalX += pass.location_x;
          totalY += pass.location_y;
        });

        const avgX = totalX / passes.length;
        const avgY = totalY / passes.length;

        playerAverages[playerId] = { avg_x: avgX, avg_y: avgY, player_name: playerName };
      }

      res.send(playerAverages);
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
