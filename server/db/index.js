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
      db.save(node, function (err, savedNode) {
        if (err) throw err;

        db.relate(child_id, 'follows', savedNode.id, function (err, relationship) {
          console.log(relationship);
        });

        saveToNodes(screen_name, child_id, savedNode.screen_name, savedNode.id)
      });

    });
  });
    //double chck
};

db.save({'screen_name': 'KimKardashian', 'geo': [-118.659776, 34.127826], 'twitter_id': 25365536, 'followers': 39046765}, function (err, data) {
  if (err) throw err;
  saveToNodes('origin', null, 'KimKardashian', data.id);
});


// var cypher = ""
//            + "MATCH (n)"
//            + "RETURN n;";
//            // + "ORDER BY n.name";
// db.query(cypher, function(err, results) {
//   if (err) throw err;
//   console.log("results", results);
//   results.forEach(function (result) {
//     db.relationships(result.id, 'all', 'follows', function (err, relationships) {
//       console.log(relationships);
//     });
//   });
// });