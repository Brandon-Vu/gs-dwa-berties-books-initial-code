var express = require('express');
var router = express.Router();
require('dotenv').config();
const request = require('request');

router.get('/', (req, res) => {
    res.render("weather", { weather: null, error: null });
});

router.post('/', (req, res) => {
    const city = req.body.city;
    const apiKey = process.env.WEATHER_API_KEY;

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, (err, response, body) => {
        if (err) {
            return res.render("weather", { weather: null, error: "Error retrieving data" });
        }

        let data = JSON.parse(body);

        if (!data || !data.main) {
            return res.render("weather", { weather: null, error: "City not found" });
        }

        const weather = {
            name: data.name,
            temp: data.main.temp,
            humidity: data.main.humidity,
            wind: data.wind.speed,
            description: data.weather[0].description
        };

        res.render("weather", { weather, error: null });
    });
});

module.exports = router;