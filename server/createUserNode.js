var fs = require('fs');
var config = require('../config')
var Twit = require('twit');

var T = new Twit(config.twitter);

var createNode = function(screen_name, geo_array, callback) {
  T.get('/users/lookup', {screen_name: screen_name}, function (err, data, response) {
    var node = {};
    node.screen_name = data[0].screen_name;
    node.geo = geo_array;
    node.twitter_id = data[0].id;
    node.followers = data[0].followers_count;
    callback(node);
  });
  
};

module.exports = createNode;



createNode('shakira', [-80.1569261, 25.7960491], function(d) {
  console.log(d);
})

// {'screen_name': 'BarackObama', 'geo': [-77.0376402. 38.8976408], 'twitter_id': 813286, 'followers': 68454789}