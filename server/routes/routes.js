// Setup dependences
var express = require('express');
var router = express.Router();
var path = require('path');
var twitterApiController = require('../controllers/twitterApiController.js');
var UserController = require('../controllers/userController.js');
var passport = require('passport');
var graphDB = require('../db/graphdb.js');

var isLoggedIn = function(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/signup');
};

/* GET Request for index page. */
router.get('/', isLoggedIn, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../../client/views/index.html'));
});

// Login Route for O-Auth
router.get('/auth/twitter', passport.authenticate('twitter'));

// Login Callback From Twitters O-Auth
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/auth/twitter' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// Logout Route
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/signup');
});

// Handle GET request to Twitter API
router.get('/api/tweets/:category', function(req, res) {
  console.log('Received GET request from client:', req.params);
  // Using req.query, provide the query by client and the number of tweets to get
  twitterApiController.getTweets(req.params.category, 100, function(err, data) {
    // ** Reject data that doesn't have a location ** !!! Need to do this
    if (err) {
      console.log('Error getting data from Twttier API');
      throw new Error(err);

    } else {
      console.log(data.statuses)
      //create an empty scrubbedTweetData array.
      var scrubbedTweetData = [];
      //loop through each tweetObject returned from the twitter API...
      data.statuses.forEach(function(tweetObject){
        //if tweet object has a 'truthy' time_zone or coordinates property...
        if(tweetObject['geo'] || tweetObject['coordinates']){
          //then create a scrubbedTweetObject containing most salient info...
          var scrubbedTweetObject = {
             name: tweetObject.user['name'],
             handle: tweetObject.user['screen_name'],
             verified: tweetObject.user['verified'],
             createdAt: tweetObject.user['created_at'],
             description: tweetObject.user['description'],
             url: tweetObject.user['url'],
             followers_count: tweetObject.user['followers_count'],
             friends_count: tweetObject.user['friends_count'],
             timezone: tweetObject.user['time_zone'],
             coordinates: tweetObject['coordinates'],
             geo: tweetObject['geo'],
             place: tweetObject['place'],
             tweetText: tweetObject['text'],
             retweet_count: tweetObject['retweet_count'],
             favorite_count: tweetObject['favorite_count']
          };
          console.log(scrubbedTweetObject);
          //and push the scrubbed object to scrubbedTweetData.
          scrubbedTweetData.push(scrubbedTweetObject);
        }
      });

      //once data has been scrubbed, send it back up to the client side!
      res.json(scrubbedTweetData);
    }
  });

});

// Handle PUT request to /api/users (to change favorites)
router.put('/api/users/:username', function(req, res) {
  console.log('Recevied PUT request from client', req.body);
  var favorites = req.body.favorites;
  UserController.addFavorite(req.params.username, favorites, function(response) {
    console.log('Successfully updated favorites');
    res.sendStatus(200);
  });

});

router.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname, '../../client/views/signup.html'));
});

router.get('/data/:username', function (req, res) {
  graphDB.fetchRelationships(req.params.username, function (data) {
    res.end(JSON.stringify(data));
  });
});

module.exports = router;
