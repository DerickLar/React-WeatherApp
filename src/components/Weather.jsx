import React, { use, useEffect, useRef, useState } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzel_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'

function Weather({setBgGradient}) {

    const inputRef = useRef();
    const localTimezoneRef = useRef(false);
    const [weatherData, setWeatherData] = useState(false);
    const [isImperial, setIsImperial] = useState(false);
    const [time, setTime] = useState(new Date());
    const [localTime, setLocalTime] = useState(false);
    const [localTimezone, setLocalTimezone] = useState(false);

    //Icons corresponding to openWeathers icon indexes
    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzel_icon,
        "04n": drizzel_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    }

    //Corresponding background colors for the background gradient
    const dayPhases = [
        { start: 0,   end: 360,   color1: [220, 60, 15],  color2: [240, 40, 25] },  // Night
        { start: 360, end: 480,   color1: [20, 80, 50],   color2: [35, 90, 60]  },  // Dawn
        { start: 480, end: 720,   color1: [200, 90, 70],  color2: [210, 100, 80]},  // Morning
        { start: 720, end: 1080,  color1: [210, 100, 70], color2: [200, 80, 60] },  // Afternoon
        { start: 1080, end: 1260,  color1: [30, 90, 55],   color2: [10, 80, 45]  },  // Evening
        { start: 1260, end: 1440,  color1: [220, 60, 15],  color2: [240, 40, 25] },  // Night
    ]

    //Get weather data for a givne city name
    const search = async (city) =>{
        if(city === ""){
            //alert("Enter City Name");
            return;
        }

        try{
            //Fetch weather data from openWeather
            const url= `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const response = await fetch(url);
            const data = await response.json();
            if(!response.ok){
                alert(data.message);
                return;
            }
            
            console.log(data);
        
            setLocalTimezone(data.timezone/3600);//Convert local timezone to UTC and save it

            const icon = allIcons[data.weather[0].icon] || clear_icon;//Set corresponding icon to display

            //Set current weather data
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: data.main.temp,
                location: data.name,
                icon: icon,
                description: data.weather[0].description
            });

        }catch (error){
            setWeatherData(false);
            console.error("Error in fetching weather data");
        }
    }

    //Enter key press for searching
    const handleEnterSearch = (e) =>{
        if(e.key === 'Enter'){
            search(inputRef.current.value);
        }
    }

    //Convert Celcius to Fahrenheit
    const toFahrenheit = (temp) =>{
        return (temp * 1.8) + 32;
    }

    //Convert Km/h to mph
    const toMilesHour = (speed) =>{
        return speed * 0.621374;
    }

    //Toggel wich units to display
    const switchUnits = () =>{
        setIsImperial(!isImperial)
    }

    //Calculate local time of current city
    const calcLocalTime = (time, offset) =>{
        const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
        const localFormated = new Date(utc + (3600000*offset)).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        return localFormated;
    }

    const interpolate = (c1, c2, t) =>{
        return c1 + (c2 -c1) * t;
    }
    
    //Get calculate and get backgroudn gradient for current local time
    const getGradient = (totalMinutes) =>{
        const phase = dayPhases.find(p => totalMinutes >= p.start && totalMinutes < p.end);//Determine phase of the day
        const t = (totalMinutes-phase.start)/ (phase.end - phase.start);

        const [h1, s1, l1] = phase.color1;
        const [h2, s2, l2] = phase.color2;

        //Get colors hues
        const color1 = `hsl(${interpolate(h1, h2, t)}, ${interpolate(s1, s2, t)}%, ${interpolate(l1, l2, t)}%)`;
        const color2 = `hsl(${interpolate(h2, h1, t)}, ${interpolate(s2, s1, t)}%, ${interpolate(l2, l1, t)}%)`;

        const angle = (totalMinutes/ 1440) * 360;

        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }

    useEffect(()=>{
        search("");//Starting state of app
    },[]);

    useEffect(()=>{
        localTimezoneRef.current = localTimezone;
    }, [localTimezone]);

    useEffect(()=>{
        //Update current time every second
        const interval = setInterval(()=>{
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    },[]);

    useEffect(()=>{
        //Update weather data every 5 minutes
        const interval = setInterval(()=>{
            if(weatherData)
                search(weatherData.location);
        }, 300000);

        return () => clearInterval(interval);
    },[])

    useEffect(()=>{
        //Get local time zone
        const tz = localTimezoneRef.current;
        if(tz){
            //Calculate and set Local Time
            const localTimeString = calcLocalTime(time, tz);
            setLocalTime(localTimeString);

            //Get local hours from current local time
            const [timePart, period] = localTimeString.split(' ');
            let [hour, minute] = timePart.split(':').map(Number);
            if (period === 'PM' && hour !== 12) 
                hour += 12;
            if (period === 'AM' && hour === 12) 
                hour = 0;

            //Convert hours to minutes
            const totalMinutes = hour * 60 + minute;

            //Set background gradient that corresponds to current local time
            setBgGradient(getGradient(totalMinutes));
        }
    },[time]);

  return (
    <div className='weather'>
      <div className='search-bar'>      
        <input ref={inputRef} placeholder='Enter City Name' onKeyDown={handleEnterSearch}/>
        <img src={search_icon} alt='' onClick={()=>search(inputRef.current.value)}/>
      </div>
      <button className={`toggle-btn ${isImperial ? "toggled": ""}`} onClick={switchUnits}>
        <div className='thumb'>°{isImperial? 'F': 'c'}</div>
      </button>
      <p className='time'>{localTime}</p>
      {weatherData? <>
      <p className='description'>{weatherData.description}</p>
      <img src={weatherData.icon} alt='' className='weather-icon'/>
      <p className='temperature'>{Math.floor(isImperial? toFahrenheit(weatherData.temperature):weatherData.temperature)}°{isImperial? 'F': 'c'}</p>
      <p className='location'>{weatherData.location}</p>
      <div className='weather-data'>
        <div className='col'>
            <img src={humidity_icon} alt="" />
            <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
            </div>
        </div>
        <div className='col'>
            <img src={wind_icon} alt="" />
            <div>
                <p>{isImperial? toMilesHour(weatherData.windSpeed).toFixed(2): weatherData.windSpeed.toFixed(2)} {isImperial?'mph':'km/h'}</p>
                <span>Wind Speed</span>
            </div>
        </div>
      </div>
      </>:<></>}
    </div>
  )
}

export default Weather
