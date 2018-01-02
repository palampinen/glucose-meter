# Glucose notes

![Glucose Meter](https://raw.githubusercontent.com/palampinen/glucose-meter/master/glucose-notes.gif)

App to store Blood Glucose Meter measurements from different devices and compare them.

## Background

> My GF was testing new Glucose Meter device called FreeStyle Libre. The device reads Blood Glucose
> level from NFC tag which is attached to skin. Her old device has been device called Accu-meter.
> With this device user has to take blood sample everytime manually and measure it with the device.
> New device is much faster and convenient for user. Problem has been that FreeStyle Libre readings
> do not match with readings done with old device. This app is done to store measurements done with
> both devices and illustrate difference in between those measurements.

## Development

`cp www/config.example.js www/config.js`

Fill www/config.js with your Firebase credentials

```bash
ionic serve --all
```

## Tech

* UI [Ionic Framework](http://ionicframework.com/) and Angular1.

* Firebase as database and for hosting

* Highcharts for data visualization

## Licence

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
