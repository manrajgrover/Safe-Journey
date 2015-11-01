var Future=Npm.require("fibers/future");
var twitter = new TwitterApi();
Meteor.methods({
  postTwitter: function(text){
    var options = {
      consumer_key: Meteor.settings.consumer_key,
      consumer_secret: Meteor.settings.consumer_secret,
      access_token_key: Meteor.user().services.twitter.accessToken,
      access_token_secret: Meteor.user().services.twitter.accessTokenSecret
    }
    var client = new Twitter(options);
    Twitter.postAsync(client, 'statuses/update', {status: text},  function(error, tweet, response){
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