localStorage.clear()
let queryLocal = ["New York","miami"]
localStorage.setItem("queryLocal", queryLocal)
// console.log(localStorage)
// console.log(localStorage.getItem("queryLocal"))
const queryArr = localStorage.getItem("queryLocal").split(",")

queryArr.forEach((e,index) => {
    console.log(index)
    const newSwiperBlock = document.createElement("div")
    newSwiperBlock.classList.add("swiper-slide")
    newSwiperBlock.appendChild(document.querySelector(".main_content").cloneNode(true))
    document.querySelector(".swiper-wrapper").appendChild(newSwiperBlock)
    fetch(`https://api.geoapify.com/v1/geocode/search?apiKey=24b0b062d3c94efaab4bcca77b291472&text=${e}`, { method: 'GET', })
        .then(response => response.json())
        .then(result => {
            console.log("==>>> ",index, result.query.text)
            const latitude = result.features[0].geometry.coordinates[1]
            const longitude = result.features[0].geometry.coordinates[0]

            weatherRequest(latitude, longitude, index+1)

        })
        .catch(error => console.log('error', error));


})



const swiper = new Swiper('.mainSwiper', {
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

    pagination: {
        el: ".swiper-pagination",
    },

});
const getWeatherIcon = function (obj) {
    const weatherIcons = {

        ["clear day"]: './img/Weather_icons/clear_day1.svg',
        ["clear night"]: './img/Weather_icons/clear_night1.svg',
        ["cloudy day"]: './img/Weather_icons/cloudy_day1.svg',
        ["cloudy night"]: './img/Weather_icons/cloudy_night1.svg',
        ["Clouds"]: './img/Weather_icons/clouds1.svg',
        ["Drizzle"]: './img/Weather_icons/drizzle1.svg',
        ["Mist"]: './img/Weather_icons/mist1.svg',
        ["Rain"]: './img/Weather_icons/rain1.svg',
        ["Snow"]: './img/Weather_icons/snow1.svg',
        ["Thunderstorm"]: './imgs/Weather_icons/thunderstorm1.svg',
    }

    if (obj.main == "Mist" || obj.main == "Smoke" || obj.main == "Haze" || obj.main == "Dust" || obj.main == "Fog" || obj.main == "Sand" || obj.main == "Dust" || obj.main == "Ash" || obj.main == "Squall" || obj.main == "Tornado") {
        return weatherIcons["Mist"]
    }

    if (obj.main == "Clear" && obj.icon == "01d") {
        return weatherIcons["clear day"]
    } else if (obj.main == "Clear" && obj.icon == "01n") {
        return weatherIcons["clear night"]
    }

    if (obj.main == "Clouds" && obj.icon == "02d") {
        return weatherIcons["cloudy day"]
    } else if (obj.main == "Clouds" && obj.icon == "02n") {
        return weatherIcons["cloudy night"]
    }

    return weatherIcons[obj.main]
}

const DAYS = ["Sunday", "Monday", "Thuesday", "Wednesday", "Thursday", "Friday", "Saturday",]

