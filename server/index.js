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
  //assuming that the matches are in the same order as the matchIDs show up in the formation_players array
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

  //if matchID is 0, we want passes from all matches
  //we only want passes from the Castellon team
  let passesFromThisMatch = data.passes.filter(pass =>
    matchID === "0" || pass.match_id.toString() === matchID
  ).filter(pass => pass.team_id === cdCastellonTeamId);

  //make sure that the passes have all the necessary fields
  passesFromThisMatch = passesFromThisMatch.filter(pass => pass.player_id && pass.pass_recipient_id && pass.location_x && pass.location_y && pass.obv_added);

  //get an object with player_id as key and an array of made passes as value
  const groupedByPlayer = groupByPlayer(passesFromThisMatch);

  //get an array of player objects with totalPasses, averageValueAdded, and other fields
  let playersWithPassValue = handlePlayerObject(groupedByPlayer)
  playersWithPassValue.sort((a, b) => b.totalPasses - a.totalPasses);

  //get "top 11" players
  playersWithPassValue = playersWithPassValue.slice(0, 11);
  const eligiblePlayerIds = new Set(playersWithPassValue.map(player => player.id));

  //get a map of passes between eligible players
  //keys are playerID-recipientID
  //values are arrays of passes
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
});

app.get('/api/leaders/:matchID', async (req, res) => {
  const matchID = req.params.matchID;

  //can be "bestPassers" or "bestReceivers"
  const type = req.query.type
  let data = await getData();
  data = JSON.parse(data);

  let passesFromThisMatch = data.passes.filter(pass =>
    matchID === "0" || pass.match_id.toString() === matchID
  ).filter(pass => pass.team_id === cdCastellonTeamId).filter(pass => pass.obv_added);

  //get an object with player_id as key and an array of received passes as value
  const groupedByPlayer = groupByPlayer(passesFromThisMatch, type);

  //get an array of player objects with totalPasses, averageValueAdded, and other fields
  let playersWithPassValue = handlePlayerObject(groupedByPlayer, type)
  playersWithPassValue.sort((a, b) => b.averageValueAdded - a.averageValueAdded);
  res.send({ topPlayers: playersWithPassValue.slice(0, 5) })
})

app.get('/api/most-common-combos/:matchID', async (req, res) => {
  const matchID = req.params.matchID;
  let data = await getData();
  data = JSON.parse(data);

  const passesFromThisMatch = data.passes.filter(pass =>
    matchID === "0" || pass.match_id.toString() === matchID
  ).filter(pass => pass.team_id === cdCastellonTeamId);

  //pust as passes between passer-reciever combos and stores player names
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

  let passKeys = Object.keys(result.passInfo);
  //sort descending
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
