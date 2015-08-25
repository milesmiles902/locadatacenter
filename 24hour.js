//Miles Taylor
//Get 24 hour data


//npm module
var lineReader = require('line-reader');

//Check for rollover
var rollOverDate = {
	day: 0,
	month: 0,
	year: 0
}

//Assign old date 
var oldDate = 0;
var counter = false;

//Max/Min values with time
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

var twentyFour;

//With each line check for max and mins
lineReader.eachLine('data/correctedData.json', function(line, last) {
	var jsonLine = JSON.stringify(line);
	var lineFixed = jsonLine.replace(/\n/g, "")
                            .replace(/\'/g, "")
                            .replace(/\"/g, "")
                            .replace(/\,/g, "")
                            .replace(/\&/g, "")
                            .replace(/\r/g, "")
                            .replace(/\\r/g, "")
                            .replace(/\t/g, "")
                            .replace(/\b/g, "")
                            .replace(/\f/g, "");
	var lineData = lineFixed.split(" "); 
	rollOverDate.month = lineData[1];
	rollOverDate.year = lineData[3];
	if (rollOverDate.day < lineData[2]){
		console.log("Made it in the initilizer");
		if (counter) {
			console.log("Got to another day");
			writeFile(oldDate + " " + maxIndoorTemp + " " + maxIndoorTempTime + " " + minIndoorTemp + " " + minIndoorTempTime + " " + maxOutdoorTemp + " " + maxOutdoorTempTime + " " + minOutdoorTemp  + " " + minOutdoorTempTime + " " + maxHumidity + " " + maxHumidityTime + " " + minHumidity + " "  + minHumidityTime + " " + maxHeatIndex + " " + maxHeatIndexTime + " " + minHeatIndex + " " + minHeatIndexTime + " " + maxPressure + " " + maxPressureTime + " " + minPressure + " " + minPressureTime + " " + maxAltitude + " " + maxAltitudeTime + " " + minAltitude + " " + minAltitudeTime + " " + maxLumens + " " + maxLumensTime + " " + minLumens + " " + minLumensTime + "\n");
			counter = false;
		}
		oldDate = lineData[0] + " " + lineData[1] + " " + lineData[2];
		rollOverDate.day = lineData[2];
		dayData.maxIndoorTemp = lineData[5];
		dayData.maxIndoorTempTime = lineData[4];
		dayData.minIndoorTemp = lineData[5];;
		dayData.minIndoorTempTime = lineData[4];
		dayData.maxOutdoorTemp = lineData[6];;
		dayData.maxOutdoorTempTime = lineData[4];
		dayData.minOutdoorTemp = lineData[6];
		dayData.minOutdoorTempTime = lineData[4];
		dayData.maxHumidity = lineData[7];
		dayData.maxHumidityTime = lineData[4];
		dayData.minHumidity = lineData[7];
		dayData.minHumidityTime = lineData[4];
		dayData.maxHeatIndex = lineData[8];
		dayData.maxHeatIndexTime = lineData[4];
		dayData.minHeatIndex = lineData[8];
		dayData.minHeatIndexTime = lineData[4];
		dayData.maxPressure = lineData[9];
		dayData.maxPressureTime = lineData[4];
		dayData.minPressure = lineData[9];
		dayData.minPressureTime = lineData[4];
		dayData.maxAltitude = lineData[10];
		dayData.maxAltitudeTime = lineData[4];
		dayData.minAltitude = lineData[10];
		dayData.minAltitudeTime = lineData[4];
		dayData.maxLumens = lineData[11];
		dayData.maxLumensTime = lineData[4];
		dayData.minLumens = lineData[11];
		dayData.minLumensTime = lineData[4];
		counter = true;
	}
	if(dayData.maxIndoorTemp < lineData[5]){
		dayData.maxIndoorTemp = lineData[5];
		dayData.maxIndoorTempTime = lineData[4];
	}
	if(dayData.minIndoorTemp > lineData[5]){
		dayData.minIndoorTemp = lineData[5];
		dayData.minIndoorTempTime = lineData[4];
	}
	if(dayData.maxOutdoorTemp < lineData[6]){
		dayData.maxOutdoorTemp = lineData[6];
		dayData.maxOutdoorTempTime = lineData[4];
	}
	if(dayData.minOutdoorTemp > lineData[6]){
		dayData.minOutdoorTemp = lineData[6];
		dayData.minOutdoorTempTime = lineData[4];
	}
	if(dayData.maxHumidity < lineData[7]){
		dayData.maxHumidity = lineData[7];
		dayData.maxHumidityTime = lineData[4];
	}
	if(dayData.minHumidity > lineData[7]){
		dayData.minHumidity = lineData[7];
		dayData.minHumidityTime = lineData[4];
	}
	if(dayData.maxHeatIndex < lineData[8]){
		dayData.maxHeatIndex = lineData[8];
		dayData.maxHeatIndexTime = lineData[4];
	}
	if(dayData.minHeatIndex > lineData[8]){
		dayData.minHeatIndex = lineData[8];
		dayData.minHeatIndexTime = lineData[4];
	}
	if(dayData.maxPressure < lineData[9]){
		dayData.maxPressure = lineData[9];
		dayData.maxPressureTime = lineData[4];
	}
	if(dayData.minPressure > lineData[9]){
		dayData.minPressure = lineData[9];
		dayData.minPressureTime = lineData[4];
	}
	if(dayData.maxAltitude < lineData[10]){
		dayData.maxAltitude = lineData[10];
		dayData.maxAltitudeTime = lineData[4];
	}
	if(dayData.minAltitude > lineData[10]){
		dayData.minAltitude = lineData[10];
		dayData.minAltitudeTime = lineData[4];
	}
	if(dayData.maxLumens < lineData[11]){
		dayData.maxLumens = lineData[11];
		dayData.maxLumensTime = lineData[4];
	}
	if(dayData.minLumens > lineData[11]){
		dayData.minLumens = lineData[11];
		dayData.minLumensTime = lineData[4];
	}

 	if(last === line){
 		return false;
 	}
});


//Rewrite the data
var fs = require('fs');
function writeFile(text){
	fs.appendFile('data/august.json', text, function(err){
		if (err) {
			console.warn(err);
		}
	});
}
