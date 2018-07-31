const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');

const auth = require('./helpers/auth');
const DateLog = require('../models/dateLog');
const date_log = require('./dateLog')
const User = require('../models/user');
const Location = require('../models/location');
const Weather = require('../models/weather');

function setToday(){
  let n = new Date();
  let y = n.getFullYear();
  let m = n.getMonth();
  let d = n.getDate();

  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var newMonth = month[m];
  let ans = newMonth + " " + d + " " + y;
  return ans;
}

// Main page which shows current location details at the start,
// After submitting input, shows new location details at main page.
router.post('/', auth.requireLogin, (req, res, next) => {

  // parsing google maps api to get long/ lat
  // parsing to input new weather object is nested insIde
  request('https://maps.googleapis.com/maps/api/geocode/json?address=' + req.body.location + '&key=AIzaSyBEgWq5G822EXJIgfviFqJRf7vVE6_F5Lc', function (error, response, body){
    const json = JSON.parse(body);

    let dateLog = new DateLog(req.body);
    todayDate = setToday();
    dateLog.date = todayDate;

    let location = new Location({
      date: todayDate,
      location: req.body.location,
      long: JSON.stringify(json.results[0].geometry.location.lng),
      lat: JSON.stringify(json.results[0].geometry.location.lat)
    });

    location.user = req.session.userId;
    dateLog.user = req.session.userId;

    dateLog.long = JSON.stringify(json.results[0].geometry.location.lng);
    dateLog.lat = JSON.stringify(json.results[0].geometry.location.lat);

    location.save(function(err, loc) {
      if(err) { console.error(err) };
    });

    let long_needed = JSON.stringify(json.results[0].geometry.location.lng);
    let lat_needed = JSON.stringify(json.results[0].geometry.location.lat);

    // using long/lat to get weather information from Dark Sky API
    request('https://api.darksky.net/forecast/6f3be8512aa00bf20706bd64b3a6f127/' + lat_needed + ',' + long_needed, function (error, response, body){
      const json_2 = JSON.parse(body);

      let weather = new Weather({
        date: todayDate,
        highTemp: JSON.stringify(json_2.daily.data[0].temperatureMax) + "°F",
        lowTemp: JSON.stringify(json_2.daily.data[0].temperatureMin) + "°F",
        avgwindchill: JSON.stringify(json_2.daily.data[0].windSpeed) + "m/s",
        highfeels: JSON.stringify(json_2.daily.data[0].apparentTemperatureMax) + "°F",
        lowfeels: JSON.stringify(json_2.daily.data[0].apparentTemperatureMin) + "°F",
        avetemp: JSON.stringify(json_2.currently.apparentTemperature)
      });

      weather.user = req.session.userId;
      weather.location = req.body.location;

      weather.save(function(err, weather) {
        dateLog.weather = weather._id;

        dateLog.save(function(err, dateLog) {
          if(err) { console.error(err) };
        // }).then(() => {
          return res.redirect('/');
        });

        // if(err) { console.error(err) };

      });
    });
  });

});

// displays dateLog/ show.hbs - all dateLogs
router.get('/all', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  DateLog.find({user: currentUserId}, function(err, dateLogs){
    if(err) {
      console.error(err);
    } else {
      res.render('dateLog/all', { currentUserId: currentUserId, dateLogs: dateLogs });
    }
  });
});

