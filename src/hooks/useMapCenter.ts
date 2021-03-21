import { useEffect, useRef } from "react";
import { google } from 'google-maps';
import { Coordinates, Map } from '../App';

const useMapCenter = (
  googleApi: google | null,
  map: Map | null,
  position: Coordinates | null
) => {
  const centerMarker = useRef<google.maps.Marker>();

  useEffect(() => {
    if (googleApi && map && position) {
      map.setCenter(position);

      if (googleApi) {
        if (centerMarker.current) centerMarker.current.setMap(null);

        centerMarker.current = new googleApi.maps.Marker({
          position,
          map,
        });
      }
    }
  }, [googleApi, map, position]);
};

export default useMapCenter;
