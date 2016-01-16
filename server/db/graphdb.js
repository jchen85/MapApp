var db = require("seraph")({
  user: 'neo4j',
  pass: 'test'
});


var fetchRelationships = function (screen_name, successCallback) {
  var cypher = ""
     + "START n=node(*)"
     + "MATCH n-[:follows]-m "
     + "WHERE n.screen_name='" + screen_name + "' OR m.screen_name='" + screen_name + "'"
     + "RETURN n, m";

  db.query(cypher, function (err, results) {
    successCallback(results);
  });
}

module.exports = {
  fetchRelationships: fetchRelationships
};