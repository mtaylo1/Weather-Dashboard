var nowCity
var prevCity
var APIkey = "aab0f276c4936503dad60ee92c7a45e5"

var errormsg = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}


var getCurrentWeather = (event) => {
    let city = $('#citySearch').val();
    nowCity = $('#citySearch').val();

    let URLfetch = "https://api.openweathermap.org/data/2.5/find?q=" + city + "&units=metric" + "&APPID=" + APIkey;
    fetch(URLfetch)
    .then(errormsg)
    .then((response) => {
        return response.json();
    })

    .then((response) => {

        saveCity(city);
        $('#search-error').text(""); 

        var iconcode = [0].icon;

        var currentWeatherBox = "http://openweathermap.org/img/w/" + iconcode + ".png";
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

        makeCities();
        fiveDayForecast(event);

        $('#header-text').text(response.name);

        let currentHTMLweather = `
        <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherBox}"></h3>
        <ul class="list-unstyled">
            <li>Temperature: ${response.main.temp}&#8457;</li>
            <li>Humidity: ${response.main.humidity}%</li>
            <li>Wind Speed: ${response.wind.speed} mph</li>
            <li id="uvIndex">UV Index:</li>
        </ul>`;

        $('#current-weather').html(currentHTMLweather);


        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let URLfetch = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + APIkey;

        uvURLfetch = "https://cors-anywhere.herokuapp.com/" + uvURLfetch;

        fetch(uvURLfetch)
        .then(errormsg)
        .then((response) => {})

        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}


var fiveDayForecast = (event) => {
        let city = $('#citySearch').val();

        let URLfetch = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric" + "&APPID=" + APIkey;
        
        fetch (URLfetch)
            .then(errormsg)
            .then((response) => {
            let fiveDayHTML = `
            <h2>5-Day Forecast:</h2>
                <div id="fiveDayForecast" class="d-inline-flex flex-wrap ">`;

            for (let i = 0; i < response.list.length; i++) {
                let dayData = response.list[i];
                let dayTimeUTC = dayData.dt;
                let timeZoneOffset = response.city.timezone;
                let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
                let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
                let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            
            if (rightNow.format("HH:mm:ss") === "11:00:00" || rightNow.format("HH:mm:ss") === "12:00:00" || rightNow.format("HH:mm:ss") === "13:00:00") {
                fiveDayHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${rightNow.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                        </ul>
                    </div>`;
            }
        }
        fiveDayHTML += `</div>`;

        $('#five-day').html(fiveDayHTML);
            

            })
    }
    var saveCity = (newCity) => {
        let cityReady = false;
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage["cities" + i] === newCity) {
                cityReady = true;
                break;
            }
        }
        if (cityReady === false) {
            localStorage.setItem('cities' + localStorage.length, newCity);
        }
    }

    var makeCities = () => {
        $('#city-results').empty();
        if (localStorage.length===0){
            if (prevCity){
                $('#search-city').attr("value", prevCity);
            } else {
                $('#search-city').attr("value", "Toronto");
            }
        } else {

            let prevCityKey="cities"+(localStorage.length-1);
            prevCity=localStorage.getItem(prevCityKey);
            $('#search-city').attr("value", prevCity);
            for (let i = 0; i < localStorage.length; i++) {
                let city = localStorage.getItem("cities" + i);
                let cityEl;
                if (nowCity===""){
                    nowCity=prevCity;
                }
                if (city === nowCity) {
                    cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
                } else {
                    cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
                } 
                $('#city-results').prepend(cityEl);
            }
            if (localStorage.length>0){
                $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
            } else {
                $('#clear-storage').html('');
            }
        }
        
    }
 
    $('#search-button').on("click", (event) => {
        event.preventDefault();
        nowCity = $('#search-city').val();
        currentConditions(event);
        });
        
        $('#city-results').on("click", (event) => {
            event.preventDefault();
            $('#search-city').val(event.target.textContent);
            nowCity=$('#search-city').val();
            currentConditions(event);
        });
        
        $("#clear-storage").on("click", (event) => {
            localStorage.clear();
            makeCities();
        });
        
        makeCities();
        
        getCurrentWeather();

