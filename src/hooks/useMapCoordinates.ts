import { google } from 'google-maps';
import { useCallback, useEffect, useState } from 'react';
import { Coordinates, geocoder, Map } from '../App';
import useMapCenter from './useMapCenter';

const useMapCoordinates = (
  googleApi: google | null,
  mapOne: google.maps.Map<HTMLDivElement> | null,
  mapTwo: google.maps.Map<HTMLDivElement> | null,
) => {
  const MAP_ONE_ADDRESS = '23-34 28th AVE, Astoria NY 11102';
  const MAP_TWO_ADDRESS = '1500 N Warner St, Tacoma, WA 98416';

  type SetCallback = (coordinates: Coordinates) => void;

  const setCoords = useCallback(async (
    address: string,
    setCallback: SetCallback
  ): Promise<void> => {
    let data;

    if (address.length > 0) data = (await geocoder.geocode(address))[0];

    if (data) {
      const { latitude: lat, longitude: lng } = data;

      setCallback({ lat: lat as number, lng: lng as number } as Coordinates);
    }
  }, []);

  const [mapOneCoordinates, setMapOneCoordinates] = useState<Coordinates | null>(null);
  const [mapTwoCoordinates, setMapTwoCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    setCoords(MAP_ONE_ADDRESS, setMapOneCoordinates);
    setCoords(MAP_TWO_ADDRESS, setMapTwoCoordinates);
  }, [setCoords]);

  const setAddress = useCallback((address: string, setCallback: SetCallback) => {
    setCoords(address, setCallback);
  }, [setCoords])

  const [mapOneAddress, setMapOneAddress] = useState<string>(MAP_ONE_ADDRESS);
  const [mapTwoAddress, setMapTwoAddress] = useState<string>(MAP_TWO_ADDRESS);

  useEffect(() => {
    setAddress(mapOneAddress, setMapOneCoordinates)
  }, [mapOneAddress, setAddress])

  useEffect(() => {
    setAddress(mapTwoAddress, setMapTwoCoordinates)
  }, [mapTwoAddress, setAddress])

  useMapCenter(googleApi, mapOne, mapOneCoordinates);
  useMapCenter(googleApi, mapTwo, mapTwoCoordinates);

  return {
    mapOneCoordinates, mapOneAddress, setMapOneAddress,
    mapTwoCoordinates, mapTwoAddress, setMapTwoAddress
  }
}

export default useMapCoordinates;
