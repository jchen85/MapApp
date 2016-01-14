app.controller('mapsPageController', ['$scope', '$http', 'httpService', '$sce', "$timeout", function ($scope, $http, httpService, $sce, $timeout) {

  //////////////////////////////////////////MAPS PAGE CONTROLLER DRIVER//////////////////////////////////////////////

  //create array that will contain data for ALL incoming tweets
  $scope.allTweets = {
    data: []
  };

  //create array that will contain data for ONLY quality/relevant tweets
  $scope.relevantTweets = [];

  //function that will ultimately 
  $scope.favoriteSubmit = function () {
    httpService.sendFavorite($scope.favoriteField);
  };

  //used for relevantTweets
  $scope.addRelevantTweet = function(tweet){
    $scope.relevantTweets.unshift(tweet);
  }

  ////////////////////////////////////////////CREATE AND OPEN SOCKET/////////////////////////////////////////////////////////
  
  var onInit = function() {
    
    ////////////////////////////////ASSUMPTIONS + DRIVERS FOR HANDLING DATA STREAM///////////////////////////////////////////
    
    //establish map drivers
    var maxNumOfTweetsAllowedOnMap = 1000;
    var heatmap = new google.maps.visualization.HeatmapLayer({
      radius: 15
    });
    
    var setMapOnAll = function(map) {
      for (var i = 0; i < $scope.allTweets.data.length; i++) {
        $scope.allTweets.data[i].setMap(map);
      }
    };

    var clearMarkers = function(){
      setMapOnAll(null);
    };
    var deleteMarkers = function() {
      clearMarkers();
      $scope.allTweets.data = [];
    };

    //establish tweet relevancy criteria; 
    var numOfFollowersToBeRelevant = 0;
    var numOfRetweetsToBeRelevant = 0; 
    var maxNumOfRelevantTweetsAllowed = 500000000;


    //////////////////////////////////////////SET UP HEAT MAP///////////////////////////////////////////////////
    $timeout(function(){
      heatmap.setMap(window.map);
    }, 10);
 
    //////////////////////////////////////////CONNECT TO SOCKET///////////////////////////////////////////////
    if(io !== undefined) {
      //connects to socket
      var socket = io.connect();
      //uses socket to listen for incoming tweet stream 
      
      //code is a little buggy, but should offer a good start for doing the following when a search request is submitted:
      // a) clearing the map, b) emitting a filter request to the stream and c) re-starting the heatmap
      // $scope.submitSearch = function () {
      //   deleteMarkers();
      //   heatmap.setMap(null);
      //   socket.emit("filter", $scope.searchField);
      //   console.log($scope.searchField);
      //   heatmap = new google.maps.visualization.HeatmapLayer({
      //     radius: 15
      //   });
      //   heatmap.setMap(window.map);
      // };

      socket.on('tweet-stream', function (data) {

        if($scope.allTweets.data.length > maxNumOfTweetsAllowedOnMap){
          var pinToRemove = $scope.allTweets.data.shift();
          pinToRemove.setMap(null);
        }
        ///////////////////////////////////DETERMINE RELEVANCE/QUALITY OF TWEET//////////////////////////////////
        //set relevant parameters
        var numOfFollowers = data.followers_count;
        var numOfRetweets = data.retweet_count;
        var verifiedAccount = data.verified;
        var tweetObject = {};
        //if incoming tweet meets relevancy criteria...
        if((numOfFollowers >= numOfFollowersToBeRelevant) || (numOfRetweets >= numOfRetweetsToBeRelevant)){
          //then check to see how many relevant tweets are already being displayed on page; if max limit 
          //has already been reached then pop last item out of relevantsTweets array
          if($scope.relevantTweets.length === maxNumOfRelevantTweetsAllowed){
            $scope.relevantTweets.pop();
          }
          //for all incoming tweets that match criteria, create a tweetObject that contains most relevant info for tweet
          //(e.g. handle, content, and time);         
          tweetObject = {
            handle: data.handle,
            text: data.tweetText,
            time: data.tweetTime
          };
          //add latest tweetObject to the beginning of the relevantTweets array;
          $scope.$apply(function() {
            $scope.addRelevantTweet(tweetObject);
          })
        }

        ///////////////////////////////////PLACE ALL INCOMING TWEETS ON MAP///////////////////////////////////////

        var tweetLocation = new google.maps.LatLng(data["coordinates"]["coordinates"][1], data["coordinates"]["coordinates"][0]);
        
        heatmap.data.push(tweetLocation);
        
        var tweetMarker = new google.maps.Marker({
           icon: "client/assets/small-dot-icon.png",
           position: tweetLocation,
           map: window.map
         });

        //determine content added to info window on each marker  
        var tweetContent = '<div>' + data['name'] + ": " + data['tweetText'] + '</div>';
        var markerInfoWindow = new google.maps.InfoWindow({
           content: tweetContent
         });

        //set up listeners for each tweetMarker...
        tweetMarker.addListener('mouseover', function () {
          markerInfoWindow.open(map, tweetMarker);
         });
        tweetMarker.addListener('mouseout', function () {
        markerInfoWindow.close();
         });
        // //set tweet on map...
        tweetMarker.setMap(window.map, tweetLocation, tweetContent);

        $scope.allTweets.data.push(tweetMarker);

      })
      

      socket.on('connected', function (r) {
        console.log('connected client');
        socket.emit('tweet flow');
      })
    };

  };

  onInit();

}]);
