var db = require("seraph")({
  user: 'neo4j',
  pass: 'test'
});


var fetchRelationships = function (screen_name, successCallback) {
  var cypher1 = ""
     + "START n=node(*)"
     + "MATCH n-[:follows]-m "
     + "WHERE n.screen_name='" + screen_name + "' OR m.screen_name='" + screen_name + "'"
     + "RETURN n, m";

  var cypher2 = ""
     + "START n=node(*)"
     + "MATCH n-[:follows]-m "
     + "WHERE n.screen_name='" + screen_name + "'"
     + "RETURN n, m";

  var cypherOne = ""
     + "MATCH n "
     + "WHERE n.screen_name='" + screen_name + "'"
     + "RETURN n";

  var finalResults = {};

  var fetchRecurse = function(screen_name) {
    db.query(cypherOne, function (err, rootNode) {

      db.query(cypher2, function (err, results) {
        var level = [];
        var usedNames = [];

        results.forEach(function (friend) {
          usedNames.push(friend.m.screen_name);
          level.push({n: rootNode[0], m: friend.m});
          level.push({m: rootNode[0], n: friend.m});
        });

        finalResults.resultsLevel = level;
        finalResults.currentFriends = usedNames;

        successCallback(finalResults);
      });
      
    });

  }

  // var fetchRecurse = function (screen_name, successCallback) {
  //   if (usedNames.length === 0) {
  //     usedNames.push(screen_name); 
  //   }
  //   db.query(cypher1, function (err, results) {
  //     finalResults.push(results);

  //     db.query(cypher2, function (err, nextResults) {
  //       nextResults.forEach(function(row) {
  //         if (row.m.screen_name && usedNames.indexOf(row.m.screen_name) === -1) {
  //           usedNames.push(row.m.screen_name);
  //           fetchRecurse(row.m.screen_name, successCallback);
  //         }
  //       });
  //     });
  //   });
    
  // };

  fetchRecurse(screen_name, successCallback);

}

module.exports = {
  fetchRelationships: fetchRelationships
};