if (Meteor.isServer) {
  var Future=Npm.require("fibers/future");
  var twitter = new TwitterApi();
  Meteor.methods({
    postTwitter: function(text){
      var options = {
        consumer_key: "get your own key",
        consumer_secret: "get your own key",
        access_token_key: Meteor.user().services.twitter.accessToken,
        access_token_secret: Meteor.user().services.twitter.accessTokenSecret
      }

      var client = new Twitter(options);
      Twitter.postAsync(client, 'statuses/update', {status: 'text'},  function(error, tweet, response){
        if(error) throw error;
      });
    },
    getLocation: function(lat,long){
      var urls = ["http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+long];
      var range = _.range(urls.length);
      var futures = _.map(range,function(index){
        var future = new Future();
        HTTP.get(urls[index],function(error,result){
          future.return(result);
        });
        return future;
      });
      var results = _.map(futures,function(future,index){
        var result=future.wait();
        return result;
      });
      return results;
    }
  });
}

if (Meteor.isClient) {
  Meteor.startup(function () {
    if (shake && typeof shake.startWatch === 'function') {
      shake.startWatch(onShake, Session.get('sensitivity'));
    } else {
      alert('Shake not supported');
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successFunction);
    } else {
      alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
    }
    function successFunction(position) {
      var lat = position.coords.latitude;
      var long = position.coords.longitude;
      console.log(lat+" "+long);
      Meteor.call('getLocation',lat,long, function(err, result){
        if(!err){
          Session.set("address", result[0].data.results[0].formatted_address);
        }
      });
    }
  });
  Session.setDefault('watching', true);
  Session.setDefault('shakesCount', 0);
  Session.setDefault('sensitivity', 15);
  onShake = _.debounce(function onShake() {
    var term = "Need help! Current position at "+Session.get("address");
    Meteor.call('postTwitter', term, function(err, result){
      if(!err){
        if (result.statusCode === 200){ 
          console.log(result.data);
        }
      }
    });
  }, 750, true);
}

