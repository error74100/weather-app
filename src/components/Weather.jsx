import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Weather.css';
import weatherDescKo from '../utill/weatherDescKo.js';

function Weather() {
  const apiKey = process.env.REACT_APP_WEATHER_APIKEY;
  const apiBase = 'https://api.openweathermap.org/data/2.5';
  const searchRef = useRef();
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [dataHour, setDataHour] = useState(null);
  const [korDesc, setKorDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) => {
    setSearch(e.target.value);
  };

  const onClick = async (e) => {
    if (!isLoading) {
      setIsLoading(true);

      const getPos = await getWeatherPosition();

      geolocation(getPos);
      setIsLoading(false);
    }
  };

  const onKeyEvent = (e) => {
    if (e.key === 'Enter') {
      onClick();
    }
  };

  const getWeatherPosition = async () => {
    try {
      const url = `${apiBase}/weather?q=${search}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      if (!response.ok) {
        alert('도시명을 다시 확인해주세요.');
        return;
      } else {
        const data = await response.json();
        const pos = data.coord;
        return pos;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getWeatherNow = async (lat, lon) => {
    try {
      const url = `${apiBase}/weather?lat=${lat}&lon=${lon}&APPID=${apiKey}&units=metric`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const weatherId = data.weather[0].id;
        const weatherKo = weatherDescKo(weatherId);

        setKorDesc(weatherKo);
        setData(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getWeatherHour = async (lat, lon) => {
    try {
      const url = `${apiBase}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setDataHour(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const settings = {
    className: 'center',
    infinite: false,
    slidesToShow: 5,
    swipeToSlide: true,
  };

  const sliders = (data) => {
    return data.list.map((item, idx) => (
      <div key={idx} className="item">
        <p className="time">{item.dt_txt.slice(-8, -6)}시</p>
        <p className="img">
          <img
            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
            alt={item.weather[0].description}
          />
        </p>
        <p className="temp">{item.main.temp.toFixed(1)}°</p>
      </div>
    ));
  };

  const geolocation = (pos) => {
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = null;
      let lon = null;

      if (pos === 'default') {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      } else if (pos !== undefined) {
        lat = pos.lat;
        lon = pos.lon;
      } else {
        return;
      }

      getWeatherNow(lat, lon);
      getWeatherHour(lat, lon);
    });
  };

  useEffect(() => {
    geolocation('default');
    searchRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Weather">
      <h2>세계 도시별 날씨정보 APP</h2>
      <div className="info_box">
        <input
          type="text"
          ref={searchRef}
          value={search}
          onChange={onChange}
          onKeyDown={onKeyEvent}
          placeholder="도시명을 입력하세요. (영문)"
        />
        <button type="button" onClick={onClick}>
          검색
        </button>
      </div>

      {!data && (
        <div className="weather_content">
          <p>Loading...</p>
        </div>
      )}

      {isLoading && (
        <div className="loading_wrap">
          <p>
            <img src="/img/loding.gif" alt="loading" />
          </p>
        </div>
      )}

      {data && (
        <div className="weather_content">
          <>
            <p className="txt01">{data.name}</p>
            <p className="txt02">{korDesc}</p>
            <p className="img">
              <img
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt={data.weather[0].description}
              />
            </p>
            <p className="txt03">{data.main.temp.toFixed(1)}°</p>

            <p className="txt04">
              최고 {data.main.temp_max.toFixed(1)}° / 최저 {data.main.temp_min.toFixed(1)}°
            </p>
          </>
        </div>
      )}
      {dataHour && (
        <div className="slider-container">
          <Slider {...settings}>{sliders(dataHour)}</Slider>
        </div>
      )}
    </div>
  );
}

export default Weather;
