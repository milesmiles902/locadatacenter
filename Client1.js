/*
  Miles Taylor
  localdatacenter.org
  Arduino->Raspberry Pi->Webhost
  */

//Website Setup
var io = require('socket.io-client')
var socket = io.connect('http://localdatacenter.org', {reconnect: true});

//For time-zone deficit
var moment = require('moment-timezone'),
parseFormat = require('moment-parseformat');

//SerialPort Setup
var arduinoSerialPort = '/dev/ttyACM0';

var serialport = require('serialport');
var serialPort = new serialport.SerialPort(arduinoSerialPort,
  {//Listening on the serial port for data coming from Arduino over USB
  	parser: serialport.parsers.readline('\n')
  });

serialPort.on('data', function (data){//When a new line of text is received from Arduino over USB
	try{
		var j = JSON.parse(data);

		console.log(j);
		socket.emit('message', 
			{ 
				lastTemperatureIndoor: j.rawIndoorTemp,
				lastTemperatureOutdoor: j.rawOutdoorTemp,
			}
	catch (ex){
		console.warn(ex);
	}
});

function getDateTimeOffset(){
	// format 
	var format = parseFormat('Thursday, February 6, 2014 9:20pm'/* , options */);
	return moment().tz("America/Vancouver").format(format); 
}
