var fs = require('fs');

var db = require("seraph")({
  user: 'neo4j',
  pass: 'test'
});

// // db.changePassword('test', function(err) {
// //   //password is now changed, and `db`'s options have been updated with the new password
// // });


// db.save({ name: "Test-Man2", age: 40, twitter_id: 12392158 }, function (err, node) {
//   if (err) throw err;
//   console.log("Test-Man inserted.");
// });

// var cypher = ""
//            + "MATCH (n)"
//            + "RETURN n;";
//            // + "ORDER BY n.name";

// db.query(cypher, function(err, results) {
//   if (err) throw err;
//   results.forEach(function (node) {
//     db.delete(node, function(err) {
//       if (err) throw err;
//       console.log("deleted", node);
//     });
//   });
// });

var saveToNodes = function (parent_screen_name, parent_id, screen_name, child_id) {
  fs.readFile('../data/' + parent_screen_name + '_' + screen_name, 'utf8', function (err, data) {
    if (err) return;

    var users = JSON.parse(data).users;

    var nodes = users.map(function (user) {
      if (user.status) {
        if (user.status.coordinates !== null || user.status.place !== null) {
          var node = {};

          node.screen_name = user.screen_name;
          node.geo = user.status.coordinates ? user.status.coordinates.coordinates : user.status.place.bounding_box.coordinates[0][0];
          node.twitter_id = user.id;
          node.followers = user.followers_count;
        }
      }
      return node;
    }).filter(function(user) { return user !== undefined; });

  // save to neo4j
    nodes.forEach(function (node) {

      var cypher = ""
           + "MATCH (n) "
           + "WHERE n.screen_name='" + node.screen_name + "' "
           + "RETURN n;";

      db.query(cypher, function(err, results) {
        if (err) throw err;

        if (results.length > 0) {
          db.relate(child_id, 'follows', results[0].id, function (err, relationship) {
            saveToNodes(screen_name, child_id, results[0].screen_name, results[0].id);
          });
        } else {
          db.save(node, function (err, savedNode) {
            if (err) throw err;

            db.relate(child_id, 'follows', savedNode.id, function (err, relationship) {
              console.log(relationship);
              saveToNodes(screen_name, child_id, savedNode.screen_name, savedNode.id);
            });

          });
        }
      });
    });
  });
};

// db.save({'screen_name': 'KimKardashian', 'geo': [-118.659776, 34.127826], 'twitter_id': 25365536, 'followers': 39046765}, function (err, data) {
//   if (err) throw err;
//   saveToNodes('origin', null, 'KimKardashian', data.id);
// });

// var cypher = ""
//      + "MATCH (n) "
//      + "WHERE n.screen_name='" + 'KimKardashian' + "' "
//      + "RETURN n;";

// db.query(cypher, function(err, results) {
//   if (err) throw err;

//   if (results.length > 0) {
//     saveToNodes('origin', null, 'KimKardashian', results[0].id);
//   } else {
//     db.save({'screen_name': 'KimKardashian', 'geo': [-118.659776, 34.127826], 'twitter_id': 25365536, 'followers': 39046765}, function (err, data) { 
//       if (err) throw err;
//       saveToNodes('origin', null, 'KimKardashian', data.id);
//     });
//   }
// });

var cypher = ""
     + "MATCH (n) "
     + "WHERE n.screen_name='" + 'narendramodi' + "' "
     + "RETURN n;";

db.query(cypher, function(err, results) {
  if (err) throw err;

  if (results.length > 0) {
    saveToNodes('origin', null, 'narendramodi', results[0].id);
  } else {
    db.save({ 'screen_name': 'narendramodi', 'geo': [ 77.2035555, 28.6151554 ], 'twitter_id': 18839785, 'followers': 17359460 }, function (err, data) { 
      if (err) throw err;
      saveToNodes('origin', null, 'narendramodi', data.id);
    });
  }
});


// var cypher = ""
//            + "MATCH (n) "
//            + "WHERE ID(n)=2594 "
//            + "RETURN n;";
//            // + "ORDER BY n.name";
// db.query(cypher, function(err, results) {
//   if (err) throw err;
//   // console.log("results", results);

//   console.log(results);

//   // results.forEach(function (result) {
//   //   db.relationships(result.id, 'all', 'follows', function (err, relationships) {
//   //     console.log(relationships);
//   //   });
//   // });
// });


// db.query(cypher, {id: 2770}, function(err, results) {
//   if (err) throw err;
//   // console.log("results", results);

//   console.log(results);

//   // results.forEach(function (result) {
//   //   db.relationships(result.id, 'all', 'follows', function (err, relationships) {
//   //     console.log(relationships);
//   //   });
//   // });
// });


// var cypher = ""
//      + "MATCH (n) "
//      + "WHERE n.screen_name=" + "'awdad' "
//      + "RETURN n;";
//      // + "ORDER BY n.name";
// db.query(cypher, function(err, results) {
//   if (err) throw err;
//   // console.log("results", results);

//   console.log(Array.isArray(results));
//   console.log(results.length);

//   // results.forEach(function (result) {
//   //   db.relationships(result.id, 'all', 'follows', function (err, relationships) {
//   //     console.log(relationships);
//   //   });
//   // });
// });