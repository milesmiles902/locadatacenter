/*
Miles Taylor
localdatacenter.org
Raspberry Pi->Webhost->Browser
*/

//Website Setup
// Load requirements
var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http);


//For File read
var path = require('path'),
lineReader = require('line-reader');

//For file-system
var fs = require('graceful-fs');

//For file-system
var fs = require('fs');

var currentData = {
  lastTemperatureIndoor: 0,
  lastTemperatureOutdoor: 0,
  lastAltitude: 0,
  lastHumidity: 0,
  lastPressure: 0,
  lastLumens: 0,
  lastHeatIndex: 0,
  dateLastInfo: 0
}

var dayData = {
  date: 0,
  maxIndoorTemp: 0,
  maxIndoorTempTime: 0,
  minIndoorTemp: 0,
  minIndoorTempTime: 0,
  maxOutdoorTemp: 0,
  maxOutdoorTempTime: 0,
  minOutdoorTemp: 0,
  minOutdoorTempTime: 0,
  maxHumidity: 0,
  maxHumidityTime: 0,
  minHumidity: 0,
  minHumidityTime: 0,
  maxHeatIndex: 0,
  maxHeatIndexTime: 0,
  minHeatIndex: 0,
  minHeatIndexTime: 0,
  maxPressure: 0,
  maxPressureTime: 0,
  minPressure: 0,
  minPressureTime: 0,
  maxAltitude: 0,
  maxAltitudeTime: 0,
  minAltitude: 0,
  minAltitudeTime: 0,
  maxLumens: 0,
  maxLumensTime: 0,
  minLumens: 0,
  minLumensTime: 0
}
//Max/Min values with time
var calculateDayData = {
  date: 0,
  maxIndoorTemp: 0,
  maxIndoorTempTime: 0,
  minIndoorTemp: 0,
  minIndoorTempTime: 0,
  maxOutdoorTemp: 0,
  maxOutdoorTempTime: 0,
  minOutdoorTemp: 0,
  minOutdoorTempTime: 0,
  maxHumidity: 0,
  maxHumidityTime: 0,
  minHumidity: 0,
  minHumidityTime: 0,
  maxHeatIndex: 0,
  maxHeatIndexTime: 0,
  minHeatIndex: 0,
  minHeatIndexTime: 0,
  maxPressure: 0,
  maxPressureTime: 0,
  minPressure: 0,
  minPressureTime: 0,
  maxAltitude: 0,
  maxAltitudeTime: 0,
  minAltitude: 0,
  minAltitudeTime: 0,
  maxLumens: 0,
  maxLumensTime: 0,
  minLumens: 0,
  minLumensTime: 0
}


//Check for rollover
var rollOverDate = {
  day: 0,
  month: 0,
  year: 0
}

var currentDate = 0;
var counter = false;
var tempDate;

//Assign 24 hour Max/mins
//get24MaxMin();
var hourcounter = true;
var splitTime;
var currentDay;

//Get Homepage
app.get('/', function(req, res){
  res.sendFile(path.resolve('default.html'));
  console.log("Sent webpage");

  var ip = req.headers['x-forwarded-for'];

  console.log(ip);
});

//File for static files css, js and other docs
app.use(express.static(path.join(path.resolve('/'))));

//Port to Listen
http.listen(55555, function(){
  console.log('listening on *');
});

