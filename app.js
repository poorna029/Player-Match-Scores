const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
module.exports = app;
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
const initializeDBandServer = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server at port 3000 is running");
    });
  } catch (e) {
    console.log(`DBerror : ${e.Message}`);
    process.exit(1);
  }
};
initializeDBandServer();

// list of all players in player table:-----------1

app.get("/players/", async (request, response) => {
  const playersListQuery = `select player_id as playerId,player_name as playerName from player_details;`;
  const playersList = await db.all(playersListQuery);
  response.send(playersList);
  console.log(playersList);
});

// player based on the player ID -----------------2
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `select player_id as playerId,
    player_name as playerName from player_details
     where player_id=${playerId};`;
  const playerDetails = await db.get(getPlayerDetails);
  response.send(playerDetails);
});
// update player based on playerId----------------3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQry = `update player_details set player_name="${playerName}"
    where player_id=${playerId};`;
  const playerUpdate = db.run(updateQry);
  response.send("Player Details Updated");
  console.log("Player Details Updated");
});

// matchDetails basedOn matchId ------------------4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsBasedonMatchId = `select match_id as matchId,
    match,year from match_details where match_id=${matchId};`;
  const matchDetails = await db.get(matchDetailsBasedonMatchId);
  response.send(matchDetails);
  console.log(matchDetails);
});

// list of all matches of a player ----------------5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const listOfMatchesQuery = `select match_details.match_id as
  matchId,match,year from (player_details join
    player_match_score on player_details.player_id=
    player_match_score.player_id)
     as t join match_details on t.match_id=match_details.match_id
     where player_details.player_id=${playerId};`;
  const ListOfMatches = await db.all(listOfMatchesQuery);
  console.log(ListOfMatches);
  response.send(ListOfMatches);
});

// list of players of a specific match-------------6

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const lisOfPlayrsQryOnMatchId = `select player_details.player_id as playerId,
  player_name as playerName from (match_details join
     player_match_score on player_match_score.match_id=
     match_details.match_id) as t join player_details on t.player_id 
     = player_details.player_id where match_details.match_id=${matchId};`;
  const list_of_palyers = await db.all(lisOfPlayrsQryOnMatchId);
  response.send(list_of_palyers);
  console.log(list_of_palyers);
});

// statistics of the total score, fours, sixes------7
//  of a specific player based on the player ID

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const statisticsQuery = `select player_details.player_id as playerId,
  player_name as playerName,sum(score)as totalScore,
  sum(fours) as totalFours,sum(sixes) as totalSixes
   from player_details join 
    player_match_score on player_details.player_id=player_match_score.player_id
    where player_details.player_id=${playerId};`;
  const statistics = await db.get(statisticsQuery);
  //   console.log(statistics);
  response.send(statistics);
});
