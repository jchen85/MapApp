var fs = require('fs');
var config = require('../config')
var Twit = require('twit');

var T = new Twit(config.twitter);

// var tweetStream = fs.createReadStream(T.stream('statuses/sample'));
//      tweetStream.on('data', function(chunk) {
//       data += chunk;
//      });


var stream = T.stream('statuses/sample');
// var w = fs.createWriteStream('./data/stream', {flags:'w'});

stream.on('tweet', function (tweet) {
  // w.write(JSON.stringify(tweet) + '\n');
  var targets = ['KimKardashian', 'POTUS', 'iamsrk', 'katyperry', 'justinbieber', 'taylorswift13',
   'barackobama', 'drake', 'theweeknd'];
  tweet.entities.user_mentions.forEach(function (mention) {
    if (targets.indexOf(mention.screen_name) > -1) {
      console.log(tweet); 
    }
  });
});

// T.get('statuses/user_timeline', { screen_name: 'dan_abramov', count: 200 },  function (err, data, response) {
//   if (err) throw err;
//   console.log(data);
//   T.get('application/rate_limit_status',  function (err, data, response) {
//     if (err) throw err;
//     console.log(data);
//     w.write(JSON.stringify(data));
//   });
// });

// var requestCount = 15;

// var getFriends = function(screen_name, depth, parent) {
//   if (requestCount >= 14) {
//     console.log('setting time out, request count:', requestCount);
//     console.log('Time', new Date().setUTCHours(4));
//     setTimeout(function() {
//     console.log('starting new 15-minute wait')
//       requestCount = 0;
//       getFriends(screen_name, depth, parent);
//     }, 1800000);
//   } else {
//     requestCount++;
//     setTimeout(function () {
//       if (depth < 5 && requestCount < 15) {
//         var writeTo = fs.createWriteStream('./data/' + parent + '_' + screen_name, {flags: 'w'});
//         T.get('followers/list', { screen_name: screen_name, count: 200 },  function (err, data, response) {
//           if (err) {
//             console.log(err);
//           } else {

//             writeTo.write(JSON.stringify(data));

//             var topFour = data.users
//             .filter(function (user) {
//               if (user.status) {
//                 return user.status.coordinates || user.status.place;
//               } else {
//                 return false;
//               }
//             })
//             .sort(function (a, b) {
//               return b.followers_count - a.followers_count;
//             })
//             .splice(0, 10);

//             topFour.forEach(function (user) {
//               getFriends(user.screen_name, depth + 1, screen_name);
//             });
//           }
//         });
//       }
      
//     }, (Math.random() * 120000) + 30000);
//   }
// };

// getFriends('KimKardashian', 0, 'origin');

// T.get('/users/lookup', {screen_name: 'POTUS'}, function (err, data, response) {
//   console.log(data);
// });

// T.get('/statuses/user_timeline', {screen_name: 'iamsrk'}, function (err, data, response) {
//   console.log(data[0].coordinates);
// });

// T.get('/friendships/show', {source_id: 153085358, target_id: 180468652 }, function (err, data, response) {
//   console.log(data);
// });

// T.get('application/rate_limit_status',  function (err, data, response) {
//   if (err) throw err;
//   console.log(data.resources.friends['/friends/list']);
//   console.log(data.resources.followers['/followers/list']);
//   w.write(JSON.stringify(data));
// });