//Event: socket io connection...
io.sockets.on('connection', function(socket){

  //Event: Message received
  socket.on('message', function(msg){
  
     currentData.lastTemperatureIndoor = msg.lastTemperatureIndoor;
     currentData.lastTemperatureOutdoor = msg.lastTemperatureOutdoor;
     currentData.lastAltitude = msg.lastAltitude;
     currentData.lastHumidity = msg.lastHumidity;
     currentData.lastPressure = msg.lastPressure;
     currentData.lastLumens = msg.lastLumens;
     currentData.lastHeatIndex = msg.lastHeatIndex;
     currentData.dateLastInfo = msg.dateLastInfo;
     console.log(msg);
     writeFile(JSON.stringify(msg) + "\n", "data");

     tempDate = msg.dateLastInfo;
     splitTime = tempDate.replace(/\,/g, "").split(" ");


   if(hourcounter){
    console.log("Assigned checkDay");
    currentDay = splitTime[2];
    hourcounter = false;
  }

  if(currentDay != splitTime[2]){
    console.log("Days aren't equal");
    calculate24MaxMin();
    hourcounter = true;
  }
});

  //Browser emit
  socket.emit('browser', currentData);

  //Tables emit
  socket.emit('tables', dayData);
  
  //Send past chat information
  lineReader.eachLine('data/chat.json', function(line, last) {
    socket.emit('chat message', line);
    console.log("emitted chat message" + line);
    if (line===last){
      return false;
    }
  });

  //Event: Chat message from browser
  socket.on('chat message', function(msg){
    console.log("Recieved chat message: " + msg);
    var dateMessage = currentData.dateLastInfo + ": " + msg;
    writeFile(dateMessage + "\n", "chat");
    io.emit('chat message', dateMessage);
  });
});


//Write some files
function writeFile(text, file){
  if (file === "data"){
    fs.appendFile('data/data.json', text, function(err){
      if(err){
        console.log("Write data.json error");
        throw err;
      }
    }); 
  }
  else if(file === "ip"){
    fs.appendFile('data/ip.json', text, function(err){
      if(err){
        console.log("Write data.json error");
        throw err;
      }
    });
  }
  else if(file === "chat"){
    fs.appendFile('data/chat.json', text, function (err){
      if(err){
        console.log("Write data.json error");
        throw err;
      }
    })
  }
  else if(file === "24"){
    fs.appendFile('data/august.json', text, function(err){
      if (err) {
        console.warn(err);
      }
    });
  }
  else {
    fs.appendFile('data/err.json', text, function (err){
      if(err){
        console.log("Write error, incorrect file?");
        throw err;
      }
    })
  }
}

function get24MaxMin(){
  console.log("Max/Min being put into variables");
  lineReader.eachLine('data/august.json', function(line, last) {
    if(last){
      dayData = JSON.parse(line);
    }
  })
}

