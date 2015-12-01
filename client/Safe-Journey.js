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
    Meteor.call('getLocation',lat,long, function(err, result){
      if(err){
        $("#tweetit").text("Please allow us to access your location!");
      }
      else{
        $("#locationText").text("Your location is:");
        $("#tweetit").text(result[0].data.results[0].formatted_address);
        Session.set("address", result[0].data.results[0].formatted_address);
        $("#location").show();
      }
    });
  }
});
Template.user.helpers({
  screenName: function(){
    Meteor.call('getScreenName',function(err, result){
      console.log(result)
      if(err){
        return false;
      }
      else{
        Session.set('screenName', result);
      }
    });
    return Session.get("screenName");
  }
});
Session.setDefault('watching', true);
Session.setDefault('shakesCount', 0);
Session.setDefault('sensitivity', 15);
onShake = _.debounce(function onShake() {
  var term = "#Need #help! Current #position at "+Session.get("address");
  $("#tweetit").text("Tweeting: "+ term);
  Meteor.call('postTwitter', term, function(err, result){
    if(!err){
      $("#tweetit").text("Tweeted: "+ term);
    }
    else{
       $("#tweetit").text("Error tweeting it!");
    }
  });
}, 750, true);

