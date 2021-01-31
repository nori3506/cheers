import React, { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'

const containerStyle = {
  width: '400px',
  height: '400px',
}

const center = {
  lat: 49.2576508,
  lng: -123.1939433,
}

function MyComponent() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
  })

  const [map, setMap] = useState(null)

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds()
    map.fitBounds(bounds)
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <></>
    </GoogleMap>
  ) : (
    <></>
  )
}

// export default React.memo(MyComponent)
export default MyComponent