function calculate24MaxMin(){
    //With each line check for max and mins
    lineReader.eachLine('data/data.json', function(line, last) {
      var jsonLine = JSON.parse(line);
      tempDate = jsonLine.dateLastInfo;
      currentDate = tempDate.replace(/\,/g, "").split(" ");

      if (rollOverDate.day != currentDate[2]){
        console.log("Made it in the initilizer");
        if (counter) {
          console.log("Got to another day");
          calculateDayData.date = rollOverDate;
          writeFile(JSON.stringify(calculateDayData) + "\n", "24");
          counter = false;
        }

        calculateDayData.maxIndoorTemp = jsonLine.lastTemperatureIndoor;
        calculateDayData.maxIndoorTempTime = currentDate[4];
        calculateDayData.minIndoorTemp = jsonLine.lastTemperatureIndoor;
        calculateDayData.minIndoorTempTime = currentDate[4];
        calculateDayData.maxOutdoorTemp = jsonLine.lastTemperatureOutdoor;
        calculateDayData.maxOutdoorTempTime = currentDate[4];
        calculateDayData.minOutdoorTemp = jsonLine.lastTemperatureOutdoor;
        calculateDayData.minOutdoorTempTime = currentDate[4];
        calculateDayData.maxHumidity = jsonLine.lastHumidity;
        calculateDayData.maxHumidityTime = currentDate[4];
        calculateDayData.minHumidity = jsonLine.lastHumidity;
        calculateDayData.minHumidityTime = currentDate[4];
        calculateDayData.maxHeatIndex = jsonLine.lastHeatIndex;
        calculateDayData.maxHeatIndexTime = currentDate[4];
        calculateDayData.minHeatIndex = jsonLine.lastHeatIndex;
        calculateDayData.minHeatIndexTime = currentDate[4];
        calculateDayData.maxPressure = jsonLine.lastPressure;
        calculateDayData.maxPressureTime = currentDate[4];
        calculateDayData.minPressure = jsonLine.lastPressure;
        calculateDayData.minPressureTime = currentDate[4];
        calculateDayData.maxAltitude = jsonLine.lastAltitude;
        calculateDayData.maxAltitudeTime = currentDate[4];
        calculateDayData.minAltitude = jsonLine.lastAltitude;
        calculateDayData.minAltitudeTime = currentDate[4];
        calculateDayData.maxLumens = jsonLine.lastLumens;
        calculateDayData.maxLumensTime = currentDate[4];
        calculateDayData.minLumens = jsonLine.lastLumens;
        calculateDayData.minLumensTime = currentDate[4];
        counter = true;
      }

      if(calculateDayData.maxIndoorTemp < jsonLine.lastTemperatureIndoor){
        calculateDayData.maxIndoorTemp = jsonLine.lastTemperatureIndoor;
        calculateDayData.maxIndoorTempTime = currentDate[4];
      }
      if(calculateDayData.minIndoorTemp > jsonLine.lastTemperatureIndoor){
        calculateDayData.minIndoorTemp = jsonLine.lastTemperatureIndoor;
        calculateDayData.minIndoorTempTime = currentDate[4];
      }
      if(calculateDayData.maxOutdoorTemp < jsonLine.lastTemperatureOutdoor){
        calculateDayData.maxOutdoorTemp = jsonLine.lastTemperatureOutdoor;
        calculateDayData.maxOutdoorTempTime = currentDate[4];
      }
      if(calculateDayData.minOutdoorTemp > jsonLine.lastTemperatureOutdoor){
        calculateDayData.minOutdoorTemp = jsonLine.lastTemperatureOutdoor;
        calculateDayData.minOutdoorTempTime = currentDate[4];
      }
      if(calculateDayData.maxHumidity < jsonLine.lastHumidity){
        calculateDayData.maxHumidity = jsonLine.lastHumidity;
        calculateDayData.maxHumidityTime = currentDate[4];
      }
      if(calculateDayData.minHumidity > jsonLine.lastHumidity){
        calculateDayData.minHumidity = jsonLine.lastHumidity;
        calculateDayData.minHumidityTime = currentDate[4];
      }
      if(calculateDayData.maxHeatIndex < jsonLine.lastHeatIndex){
        calculateDayData.maxHeatIndex = jsonLine.lastHeatIndex;
        calculateDayData.maxHeatIndexTime = currentDate[4];
      }
      if(calculateDayData.minHeatIndex > jsonLine.lastHeatIndex){
        calculateDayData.minHeatIndex = jsonLine.lastHeatIndex;
        calculateDayData.minHeatIndexTime = currentDate[4];
      }
      if(calculateDayData.maxPressure < jsonLine.lastPressure){
        calculateDayData.maxPressure = jsonLine.lastPressure;
        calculateDayData.maxPressureTime = currentDate[4];
      }
      if(calculateDayData.minPressure > jsonLine.lastPressure){
        calculateDayData.minPressure = jsonLine.lastPressure;
        calculateDayData.minPressureTime = currentDate[4];
      }
      if(calculateDayData.maxAltitude < jsonLine.lastAltitude){
        calculateDayData.maxAltitude = jsonLine.lastAltitude;
        calculateDayData.maxAltitudeTime = currentDate[4];
      }
      if(calculateDayData.minAltitude > jsonLine.lastAltitude){
        calculateDayData.minAltitude = jsonLine.lastAltitude;
        calculateDayData.minAltitudeTime = currentDate[4];
      }
      if(calculateDayData.maxLumens < jsonLine.lastLumens){
        calculateDayData.maxLumens = jsonLine.lastLumens;
        calculateDayData.maxLumensTime = currentDate[4];
      }
      if(calculateDayData.minLumens > jsonLine.lastLumens){
        calculateDayData.minLumens = jsonLine.lastLumens;
        calculateDayData.minLumensTime = currentDate[4];
      }

      rollOverDate.day = currentDate[2];
      rollOverDate.month = currentDate[1];
      rollOverDate.year = currentDate[3];

      if(last){
        get24MaxMin();
        return false;
      }
    });
}