# Glucose Meter Notes

![Glucose Notes](https://raw.githubusercontent.com/palampinen/glucose-meter/master/app.jpg)

Web Application to store Blood Glucose Meter measurements from different devices and compare them.

## What

> My GF was testing new Glucose Meter device called FreeStyle Libre. The device reads blood glucose
> level from NFC tag which is attached to skin.
>
> Her old blood glucose meter has been device called Accu-Chek. With this device user has to take
> blood sample everytime manually and measure it with the device.
>
> New device is much faster and convenient for user. Problem has been that FreeStyle Libre readings
> do not match with readings done with old device.
>
> This app is done to store measurements done with both devices and illustrate difference in between
> those measurements.

## Development

`cp www/config.example.js www/config.js`

Fill _www/config.js_ with your Firebase credentials

`ionic serve --all`

### Editing

Javascript and HTML code is in `/www`.

Styles can be found in `/scss`.

## Tech

* UI [Ionic Framework](http://ionicframework.com/) and Angular1.

* Highcharts for data visualization

* Firebase for storing data

## Licence

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
