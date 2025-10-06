import React, { useState } from 'react';
import './WeatherApp.css';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = '20df1321990f4e77a6581836253006';

  const fetchWeather = async () => {
    if (!city.trim()) {
      alert('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`
      );

      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      setWeatherData({
        location: data.location.name,
        temp: data.current.temp_c,
        condition: data.current.condition.text,
        icon: data.current.condition.icon
      });
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="weather-container">
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="weather-input"
        />
        <button type="submit" className="weather-button">
          Get Weather
        </button>
      </form>

      <div className="weather-result">
        {loading && <div className="loading">Loading...</div>}

        {error && <div className="error">{error}</div>}

        {weatherData && (
          <>
            <p>Weather in <strong>{weatherData.location}</strong>:</p>
            <p>{weatherData.temp}°C - {weatherData.condition}</p>
            <img
              src={`https:${weatherData.icon}`}
              alt={weatherData.condition}
              className="weather-icon"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;