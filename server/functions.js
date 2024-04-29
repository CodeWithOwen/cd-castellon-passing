const path = require('path');
const fs = require('fs');

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

function groupByPlayer(array, type = "bestPassers") {
  const groupedByPlayer = {};
  array.forEach(item => {
    const playerId = type === "bestPassers" ? item.player_id : item.pass_recipient_id;
    if (!groupedByPlayer[playerId]) {
      groupedByPlayer[playerId] = [];
    }
    groupedByPlayer[playerId].push(item);
  });
  return groupedByPlayer;
}

function handlePlayerObject(playerObject, type = "bestPassers") {
  let a = []
  for (const playerId in playerObject) {
    let o = {}
    let playerName = type === "bestPassers" ? playerObject[playerId][0].player_name : playerObject[playerId][0].pass_recipient_name
    let totalValueAdded = 0
    let totalPasses = 0
    let totalXCoordinate = 0
    let totalYCoordinate = 0
    playerObject[playerId].forEach(pass => {
      totalXCoordinate += pass.location_x
      totalYCoordinate += pass.location_y
      totalValueAdded += pass.obv_added
      totalPasses += 1
    })
    const averageXCoordinate = totalXCoordinate / totalPasses
    const averageYCoordinate = totalYCoordinate / totalPasses
    const averageValueAdded = totalValueAdded / totalPasses
    o.id = playerId
    o.x = averageXCoordinate
    o.y = averageYCoordinate
    o.totalPasses = totalPasses
    o.averageValueAdded = averageValueAdded
    o.name = playerName
    a.push(o)
  }
  return a
}

module.exports = {
  getData,
  getUniqueMatchIds,
  formatDate,
  groupByPlayer,
  handlePlayerObject
};