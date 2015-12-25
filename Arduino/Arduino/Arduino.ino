/*
  Miles Taylor
  7-23-2015 
  Arduino Weather Station
*/

//TSL2651 : SDA - A4, SLA - A5


//For Humidity Probe
#include <math.h>
#include "DHT.h"
#define DHTPIN 2 
#define DHTTYPE DHT22 

//For Lumens Board
#include <Wire.h>
#include "TSL2561.h"

//For Pressure Board
#include <Adafruit_BMP085.h>

//Frequency of samples (5sec), number of averaged samples, total samples greater than 0
unsigned long UpdateDelay = 1000UL * 5; //Update frequency
const byte NbSamples = 300; //Averaging
int totalSamples = 0;

//Further dependencies
DHT dht(DHTPIN, DHTTYPE);
TSL2561 tsl(TSL2561_ADDR_FLOAT); 
Adafruit_BMP085 bmp;

void setup()
{
  delay(1000);
  Serial.begin(9600); //Start serial port

  //Humidity probe come alive
  dht.begin();

  //Pressure board start
  bmp.begin();

  //Lumens board start
  tsl.begin();
  tsl.setGain(TSL2561_GAIN_16X);
  tsl.setTiming(TSL2561_INTEGRATIONTIME_13MS); 

  bmp.begin();
}

void loop()
{
  //Assign variables
  float rawIndoorTemp = 0.0;
  float rawPressure = 0.0;
  float rawAltitude = 0.0;
  float rawHumidity = 0.0;
  float rawOutdoorTemp = 0.0;
  float rawHeatIndex = 0.0;
  float rawLumens = 0.0;
  float rawIndoorTempNeg = 0.0;
  float rawPressureNeg = 0.0;
  float rawAltitudeNeg = 0.0;
  float rawHumidityNeg = 0.0;
  float rawOutdoorTempNeg = 0.0;
  float rawHeatIndexNeg = 0.0;
  float rawLumensNeg = 0.0;

  //Get values from boards/probes. Check if greater than 0
  for (byte i = NbSamples; i > 0; i--)
  {//Averaging over several readings
    rawIndoorTempNeg = bmp.readTemperature();
    rawPressureNeg = bmp.readPressure();
    rawAltitudeNeg = bmp.readAltitude(101601); //Calculated altitude using sea level pressure
    rawHumidityNeg = dht.readHumidity();
    rawOutdoorTempNeg = dht.readTemperature(true);
    rawHeatIndexNeg = calculateHeatIndex(dht.readTemperature(true), dht.readHumidity());
    rawLumensNeg = calculatedLux();

    if (rawIndoorTempNeg > 0 && rawPressureNeg > 0 && rawAltitudeNeg > 0 && rawHumidityNeg > 0 && rawOutdoorTempNeg > 0 && rawHeatIndexNeg > 0 && rawLumensNeg > 0){
    rawIndoorTemp += rawIndoorTempNeg;
    rawPressure += rawPressureNeg;
    rawAltitude += rawAltitudeNeg; //Calculated altitude using sea level pressure
    rawHumidity += rawHumidityNeg;
    rawOutdoorTemp += rawOutdoorTempNeg;
    rawHeatIndex += rawHeatIndexNeg;
    rawLumens += rawLumensNeg;
    totalSamples += 1;
    }
    delay(100);
  }

  //Average samples
  rawIndoorTemp /= totalSamples;
  rawHumidity /= totalSamples;
  rawOutdoorTemp /= totalSamples;
  rawHeatIndex /= totalSamples;
  rawLumens /= totalSamples;
  rawPressure /= totalSamples;
  rawAltitude /= totalSamples;

  //Sending a JSON string over Serial/USB like: {"rawIndoorTemp":"123","rawOutdoorTemp":"234","rawHumidity":"3546"}
  Serial.println("{\"rawIndoorTemp\":\"" + String((long)round(calculatedTemp(rawIndoorTemp))) +
      "\", \"rawOutdoorTemp\":\"" + String((long)round(rawOutdoorTemp)) +
      "\", \"rawHumidity\":\"" + String((long)round(rawHumidity)) +
      "\", \"rawPressure\":\"" + String((long)round(rawPressure)) +
      "\", \"rawAltitude\":\"" + String((long)round(rawAltitude)) +
      "\", \"rawHeatIndex\":\"" + String((long)round(rawHeatIndex)) +
      "\", \"rawLumens\":\"" + String((long)round(rawLumens)) +
      "\"}");
  totalSamples = 0;
  delay(UpdateDelay);
}


//Board calculations. Visible Spectrum = Full Spectrum - Infrared Spectrum
int calculatedLux(){
  uint32_t lum = tsl.getFullLuminosity();
  uint16_t ir, full;
  ir = lum >> 16;
  full = lum & 0xFFFF;
  return tsl.calculateLux(full, ir);
}

//Give me that Fahrenheit
int calculatedTemp(int celsius){
  int fahrenheit = ((9*celsius)/5)+32;
  return fahrenheit;
}

//Thank you previous programmer for coding the heat index for me. 
float calculateHeatIndex(float t, float rh){
      
      rh /= 100;

      if (t >= 80 && rh >= .40){
        //for temp>=80F and rh>=40%, this formula is +/- 1.3F accurate
        return -42.379 + 2.04901523 * t + 10.14333127 * rh - 0.22475541 * t * rh - 6.83783E-3 * t * t -
          5.481717E-2 * rh * rh - 1.22874E-3 * t * t * rh + 8.5282E-4 * t * rh * rh - 1.99E-6 * t * t * rh * rh;
      }
      else {
        //An alternative set of constants for this equation that is within 3 degrees of the national weather service 
        //for all humidities from 0 to 80% and all temperatures between 70 and 115 °F and all heat indexes < 150 °F is
        return -0.363445176 + .988622465 * t + 4.777114035 * rh - 0.114037667 * t * rh - 0.000850208 * t * t -
          0.020716198 * rh * rh - 0.000687678 * t * t * rh + 0.000274954 * t * rh * rh; // - 0 * t * t * rh * rh;
      }
}

