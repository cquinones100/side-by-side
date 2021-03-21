import React, { createRef, useEffect, useState, WheelEvent } from 'react';
import './App.css';
import { Loader, google } from 'google-maps';
import NodeGeocoder from 'node-geocoder';
import useMapCoordinates from './hooks/useMapCoordinates';

const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GEOCODER_KEY = process.env.REACT_APP_GOOGLE_GEOCODER_API_KEY;

const customFetch = (url: string, options: { [key: string]: any}) => {
  return fetch(url, options);
}

const googleMapsLoader = new Loader(MAPS_KEY, {});
export const geocoder = NodeGeocoder({
  provider: 'google',
  fetch: customFetch,
  apiKey: GEOCODER_KEY,
});

const DEFAULT_ZOOM = 15;

export interface Coordinates {
  lat: number;
  lng: number;
};

export type Map = google.maps.Map<HTMLDivElement>;

function App() {
  const [googleApi, setGoogleApi] = useState<google | null>(null);
  const [googleMap, setGoogleMap] = useState<google.maps.Map<HTMLDivElement> | null>(null);
  const [secondGoogleMap, setSecondGoogleMap] = useState<google.maps.Map<HTMLDivElement> | null>(null);

  const mapContainerRef = createRef<HTMLDivElement>();
  const secondMapContainerRef = createRef<HTMLDivElement>();

  const {
    mapOneCoordinates, mapOneAddress, setMapOneAddress,
    mapTwoCoordinates, mapTwoAddress, setMapTwoAddress
  } = useMapCoordinates(googleApi, googleMap, secondGoogleMap);

  const setZoom = (zoom: number) => {
    let newZoom = 0;

    if (zoom > 0) newZoom = zoom;

    [googleMap, secondGoogleMap].forEach(map => map?.setZoom(newZoom));
  }

  const handleScrollEvent = (e: WheelEvent<HTMLDivElement>) => {
    const newMapZoom = (googleMap?.getZoom() || 0) + ((e.deltaY / 100));

    setZoom(newMapZoom);
  };

  useEffect(() => {
    const getGoogle = async () => {
      if (googleApi) {
        const map = new googleApi.maps.Map(mapContainerRef.current as HTMLDivElement, {
          center: mapOneCoordinates as Coordinates,
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
          scaleControl: true,
          scrollwheel: false,
        });

        const secondMap = new googleApi.maps.Map(secondMapContainerRef.current as HTMLDivElement, {
          center: mapTwoCoordinates as Coordinates,
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
          scaleControl: true,
          scrollwheel: false,
        });

        setGoogleMap(map);
        setSecondGoogleMap(secondMap);
      } else {
        setGoogleApi(await googleMapsLoader.load());
      }
    };

    const shouldRenderMap = !googleMap &&
      !secondGoogleMap &&
      mapContainerRef.current &&
      mapOneCoordinates &&
      mapTwoCoordinates

    if (shouldRenderMap) getGoogle();
  }, [
    googleApi,
    googleMap,
    secondGoogleMap,
    mapContainerRef,
    secondMapContainerRef,
    mapOneCoordinates,
    mapTwoCoordinates
  ]);

  if (googleMap && secondGoogleMap && googleApi) {
    const mapOneTransit = new googleApi.maps.TransitLayer();
    const mapTwoTransit = new googleApi.maps.TransitLayer();

    mapOneTransit.setMap(googleMap);
    mapTwoTransit.setMap(secondGoogleMap);
  }

  return (
    <div className="App" onWheel={handleScrollEvent}>
      <h1>Maps!</h1>
      <div className='maps'>
        <div className='map-container'>
          <input
            placeholder='Address'
            value={mapOneAddress as string}
            onChange={e => { setMapOneAddress(e.target.value as string) }}
          />
          <div className='map' ref={mapContainerRef} />
        </div>
        <div className='map-container'>
          <input
            placeholder='Address'
            value={mapTwoAddress as string}
            onChange={e => { setMapTwoAddress(e.target.value as string) }}
          />
          <div className='map' ref={secondMapContainerRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
