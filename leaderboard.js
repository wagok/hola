var request = require("request")
var url = "https://hola.org/challenges/haggling/scores/standard"
var order = process.argv[2];
var filter = process.argv[3];
if (!filter) {
   filter = 100;
} else {
 try {
   filter = parseInt(filter);
 } catch (e) {
   filter = 100;
 }
}
var comparator;
var printer;
if (order == "-av") {
 comparator = function(a,b) {if (a.av > b.av) {return -1;} if (a.av < b.av) {return 1;} return 0; };
 printer = function(a) {console.log(`${a.date} - ${a.hash} : av: ${Math.round(a.av*100)/100} tv: ${Math.round(a.tv*100)/100} ac: ${Math.round(a.ac*100)/100} total ses: ${a.sessions} agreed ses: ${a.sessions_agreed}`)};
} else if (order == "-tv") {
 comparator = function(a,b) {if (a.tv > b.tv) {return -1;} if (a.tv < b.tv) {return 1;} return 0; };
 printer = function(a) {console.log(`${a.date} - ${a.hash} : tv: ${Math.round(a.tv*100)/100} av: ${Math.round(a.av*100)/100} ac: ${Math.round(a.ac*100)/100} total ses: ${a.sessions} agreed ses: ${a.sessions_agreed}`)};
} else {
 comparator = function(a,b) {if (a.ac > b.ac) {return -1;} if (a.ac < b.ac) {return 1;} return 0; };
 printer = function(a) {console.log(`${a.date} - ${a.hash} : ac: ${Math.round(a.ac*100)/100} tv: ${Math.round(a.tv*100)/100} av: ${Math.round(a.av*100)/100} total ses: ${a.sessions} agreed ses: ${a.sessions_agreed}`)};
}

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        sortandprint(body) // Print the json response
    }
})

function sortandprint(jsonObj) {
  var hashArr = [];
  for (var hash in jsonObj) {
      if (jsonObj.hasOwnProperty(hash)) {
          for (var date in jsonObj[hash]) {
             if (jsonObj[hash].hasOwnProperty(date) && jsonObj[hash][date]["sessions"] >= filter) {
                hashArr.push({
                              "hash": hash,
                              "date": date,
                              "sessions": jsonObj[hash][date]["sessions"],
                              "sessions_agreed": jsonObj[hash][date]["agreements"],
                              "score": jsonObj[hash][date]["score"],
                              "tv": jsonObj[hash][date]["score"] / jsonObj[hash][date]["sessions"],
                              "av": jsonObj[hash][date]["score"] / jsonObj[hash][date]["agreements"],
                              "ac": jsonObj[hash][date]["agreements"] / jsonObj[hash][date]["sessions"] * 100
                              });
             }
          }
      }
  }
  function dateCompare(a,b) {
    if (a.date > b.date)
        return -1;
    if (a.date < b.date)
        return 1;
    return comparator(a,b);
  }

  hashArr.sort(dateCompare);
  for(var i = 0; i < hashArr.length; i++) {
      printer(hashArr[i]);
  }
}
