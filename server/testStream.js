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

var requestQueue = [];

var requestCount = 0;

var handleRequestQueue = function () {
  // if rate limits OK
  if (rateLimitsOK) {
    requestQueue.pop().call()
  } else {
    setTimeout(function() {
      handleRequestQueue()
    }, 30000);
  }
};

var getFriends = function(screen_name, depth, parent) {
  if (requestCount >= 14) {
    console.log('setting time out, request count:', requestCount);
    console.log('Time', new Date().setUTCHours(4));
    setTimeout(function() {
    console.log('starting new 15-minute wait')
      requestCount = 0;
      getFriends(screen_name, depth, parent);
    }, 1100000);
  } else {
    setTimeout(function () {
      if (depth < 10 && requestCount < 15) {
        var writeTo = fs.createWriteStream('./data/' + parent + '_' + screen_name, {flags: 'w'});
        T.get('friends/list', { screen_name: screen_name, count: 200 },  function (err, data, response) {
          requestCount++;
          if (err) {
            console.log(err);
          } else {

            writeTo.write(JSON.stringify(data));

            var topFour = data.users
            .filter(function (user) {
              if (user.status) {
                return user.status.coordinates || user.status.place;
              } else {
                return false;
              }
            })
            .sort(function (a, b) {
              return b.followers_count - a.followers_count;
            })
            .splice(0, 10);

            topFour.forEach(function (user) {
              getFriends(user.screen_name, depth + 1, screen_name);
            });
          }
        });
      } else {
        getFriends(arguments[0], arguments[1], arguments[2]);
      }
      
    }, (Math.random() * 5000) + 1000);
  }
};

getFriends('BarackObama', 0, 'origin');

// T.get('application/rate_limit_status',  function (err, data, response) {
//   if (err) throw err;
//   console.log(data.resources.friends['/friends/list']);
//   console.log(data.resources.followers['/followers/list']);
//   w.write(JSON.stringify(data));
// });