navigator.geolocation.getCurrentPosition(e => {
    let latitude = e.coords.latitude
    let longitude = e.coords.longitude
    weatherRequest(latitude, longitude, 0)
})
// render Weather
const renderWeather = function (currObj, temp, dailyArr, timezone, dailyCounter, indexOfBlock) {
    console.log(indexOfBlock)
    const weatherBlock = document.querySelectorAll(".main_content")[indexOfBlock]
    console.log(weatherBlock.querySelectorAll(".currentWeather_temp"))
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


}
// render daily forecast
const renderDayliForecast = function (resultWeather, index) {
    const forecast = document.querySelectorAll(".forecast_block")[index].children[0]
    forecast.innerHTML = ``
    for (let i = 0; i < resultWeather.daily.length; i++) {
        const forecastElem = document.createElement("div")
        forecastElem.classList.add("swiper-slide")
        forecastElem.classList.add("forecast_elem")

        const forecastElemDate = new Date((resultWeather.daily[i].dt + resultWeather.timezone_offset) * 1000)
        forecastElem.innerHTML = `
                            <span>${DAYS[forecastElemDate.getUTCDay()].toUpperCase()}</span>
                            <img src=${getWeatherIcon(resultWeather.daily[i].weather[0])} alt="">
                            <span>${Math.round(resultWeather.daily[i].temp.day)}&deg; ${Math.round(resultWeather.daily[i].temp.night)}&deg;</span>
                        `
        forecast.appendChild(forecastElem)

        const oneDayForecastHelper = function (e) {
            if (e.tagName == "SPAN" || e.tagName == "IMG") {
                return e.parentElement
            } else return e
        }
        forecastElem.addEventListener("click", (e) => {
            if (!(oneDayForecastHelper(e.target).classList.contains("active_Forecast"))) {
                Array.from(forecast.children).forEach(e => {
                    e.classList.remove("active_Forecast")
                })
                oneDayForecastHelper(e.target).classList.add("active_Forecast")
                renderWeather(resultWeather.daily[Array.from(forecast.children).indexOf(oneDayForecastHelper(e.target))], resultWeather.daily[Array.from(forecast.children).indexOf(oneDayForecastHelper(e.target))].temp.day, resultWeather.daily, resultWeather.timezone_offset, Array.from(forecast.children).indexOf(oneDayForecastHelper(e.target)),index)

            }
        })

    }
    const swiper2 = new Swiper(".forecastSwiper", {
        direction: 'horizontal',
        nested: true,
        slidesPerView: 3,

    });
}
// render hourly forecast
const renderHourlyWeather = function (resultWeather, index) {
    const forecast = document.querySelectorAll(".forecast_block")[index].children[0]
    forecast.innerHTML = ``
    for (let i = 0; i < 8; i++) {
        const forecastElem = document.createElement("div")
        forecastElem.classList.add("swiper-slide")
        forecastElem.classList.add("forecast_elem")

        const forecastElemDate = new Date((resultWeather.hourly[i].dt + resultWeather.timezone_offset) * 1000)
        forecastElem.innerHTML = `
                            <span>${forecastElemDate.toUTCString().slice(17, 22)}</span>
                            <img src=${getWeatherIcon(resultWeather.hourly[i].weather[0])} alt="">
                            <span>${Math.round(resultWeather.hourly[i].temp)}&deg;</span>
                        `
        forecast.appendChild(forecastElem)

        const oneDayForecastHelper = function (e) {
            if (e.tagName == "SPAN" || e.tagName == "IMG") {
                return e.parentElement
            } else return e
        }
        forecastElem.addEventListener("click", (e) => {
            if (!(oneDayForecastHelper(e.target).classList.contains("active_Forecast"))) {
                Array.from(forecast.children).forEach(e => {
                    e.classList.remove("active_Forecast")
                })
                oneDayForecastHelper(e.target).classList.add("active_Forecast")
                renderWeather(resultWeather.hourly[Array.from(forecast.children).indexOf(oneDayForecastHelper(e.target))], resultWeather.hourly[Array.from(forecast.children).indexOf(oneDayForecastHelper(e.target))].temp, resultWeather.daily, resultWeather.timezone_offset, 0,index)

            }
        })

    }
    const swiper2 = new Swiper(".forecastSwiper", {
        direction: 'horizontal',
        nested: true,
        slidesPerView: 3,

    });
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
            fetch(`https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,alerts&appid=c4c979e5736f06ccaf01358f455ee24e&units=metric&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(resultWeather => {

                    console.log(resultWeather)
                    const date = new Date((1637013600 + resultWeather.timezone_offset) * 1000)
                    console.log(date.toISOString())

                    // render Forecast
                    renderDayliForecast(resultWeather, index)
                    const forecastSwither = document.querySelectorAll(".forecast_switch")[index]
                    Array.from(forecastSwither.children).forEach(e => {
                        e.addEventListener("click", e => {
                            if (!(e.target.classList.contains("active"))) {
                                Array.from(forecastSwither.children).forEach(e => {
                                    e.classList.remove("active")
                                })
                                e.target.classList.add("active")
                            }

                            if (e.target.innerText == "Daily") {
                                renderDayliForecast(resultWeather, index)
                            } else {
                                renderHourlyWeather(resultWeather, index)
                            }
                        })
                    })




                    // Render weather
                    // renderWeather(resultWeather.daily, 0, resultWeather.timezone_offset)
                    renderWeather(resultWeather.current, resultWeather.current.temp, resultWeather.daily, resultWeather.timezone_offset, 0,index)




                })
                .catch(err => console.log("error", err))
        })
        .catch(error => console.log('error', error));
}

