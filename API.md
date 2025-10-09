base url: http://fredericosilva.net:8081/

// tournaments
padely/events
[
    {
    "id": string // "e48213bf-645a-38fd-aebf-1aaeed992a96",
    "name": string // "FIP SILVER AUSTRALIAN PADEL OPEN",
    "startDate": string // "02/01/2025",
    "endDate": string // "05/01/2025",
    "href": string // "https://www.padelfip.com/events/fip-silver-australian-padel-open-2025/",
    "matchscorerlive": string // "https://widget.matchscorerlive.com/screen/oopbyday/FIP-2025-0125/1?t=tol",
    "type": string // "fip-tour-silver",
    "cover": string // "https://www.padelfip.com/wp-content/uploads/2024/11/AUSTRALIAN-PADEL-OPEN_Poster@05x-212x300.jpg",
    "eventId": string // "0125"
  }
]

//jogos do dia
padely/event?id=ebfa3d6b-64f6-38b4-89df-20deffe46233&day=6
[
  {
    "matchId": string // "WD014",
    "courtName": string // "CENTRE COURT",
    "team1": {
      "player1": {
        "name": string // "A. Salazar Bengoechea",
        "flag": string // "https://widget.matchscorerlive.com/images/flags/ESP.jpg"
      },
      "player2": {
        "name": string // "M. Calvo Santamaria (7)",
        "flag": string // "https://widget.matchscorerlive.com/images/flags/ESP.jpg"
      },
      "points": string // "",
      "set1": string // "6",
      "set2": string // "4",
      "set3": string // "6",
      "isWinner": boolean // true,
      "isServing": boolean // false
    },
    "team2": {
      "player1": {
        "name": string // "M. Fassio Goyeneche",
        "flag": string // "https://widget.matchscorerlive.com/images/flags/ARG.jpg"
      },
      "player2": {
        "name": string // "C. Orsi",
        "flag": string // "https://widget.matchscorerlive.com/images/flags/ITA.jpg"
      },
      "points": string // "",
      "set1": string // "2",
      "set2": string // "6",
      "set3": string // "2",
      "isWinner": boolean // false,
      "isServing": boolean // false
    },
    "startDate": string // "7:30 AM",
    "roundName": string // "Women Round of 16"
  }
]

//match stats
padely/match_stats?eventId=4902&matchId=WD014

{
  "match": {
    "team1Stats": {
      "match": {
        "totalPointsWon": "57%",
        "breakingPointsConverted": "58%",
        "longestStreak": "9"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "66%",
        "wonOnSecondServe": "43%",
        "serviceGames": "13"
      },
      "returnStats": {
        "wonOnFirstReturn": "52%",
        "wonOnSecondReturn": "58%",
        "returnGames": "13"
      },
      "totalPoints": {
        "totalWonOnServe": "62%",
        "totalWonOnReturn": "53%"
      }
    },
    "team2Stats": {
      "match": {
        "totalPointsWon": "43%",
        "breakingPointsConverted": "40%",
        "longestStreak": "5"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "48%",
        "wonOnSecondServe": "42%",
        "serviceGames": "13"
      },
      "returnStats": {
        "wonOnFirstReturn": "34%",
        "wonOnSecondReturn": "57%",
        "returnGames": "13"
      },
      "totalPoints": {
        "totalWonOnServe": "47%",
        "totalWonOnReturn": "38%"
      }
    }
  },
  "set1": {
    "team1Stats": {
      "match": {
        "totalPointsWon": "63%",
        "breakingPointsConverted": "60%",
        "longestStreak": "7"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "65%",
        "wonOnSecondServe": "40%",
        "serviceGames": "4"
      },
      "returnStats": {
        "wonOnFirstReturn": "63%",
        "wonOnSecondReturn": "100%",
        "returnGames": "4"
      },
      "totalPoints": {
        "totalWonOnServe": "60%",
        "totalWonOnReturn": "67%"
      }
    },
    "team2Stats": {
      "match": {
        "totalPointsWon": "37%",
        "breakingPointsConverted": "50%",
        "longestStreak": "2"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "37%",
        "wonOnSecondServe": "0%",
        "serviceGames": "4"
      },
      "returnStats": {
        "wonOnFirstReturn": "35%",
        "wonOnSecondReturn": "60%",
        "returnGames": "4"
      },
      "totalPoints": {
        "totalWonOnServe": "33%",
        "totalWonOnReturn": "40%"
      }
    }
  },
  "set2": {
    "team1Stats": {
      "match": {
        "totalPointsWon": "47%",
        "breakingPointsConverted": "40%",
        "longestStreak": "6"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "52%",
        "wonOnSecondServe": "40%",
        "serviceGames": "5"
      },
      "returnStats": {
        "wonOnFirstReturn": "43%",
        "wonOnSecondReturn": "50%",
        "returnGames": "5"
      },
      "totalPoints": {
        "totalWonOnServe": "50%",
        "totalWonOnReturn": "45%"
      }
    },
    "team2Stats": {
      "match": {
        "totalPointsWon": "53%",
        "breakingPointsConverted": "75%",
        "longestStreak": "5"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "57%",
        "wonOnSecondServe": "50%",
        "serviceGames": "5"
      },
      "returnStats": {
        "wonOnFirstReturn": "48%",
        "wonOnSecondReturn": "60%",
        "returnGames": "5"
      },
      "totalPoints": {
        "totalWonOnServe": "55%",
        "totalWonOnReturn": "50%"
      }
    }
  },
  "set3": {
    "team1Stats": {
      "match": {
        "totalPointsWon": "63%",
        "breakingPointsConverted": "100%",
        "longestStreak": "9"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "84%",
        "wonOnSecondServe": "50%",
        "serviceGames": "4"
      },
      "returnStats": {
        "wonOnFirstReturn": "50%",
        "wonOnSecondReturn": "50%",
        "returnGames": "4"
      },
      "totalPoints": {
        "totalWonOnServe": "78%",
        "totalWonOnReturn": "50%"
      }
    },
    "team2Stats": {
      "match": {
        "totalPointsWon": "37%",
        "breakingPointsConverted": "0%",
        "longestStreak": "5"
      },
      "serve": {
        "aces": "0",
        "doubleFaults": "0",
        "wonOnFirstServe": "50%",
        "wonOnSecondServe": "50%",
        "serviceGames": "4"
      },
      "returnStats": {
        "wonOnFirstReturn": "16%",
        "wonOnSecondReturn": "50%",
        "returnGames": "4"
      },
      "totalPoints": {
        "totalWonOnServe": "50%",
        "totalWonOnReturn": "22%"
      }
    }
  },
  "duration": "01:46:17"
}

//rankings men/women
padely/ranking?gender=men
[
  {
    "id": "3a7f9c36-855f-4935-bd8a-6235a4bb762a",
    "name": "Agustin Tapia",
    "position": 1,
    "image": "https://www.padelfip.com/wp-content/uploads/2023/02/Agustin-Tapia.png",
    "country": "ARG",
    "flag": "https://www.padelfip.com/wp-content/uploads/2023/02/Argentina_Fip.jpg",
    "points": "19400",
    "handler": "agustin-tapia"
  }
]