const express = require('express');
const { getData, getUniqueMatchIds, formatDate, groupByPlayer, handlePlayerObject } = require('./functions');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static(path.join(__dirname, 'public')));

const cdCastellonTeamId = 1787
app.get('/api/matches', async (req, res) => {
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

app.get('/api/passing-data/:matchID', async (req, res) => {
  const matchID = req.params.matchID;
  let data = await getData();
  data = JSON.parse(data);

  for (let key in data) {
    console.log(key);
    console.log(data[key].length)
    console.log(data[key][0])
    console.log("\n\n\n")
  }

  let passesFromThisMatch = data.passes.filter(pass =>
    matchID === "0" || pass.match_id.toString() === matchID
  ).filter(pass => pass.team_id === cdCastellonTeamId);
  passesFromThisMatch = passesFromThisMatch.filter(pass => pass.player_id && pass.pass_recipient_id && pass.location_x && pass.location_y);

  const groupedByPlayer = groupByPlayer(passesFromThisMatch);
  let playersWithPassValue = handlePlayerObject(groupedByPlayer)
  playersWithPassValue.sort((a, b) => b.totalPasses - a.totalPasses);
  console.log(playersWithPassValue.length)
  playersWithPassValue = playersWithPassValue.slice(0, 11);
  const eligiblePlayerIds = new Set(playersWithPassValue.map(player => player.id));
  const passMap = passesFromThisMatch.reduce((acc, pass) => {
    const playerID = pass.player_id;
    const recipientID = pass.pass_recipient_id;
    if (!eligiblePlayerIds.has(playerID.toString()) || !eligiblePlayerIds.has(recipientID.toString())) {
      return acc;
    }
    const passID = `${playerID}-${recipientID}`;
    if (!acc[passID]) {
      acc[passID] = {};
      acc[passID].passes = [];
    }
    acc[passID].passes.push(pass);
    return acc;
  }, {})

  res.send({ players: playersWithPassValue, passMap });

  // console.log(groupedByPlayer)
  // console.log(Object.keys(groupedByPlayer).length)


  // return res.send({ foo: "bar" })


  // let uniquePlayersCount = 0;
  // const groupedByPlayer = {};
  // const eligiblePlayerIds = new Set();

  // passesFromThisMatch.forEach(pass => {
  //   const playerId = pass.player_id;
  //   if (!groupedByPlayer[playerId]) {
  //     if (uniquePlayersCount >= 11) {
  //       return;
  //     }
  //     groupedByPlayer[playerId] = [];
  //     eligiblePlayerIds.add(playerId);
  //     uniquePlayersCount++;
  //   }
  //   groupedByPlayer[playerId].push(pass);
  // });

  // let megaObject = {};

  // // console.log(eligiblePlayerIds)
  // passesFromThisMatch.forEach(pass => {
  //   if (eligiblePlayerIds.has(pass.player_id) && eligiblePlayerIds.has(pass.pass_recipient_id)) {
  //     const key = `${pass.player_id}-${pass.pass_recipient_id}`;
  //     if (!megaObject[key]) {
  //       megaObject[key] = {};
  //       megaObject[key].passes = [];
  //     }
  //     megaObject[key].passes.push(pass);
  //   }
  // });
  // const numberOfCombinations = Object.keys(megaObject).length;
  // // console.log(megaObject)
  // const playerAverages = {};

  // for (const playerId in groupedByPlayer) {
  //   const passes = groupedByPlayer[playerId];
  //   let totalX = 0;
  //   let totalY = 0;
  //   let count = 0
  //   const playerName = passes[0].player_name;

  //   passes.forEach(pass => {
  //     count++
  //     totalX += pass.location_x;
  //     totalY += pass.location_y;
  //   });

  //   const avgX = totalX / passes.length;
  //   const avgY = totalY / passes.length;

  //   playerAverages[playerId] = { avg_x: avgX, avg_y: avgY, player_name: playerName, count: count };
  // }

  // res.send({ players: playerAverages, passMap: megaObject });
});

app.get('/api/leaders/:matchID', async (req, res) => {
  const matchID = req.params.matchID;

  //can be "bestPassers" or "bestReceivers"
  const type = req.query.type
  let data = await getData();
  data = JSON.parse(data);
  let passesFromThisMatch = data.passes.filter(pass =>
    matchID === "0" || pass.match_id.toString() === matchID
  );
  const playerObject = groupByPlayer(passesFromThisMatch, type);
  let playersWithPassValue = handlePlayerObject(playerObject, type)
  playersWithPassValue.sort((a, b) => b.averageValueAdded - a.averageValueAdded);
  res.send({ topPlayers: playersWithPassValue.slice(0, 5) })
})

app.get('/api/most-common-combos/:matchID', async (req, res) => {
  const matchID = req.params.matchID;
  let data = await getData();
  data = JSON.parse(data);
  const passesFromThisMatch = data.passes.filter(pass =>
    matchID === "0" || pass.match_id.toString() === matchID
  );
  const result = passesFromThisMatch.reduce((acc, pass) => {
    const playerID = pass.player_id;
    const recipientID = pass.pass_recipient_id;
    const passID = `${playerID}-${recipientID}`;
    if (!playerID || !recipientID) {
      return acc;
    }
    if (!acc.passInfo[passID]) {
      acc.passInfo[passID] = 0;
    }
    acc.passInfo[passID]++;

    if (!acc.playerInfo[playerID]) {
      acc.playerInfo[playerID] = {
        name: pass.player_name
      }
    }
    if (!acc.playerInfo[recipientID]) {
      acc.playerInfo[recipientID] = {
        name: pass.pass_recipient_name
      }
    }
    return acc;
  }, { playerInfo: {}, passInfo: {} })
  // console.log(result.passInfo)
  let passKeys = Object.keys(result.passInfo);
  passKeys.sort((a, b) => result.passInfo[b] - result.passInfo[a]);
  let mostCommonCombos = passKeys.map(key => {
    const [playerID, recipientID] = key.split('-');
    return {
      player: result.playerInfo[playerID].name,
      recipient: result.playerInfo[recipientID].name,
      count: result.passInfo[key]
    }
  })
  res.send({ passCombos: mostCommonCombos.slice(0, 5) })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