// goes to compare page
// shows user inputs based on range of temperature (aveTemp +/- 5)
// where user can select to READ MORE
router.get('/compare/:lon/:lat', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;
  const currentDate = setToday();
  const { lat, lon } = req.params;

  DateLog.find({user: currentUserId, date: currentDate}, function(err, dateLogs){
    if(err || dateLogs.length === 0) {
      // User's Input cannot be found (no input by today's date)
      // display inputs based on current temp

      // use current location coords and fetch DarkSky current temp (answer)
      const api = `https://api.darksky.net/forecast/6f3be8512aa00bf20706bd64b3a6f127/${lat},${lon}`;

      request(api, function (error, response, body){
        const json = JSON.parse(body);
        const currentTemp = Number(JSON.stringify(json.currently.temperature));
        const lowCurrTemp = currentTemp - 10;
        const highCurrTemp = currentTemp + 10;

        // Filter Weathers based on answer, get weather-Id, match with specific DateLogs created
        Weather.find({user: currentUserId}, function(err, weathers){
          if (err || weathers.length === 0){
            // Render compare page with a message that says no similar input found
            // can be done with front end if statement!
            const message = "No user inputs with similar temperature range."
            res.render('dateLog/compare', { currentUserId: currentUserId, message: message });
          }

          else {
            // For every weather found, match Id with the DateLog created as well
            // Find aveTemp values that lie within [lowCurrTemp, highCurrTemp]
            const filteredWeathers = weathers.filter((val) => {
              if (Number(val.avetemp) > lowCurrTemp && Number(val.avetemp) < highCurrTemp) {
                return val;
              }
            });

            const weatherId = filteredWeathers.map(weather => {return weather._id}); //array of ids

            DateLog.find({user: currentUserId, weather: {$in: weatherId} }, function(err, dateLogs){
              if (err) {
                console.log("There's an error with filtering DateLogs with Weather");
              } else {
                // render compare page with filtered dateLogs (success!)
                let resultArr = [];

                for (let i=0; i<dateLogs.length; i++){
                  resultArr.push({
                    dateLogs: dateLogs[i],
                    weathers: filteredWeathers[i]
                  });
                }

                res.render('dateLog/compare', { currentUserId: currentUserId, results: resultArr});
              }
            });
          }
        });
      });

    }
    else {
      // User's Input found (input by today's date!)
      // display inputs based on user-set temp

      // use today's date and search through Weathers to find current temp (answer)
      Weather.find({user: currentUserId, date: currentDate}, function(err, weather){
        if (err || weather.length === 0){
          console.log("Can't find weather from user's input today");
        } else {
          let todayTemp = Number(weather[0].avetemp); // current temp
          const lowTodayTemp = todayTemp - 10;
          const highTodayTemp = todayTemp + 10;

          // Filter Weathers based on answer, get weather-Id, match with specific DateLogs created
          Weather.find({user: currentUserId}, function(err, weathers){
            if (err || weathers.length === 0){
              // Render compare page with a message that says no similar input found
              // can be done with front end if statement!
              const message = "No user inputs with similar temperature range."
              res.render('dateLog/compare', { currentUserId: currentUserId, message: message });
            }

            else {
              // For every weather found, match Id with the DateLog created as well
              // Find aveTemp values that lie within [lowTodayTemp, highTodayTemp]
              const filteredWeathers = weathers.filter((val) => {
                if (Number(val.avetemp) > lowTodayTemp && Number(val.avetemp) < highTodayTemp) {
                  return val;
                }
              });

              const weather_Id = filteredWeathers.map(weather => { return weather._id }); //array of ids

              DateLog.find({user: currentUserId, weather: {$in: weather_Id}}, function(err, dateLogs){
                if (err) {
                  console.log("There's an error with filtering DateLogs with Weather");
                } else {
                  // Render compare page with filtered dateLogs (success!)
                  let resultArr = [];

                  for (let i=0; i<dateLogs.length; i++){
                    resultArr.push({
                      dateLogs: dateLogs[i],
                      weathers: filteredWeathers[i]
                    });
                  }

                  res.render('dateLog/compare', { currentUserId: currentUserId, results: resultArr});
                }
              });
            }
          });
        }
      });
    }
  });
});

// goes to new input page (dateLog/ new.hbs)
router.get('/new', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  res.render('dateLog/new', { currentUserId: currentUserId });
});

// goes to show individual user input log (dateLog/ show.hbs)
router.get('/show/:id', auth.requireLogin, (req, res, next) => {
  const currentUserId = req.session.userId;

  // SINGLE ELEMENT/ RESOURCE
  DateLog.findById(req.params.id, function(err, dateLog){
    if(err) { console.error(err) };

    // find the weather (weather._id) that corresponds to the dateLog.weatherId
    Weather.findById(dateLog.weather, function(err, weather) {
      if(err) {
        console.error(err)
      } else{
        res.render('dateLog/show', { currentUserId: currentUserId, dateLog: dateLog, weather: weather });
      }
    });
  })
})

module.exports = router;
