// Setup server dependencies
var express = require('express');
var path = require('path');
var favicon = require('favicon');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require("passport");
var session = require('express-session');
var TwitterStrategy =  require("passport-twitter").Strategy;
var routes = require('./routes/routes.js');
var socketio = require('socket.io');
var TwitterAPI = require('./controllers/twitterApiController.js');
var textSearch = require('./textSearch.js');
var fs = require('fs');

// **Important password and keys **
if(!process.env.CONSUMER_KEY){
  var KEYS = require('../config.js');
}

// Setup server to listen on process.en.PORT delegating to port 3000
var port = 3000;
// var key = process.env.DB_USER || KEYS.user;
// var db_pass = process.env.DB_PASSWORD || KEYS.password;

//init socketStream to null
var stream = null;
var twitterTopic ;
// ** NEED TO IMPLEMENT Setup server to listen to MongoLab URI delegating to local db 
var mapDB = process.env.MONGOLAB_URI || 'mongodb://localhost/MapApp';
mongoose.connect(mapDB);

// Set Up Authorization 
var Auth = require('./auth/auth.js');
Auth.initialize();


// Setup app and routing
var app = express();

// Use Session Middleware
app.use(session({
  secret:'Keyboard Cat',
  saveUninitialized: false,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());


// Set up middleware stack
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));


/* Routes */
app.use('/', routes);

//socket.io code below

var server = app.listen(port);  
console.log('App listening on ' + port);

var io = socketio.listen(server);

// Create web socket connection
io.sockets.on('connection', function(socket) {
 socket.on('tweet flow', function() {

   if (stream === null) {
     stream = true;
     console.log('connected');
    
      TwitterAPI.streamTweets(twitterTopic, function(data) {

        if(data.user.geo_enabled){
          if(data.coordinates !== null || data.place.bounding_box.coordinates !== null){
            
            var tweetObject = data;
            var topicExists;

            //looking for search term within the text of the tweet
            if(twitterTopic !== undefined) {
              topicExists = textSearch.findTwitterTopic(twitterTopic, tweetObject.text);
            }
            //creating an object with useful properties
            if (twitterTopic === undefined || topicExists === true) {
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
                geo: tweetObject['geo'] || tweetObject['place']['bounding_box']['coordinates'][0],
                place: tweetObject['place'],
                tweetText: tweetObject['text'],
                tweetTime: tweetObject['created_at'],
                retweet_count: tweetObject['retweet_count'],
                favorite_count: tweetObject['favorite_count']
              };

              // emit to client and send back tweet object
              socket.broadcast.emit("tweet-stream", scrubbedTweetObject);
              socket.emit("tweet-stream", scrubbedTweetObject);

              //changing twitterTopic to return new data related to twitterTopic mid-stream
              //below causes a memory leak (global variable)
              // socket.on('filter', function(topic) {
              //   twitterTopic = topic;
              // });
            }
            //Tweet Object that has been scrubbed for relevant data 

          } else {

          }
        }
      });
    }
  });
  socket.on("disconnect", function() {
    console.log('disconnected');
  });
  socket.emit("connected");
});

module.exports = app;
