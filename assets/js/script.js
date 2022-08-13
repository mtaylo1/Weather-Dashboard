var APIkey = "aab0f276c4936503dad60ee92c7a45e5"
var nowCity
var prevCity

// Fetches .fail command I found online
var errormsg = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}


//Displays current weather from Open Weather API 
var getCurrentWeather = (event) => {
    
    //Pulls city name from search box
    let city = $('#citySearch').val();
    nowCity = $('#citySearch').val();

    //Uses API to pull weather search 
    let URLfetch = "https://api.openweathermap.org/data/2.5/find?q=" + city + "&units=metric" + "&APPID=" + APIkey;
    fetch(URLfetch)
    .then(errormsg)
    .then((response) => {
        return response.json();
    })


    .then((response) => {

        //save to local storage
        saveCity(city);
        $('#search-error').text(""); 

        //attempt at using moment.js to set time 
        let currentTimeEST = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeZoneOffset).est().utcOffset(currentTimeZoneOffsetHours);
        let currentWeatherBox = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";


        //makes cities list 
        makeCities();
        //pulls the five day forecast for search city
        fiveDayForecast(event);

        //displays the city name in header tesxt 
        $('#header-text').text(response.name);
        
        //displays html for the current weather 
        let currentHTMLweather = `
        <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherBox}"></h3>
        <ul class="list-unstyled">
            <li>Temperature: ${response.main.temp}&#8457;</li>
            <li>Humidity: ${response.main.humidity}%</li>
            <li>Wind Speed: ${response.wind.speed} mph</li>
            <li id="uvIndex">UV Index:</li>
        </ul>`;

        //add weather to the dom
        $('#current-weather').html(currentHTMLweather);

        //pulls latitude and logitude data 
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let URLfetch = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + APIkey;

        //had a CORs error, found this online to fix 
        uvURLfetch = "https://cors-anywhere.herokuapp.com/" + uvURLfetch;

        //fetch UV info and builds the colour display for UV index
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

//function to obtain five day forecast and displays to HTML 
var fiveDayForecast = (event) => {
        let city = $('#citySearch').val();
        //URL for API Search using forecast search 
        let URLfetch = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric" + "&APPID=" + APIkey;
        //pulls from API
        fetch (URLfetch)
            .then(errormsg)
            .then((response) => {
            let fiveDayHTML = `
            <h2>5-Day Forecast:</h2>
                <div id="fiveDayForecast" class="d-inline-flex flex-wrap ">`;
            //Loop over the five day forecast and builds the template HTML using the EST Offset     
            for (let i = 0; i < response.list.length; i++) {
                let dayData = response.list[i];
                let dayTimeUTC = dayData.dt;
                let timeZoneOffset = response.city.timezone;
                let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
                let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
                let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            
            //to only show mid-day forecast
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
        //builds the HTML template
        fiveDayHTML += `</div>`;

        $('#five-day').html(fiveDayHTML)

            })

            //saves to localStorage if city isn't saved already 
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

    //makes the list of searched cities 
    var makeCities = () => {
        $('#city-results').empty();
        if (localStorage.length===0){
            if (prevCity){
                $('#search-city').attr("value", prevCity);
            } else {
                $('#search-city').attr("value", "Toronto");
            }
        } else {
            //pulls last city written to localStoage
            let prevCityKey="cities"+(localStorage.length-1);
            prevCity=localStorage.getItem(prevCityKey);
            //set search unput to last city searched 
            $('#search-city').attr("value", prevCity);
            for (let i = 0; i < localStorage.length; i++) {
                let city = localStorage.getItem("cities" + i);
                let cityEl;
                //set to the last city if the nowCity isn't set 
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
    //new city search button event listener
    $('#search-button').on("click", (event) => {
        event.preventDefault();
        nowCity = $('#search-city').val();
        getCurrentWeather(event);
        });
        //old searched cities event listener
        $('#city-results').on("click", (event) => {
            event.preventDefault();
            $('#search-city').val(event.target.textContent);
            nowCity=$('#search-city').val();
            getCurrentWeather(event);
        });
        //clear old searched cities
        $("#clear-storage").on("click", (event) => {
            localStorage.clear();
            makeCities();
        });
        
        //makes the seearched cities
        makeCities();
        //gets the currrent weather 
        getCurrentWeather();

