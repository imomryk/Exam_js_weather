const swiper = new Swiper('.swiper', {
    // spaceBetween: 30,
    // effect: "cube",
    // effect: "flip",
    effect: "creative",
    creativeEffect: {
        prev: {
            shadow: true,
            translate: ["-120%", 0, -500],
        },
        next: {
            shadow: true,
            translate: ["120%", 0, -500],
        },
    },
    grabCursor: true,
    // loop: true,
    pagination: {
        el: ".swiper-pagination",
    },
    // cubeEffect: {
    //   shadow: true,
    //   slideShadows: true,
    //   shadowOffset: 20,
    //   shadowScale: 0.94,
    // },
});

const DAYS = ["Sunday", "Monday", "Thuesday", "Wednesday", "Thursday", "Friday", "Saturday",]

navigator.geolocation.getCurrentPosition(e => {
    let latitude = e.coords.latitude
    let longitude = e.coords.longitude
    weatherRequest(latitude, longitude, 0)
})
// render Weather
const renderWeather = function (currObj, temp, dailyArr, timezone, dailyCounter) {
    const weatherBlock = document.querySelectorAll(".main_content")[0]

    const currentDate = new Date((currObj.dt + timezone) * 1000)
    const sunrise = new Date((dailyArr[dailyCounter].sunrise + timezone) * 1000)
    const sunset = new Date((dailyArr[dailyCounter].sunset + timezone) * 1000)

    weatherBlock.querySelector(".currentWeather_temp").children[0].innerHTML = `${Math.round(temp)}&deg;C`
    weatherBlock.querySelector(".currentWeather_description").children[0].innerHTML = `${currObj.weather[0].main}`
    weatherBlock.querySelector(".currentWeather_date").innerHTML = `${DAYS[currentDate.getUTCDay()]} ${currentDate.getUTCDate()}.${currentDate.getUTCMonth() + 1}.${currentDate.getUTCFullYear()}`
    weatherBlock.querySelector(".currentWeather_time").innerHTML = `${currentDate.toUTCString().slice(17, 22)}`

    weatherBlock.querySelector(".sunrise").children[1].innerHTML = `${sunrise.toUTCString().slice(17, 22)}`
    weatherBlock.querySelector(".sunset").children[1].innerHTML = `${sunset.toUTCString().slice(17, 22)}`
    weatherBlock.querySelector(".day_temp").children[1].innerHTML = `${Math.round(dailyArr[dailyCounter].temp.day)}&deg;C`
    weatherBlock.querySelector(".night_temp").children[1].innerHTML = `${Math.round(dailyArr[dailyCounter].temp.night)}&deg;C`
    weatherBlock.querySelector(".pressure").children[1].innerHTML = `${currObj.pressure} mmHg`
    weatherBlock.querySelector(".humidity").children[1].innerHTML = `${currObj.humidity}%`
    weatherBlock.querySelector(".pop").children[1].innerHTML = `${dailyArr[dailyCounter].pop * 100}%`
    weatherBlock.querySelector(".uvi").children[1].innerHTML = `${currObj.uvi}`
    weatherBlock.querySelector(".wind").children[1].innerHTML = `${Math.round(currObj.wind_speed)} km/h`
    weatherBlock.querySelector(".clouds").children[1].innerHTML = `${currObj.clouds}%`


    console.log(currentDate)
    console.log(weatherBlock.querySelector(".currentWeather_temp").children[0])
    console.log(weatherBlock)
}
const weatherRequest = function (latitude, longitude, index) {
    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=24b0b062d3c94efaab4bcca77b291472`, { method: 'GET', })
        .then(response => response.json())
        .then(resultReverseGeo => {
            console.log(resultReverseGeo)
            const currCity = resultReverseGeo.features[0].properties.city
            const currCountry = resultReverseGeo.features[0].properties.country_code.toUpperCase()
            document.querySelectorAll(".currentCity")[index].innerHTML = `<span>${currCity.toUpperCase()}, </span><span>${currCountry}</span>`

            // Weather Api
            fetch(`https://api.openweathermap.org/data/2.5/onecall?exclude=hourly,minutely,alerts&appid=c4c979e5736f06ccaf01358f455ee24e&units=metric&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(resultWeather => {

                    console.log(resultWeather)
                    const date = new Date((1637013600 + resultWeather.timezone_offset) * 1000)
                    console.log(date.toISOString())

                    // render Forecast
                    const forecast = document.querySelectorAll(".forecast_block")[index]
                    forecast.innerHTML = ``
                    for (let i = 0; i < resultWeather.daily.length; i++) {
                        const forecastElem = document.createElement("div")
                        forecastElem.classList.add("forecast_elem")
                        const forecastElemDate = new Date((resultWeather.daily[i].dt + resultWeather.timezone_offset) * 1000)
                        forecastElem.innerHTML = `
                            <span>${DAYS[forecastElemDate.getUTCDay()].toUpperCase()}</span>
                            <img src="compass-n.svg" alt="">
                            <span>${Math.round(resultWeather.daily[i].temp.day) }&deg; ${Math.round(resultWeather.daily[i].temp.night)}&deg;</span>
                        `
                        forecast.appendChild(forecastElem)
                    }

                    // Render weather
                    // renderWeather(resultWeather.daily, 0, resultWeather.timezone_offset)
                    renderWeather(resultWeather.current, resultWeather.current.temp, resultWeather.daily, resultWeather.timezone_offset, 0)




                })
                .catch(err => console.log("error", err))
        })
        .catch(error => console.log('error', error));
}