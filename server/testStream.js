var fs = require('fs');
var config = require('../config')
var Twit = require('twit');

var T = new Twit(config.twitter);

// var tweetStream = fs.createReadStream(T.stream('statuses/sample'));
//      tweetStream.on('data', function(chunk) {
//       data += chunk;
//      });


// var stream = T.stream('statuses/filter', {'locations':[-122.75,36.8,-121.75,37.8]})
var w = fs.createWriteStream('./data/stream', {flags:'w'});

// stream.on('tweet', function (tweet) {
//   w.write(JSON.stringify(tweet) + '\n');
// })

// T.get('statuses/user_timeline', { screen_name: 'dan_abramov', count: 200 },  function (err, data, response) {
//   if (err) throw err;
//   console.log(data);
//   T.get('application/rate_limit_status',  function (err, data, response) {
//     if (err) throw err;
//     console.log(data);
//     w.write(JSON.stringify(data));
//   });
// });

// var getFriends = function(screen_name, depth, parent) {
//   setTimeout(function () {
//     if (depth < 3) {
//       var writeTo = fs.createWriteStream('./data/' + parent + '_' + screen_name, {flags: 'w'});
//       T.get('followers/list', { screen_name: screen_name, count: 200 },  function (err, data, response) {
//         if (err) {
//           console.log(err);
//         } else {

//           writeTo.write(JSON.stringify(data));

//           var topFour = data.users.sort(function (a, b) {
//             return b.followers_count - a.followers_count;
//           }).splice(0, 2);

//           topFour.forEach(function (user) {
//             getFriends(user.screen_name, depth + 1, screen_name);
//           });
//         }
//       });
//     }
    
//   }, Math.random() * 5);
// };

// getFriends('dan_abramov', 0, 'origin');

T.get('application/rate_limit_status',  function (err, data, response) {
  if (err) throw err;
  console.log(data);
  w.write(JSON.stringify(data));
});