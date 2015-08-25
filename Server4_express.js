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

//For IP reverse lookup
var satelize = require('satelize');

//For File read
var path = require('path'),
  lineReader = require('line-reader');

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

//Assign 24 hour Max/mins
get24MaxMin();

//Get Homepage
app.get('/', function(req, res){
  res.sendFile(path.resolve('../../public_html/default.html'));
  console.log("Sent webpage");

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  //Record IP
  satelize.satelize(ip, function(err, data) {
      if(err){
        return;
      }
      var ipData = JSON.parse(data);
      console.log("New Client Connected");
      ipData["date"]= currentData.dateLastInfo;
      console.log(ipData);
      writeFile(JSON.stringify(ipData), "ip");
    });
});

//File for static files css, js and other docs
app.use(express.static(path.join(path.resolve('../../public_html/'))));

//Port to Listen
http.listen(55555, function(){
  console.log('listening on *:55555');
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
    writeFile(JSON.stringify(msg), "data");
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
    var lineFixed = line.replace(/\n/g, "")
                        .replace(/\'/g, "")
                        .replace(/\"/g, "")
                        .replace(/\&/g, "")
                        .replace(/\r/g, "")
                        .replace(/\\r/g, "")
                        .replace(/\t/g, "")
                        .replace(/\b/g, "")
                        .replace(/\f/g, "");

    var lineData = lineFixed.split(" "); 

    dayData.maxIndoorTemp = lineData[1];
    dayData.maxIndoorTempTime = lineData[2];
    dayData.minIndoorTemp = lineData[3];
    dayData.minIndoorTempTime = lineData[4];
    dayData.maxOutdoorTemp = lineData[5];;
    dayData.maxOutdoorTempTime = lineData[6];
    dayData.minOutdoorTemp = lineData[7];
    dayData.minOutdoorTempTime = lineData[8];
    dayData.maxHumidity = lineData[9];
    dayData.maxHumidityTime = lineData[10];
    dayData.minHumidity = lineData[11];
    dayData.minHumidityTime = lineData[12];
    dayData.maxHeatIndex = lineData[13];
    dayData.maxHeatIndexTime = lineData[14];
    dayData.minHeatIndex = lineData[15];
    dayData.minHeatIndexTime = lineData[16];
    dayData.maxPressure = lineData[17];
    dayData.maxPressureTime = lineData[18];
    dayData.minPressure = lineData[19];
    dayData.minPressureTime = lineData[20];
    dayData.maxAltitude = lineData[21];
    dayData.maxAltitudeTime = lineData[22];
    dayData.minAltitude = lineData[23];
    dayData.minAltitudeTime = lineData[24];
    dayData.maxLumens = lineData[25];
    dayData.maxLumensTime = lineData[26];
    dayData.minLumens = lineData[27];
    dayData.minLumensTime = lineData[28];
    return false;
    }
  })
}