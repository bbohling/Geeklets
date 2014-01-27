#!/usr/bin/env node

// Drag-n-drop a Shell geeklet onto your desktop
// Execute this script by adding Command to Geeklet
// pathToNode/node pathToThisScript/strava.js
// E.g., /usr/local/Cellar/node/0.10.22/bin/node /Users/me/Code/github/Geeklets/strava.js

var fs = require('fs');
var request = require('request');
var _ = require('lodash-node');
var moment = require('moment');
var ping = require('ping');

var proxy = 'ENTER_PROXY_IF_NECESSARY';
var stravaAccessToken = 'ENTER_YOUR_STRAVA_ACCESS_TOKEN';
var options = {
    url: 'https://www.strava.com/api/v3/activities?access_token=' + stravaAccessToken + '&per_page=200&after=1388563200',
};

var content = '2014 STRAVA DATA\r';
//content += '–––––––——–––––––––––––––––––––\r';

var init = function() {
  // check if we have external URL access
  ping.sys.probe('google.com', function(isAlive) {
    if (!isAlive) {
      // if not, use proxy to get data
      options.proxy = proxy;
    }
    getData(options);
  });
};

var getData = function() {
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      processData(body);
    } else {
      // there was an error, try using proxy server
      console.log('Error:: ' + error);
      content = 'Failed. ' + response.statusCode;
    }
    outputContent(content);
  });
};

var processData = function(body) {

  var results = JSON.parse(body);

  // total rides
  content += 'rides:\t\t' + results.length + '\r';

  // miles
  var distances = _.pluck(results, 'distance');
  var meters = _.reduce(distances, function(sum, num) {
    return sum + num
  });
  var miles = (meters > 0) ? numberWithCommas(Math.ceil(meters / 1609.34)) : 0;
  content += 'miles:\t\t' + miles + '\r';

  // average miles per day
  var day = moment().dayOfYear();
  var avg = miles / day
  content += 'avg/day:\t' + Math.round(avg * 10) / 10 + '\r';

  // climbing
  var climbing = _.pluck(results, 'total_elevation_gain');
  var climbingMeters = _.reduce(climbing, function(sum, num) {
    return sum + num
  });
  var climbingFeet = (climbingMeters > 0) ? numberWithCommas(Math.ceil(climbingMeters / 0.3048)) : 0;
  content += 'climbing:\t' + climbingFeet + '\r';

  // calories
  var calories = _.pluck(results, 'calories');
  var cals = _.reduce(calories, function(sum, num) {
    return sum + num
  });
  var totalCals = (cals > 0) ? numberWithCommas(Math.ceil(cals)) : 0;
  content += 'calories:\t' + totalCals + '\r';

  // moving time
  var times = _.pluck(results, 'moving_time');
  var time = _.reduce(times, function(sum, num) {
    return sum + num
  });
  var minutes = time / 60;
  var movingTime = (minutes > 0) ? minutesToStr(minutes) : 0;
  content += 'time:\t\t' + movingTime + '\r';

};

// HELPERS
var numberWithCommas = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var outputContent = function(data) {
  console.log(data);
};

var minutesToStr = function(minutes) {
  var sign = '';
  if (minutes < 0) {
    sign = '-';
  }

  var hours = leftPad(Math.floor(Math.abs(minutes) / 60));
  var minutes = leftPad(Math.abs(minutes) % 60);

  return sign + hours + 'hrs ' + Math.floor(minutes) + 'min';

};

var leftPad = function(number) {
  return ((number < 10 && number >= 0) ? '0' : '') + number;
};
// END HELPERS

init();

