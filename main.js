const search = document.getElementById("search-input");
const matchlist = document.getElementById("match-liste-ul");
const submitbtn = document.getElementById("submit");
matchlist.addEventListener("click", function (e) {
  if (e.target.className === "eintrag") {
    const matchText = e.target.firstElementChild.innerText;
    search.value = matchText;
    removeHTML(matchlist);
  }
  if (e.target.className === "eintrag-header") {
    const matchText = e.target.innerText;
    search.value = matchText;
    removeHTML(matchlist);
  }
});
const getTeams = async () => {
  // Function that gets all teams
  const res = await fetch("https://www.balldontlie.io/api/v1/teams");
  const jsonf = await res.json();
  teams = jsonf.data;
  return teams;
};
const searchTeams = (searchText) => {
  // Get matches to current text input
  let matches = teams.filter((team) => {
    const regex = new RegExp(`^${searchText}`, "gi"); // Compare if input matches
    return team.full_name.match(regex) || team.name.match(regex); // Return array if name or fullname matches regex
  });
  if (searchText.length === 0) {
    matches = [];
    removeHTML(matchlist);
  }
  outputSearch(matches);
};

const outputSearch = (matches) => {
  if (matches.length > 0) {
    const html = matches
      .map(
        (match) => `
        <div class="eintrag">
        <p class="eintrag-header">${match.full_name}</p>
        <span class='abbreviation'> <b>(${match.abbreviation})</b>
        </span>
        </div> 
        `
      )
      .join("");
    matchlist.innerHTML = html;
  }
};

function today() {
  const today = new Date();
  let month = today.getMonth() + 1; // Month startet mit Januar=0, also +1
  if (month < 10) month = `0${month}`; // mit 0 auffüllen wenn 1 Ziffer
  let day = today.getDate(); // mit 0 auffüllen wenn 1 Ziffer
  if (day < 10) day = `0${day}`;
  const format = `${today.getFullYear()}-${month}-${day}`;
  return format;
}

function newElement(element) {
  const ele = document.createElement(element);
  return ele;
}

function removeHTML(element) {
  element.innerHTML = "";
}
function getIdTeam() {
  return (promise = teams.filter((team) => {
    let teamname = search.value;
    if (team.full_name.match(teamname)) return team;
  }));
}
function validateForm(){
  if (search.value.length === 0) return alert("Please select a team first!");
  if (document.querySelector(".start-date").value.length === 0) return alert("Please select a start date first!");
  if (document.querySelector(".start-date").value.length === 0) return alert("Please select an end date first!");
  return 1;
}
submitbtn.addEventListener("click", function () {
  if (validateForm()!== 1) return;
  removeHTML(document.querySelector(".game-list"));
  const teamid = getIdTeam()[0].id;
  const urlgame = `
  https://www.balldontlie.io/api/v1/games?start_date=${document.querySelector(".start-date").value}
  &end_date=${document.querySelector(".end-date").value}
  &team_ids[]=${teamid}
  &per_page=${document.querySelector(".game-number").value}
  `;
  const getGame = async () => {
    try {
      const res = await fetch(urlgame);
      const jsonf = await res.json();
      const games = jsonf.data;
      if (games.length < 1) alert("No games found in the selected timeframe!");
      games.sort((a, b) => (a.date > b.date ? 1 : -1));
      let ul = document.querySelector(".game-list");
      for (const iterator of games) {
        let li = newElement("li");
        document.querySelector(".game-list-container").appendChild(ul);
        ul.appendChild(li);
        // const hometeam = document.createTextNode(
        //   `Date: ${iterator.date}
        //    Home Team:${iterator.home_team.name} ${iterator.home_team_score} vs`
        // );
        // const awayteam = document.createTextNode(
        //   ` ${iterator.visitor_team_score} Away Team:${iterator.visitor_team.name}`
        // );
        const formatDate = iterator.date.toString().slice(0, 10);
        if (iterator.home_team_score > iterator.visitor_team_score) {
          var text = `
      <div class="date">${formatDate}</div>
      <div class="teamrows">
      <div class="teamrow">
      <span class="team-name team-winner">
      ${iterator.home_team.name}</span> <span class="score winner">${iterator.home_team_score}</span> </br> </div>
      <div class="teamrow">
      <span class="team-name">${iterator.visitor_team.name}</span> <span class="score">${iterator.visitor_team_score}</span> </div>
      </div>
      <div class="bottom-container">
      <a href="https://www.youtube.com/results?search_query=${iterator.home_team.full_name} vs ${iterator.visitor_team.full_name} ${formatDate}" class="youtube-link" target="_blank">Search<i class="fa fa-youtube-square" aria-hidden="true"></i>
      </a> </div>
      `;
        } else {
          text = `
      <div class="date">${formatDate}</div>
      <div class="teamrows">
      <div class="teamrow">
      <span class="team-name">
      ${iterator.home_team.name}</span> <span class="score">${iterator.home_team_score}</span> </br> </div>
      <div class="teamrow">
      <span class="team-name team-winner">${iterator.visitor_team.name}</span> <span class="score winner">${iterator.visitor_team_score}</span> </div>
      </div>
      <div class="bottom-container">
      <a href="https://www.youtube.com/results?search_query=${iterator.home_team.full_name} vs ${iterator.visitor_team.full_name} ${formatDate}" class="youtube-link" target="_blank">Search<i class="fa fa-youtube-square" aria-hidden="true"></i>
      </a> </div>
      `;
        }
        li.innerHTML = text;
      }
      // li.appendChild(hometeam);
      // li.appendChild(awayteam);
    } catch (err) {
      throw Error("Failed to fetch: " + err);
    }
  };
  getGame();
});
search.addEventListener("input", () => searchTeams(search.value));
window.addEventListener("load", getTeams());
