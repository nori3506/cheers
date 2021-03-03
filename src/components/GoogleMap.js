import React, { useState, useRef, useCallback, useEffect } from 'react'
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '400px',
}

const options = {
  disableDefaultUI: true,
  zoomControl: true,
}

const center = {
  lat: 49.282729,
  lng: -123.120738,
}

const zoom = 11

const libraries = ['places']

function Map(props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDD0yhWzFyyF-ipcWomUf39xmycbnf1zSw',
    libraries,
  })

  const { shops, reviews } = props

  const [bounds, setBounds] = useState(null)
  const [shopsOnMap, setShopsOnMap] = useState(shops)
  const [selected, setSelected] = useState(null)

  const mapRef = useRef()

  const handleLoad = useCallback(map => {
    mapRef.current = map
  }, [])

  const handleBoundsChange = () => {
    if (mapRef.current) {
      setBounds(mapRef.current.getBounds())
    }
  }

  useEffect(() => {
    if (bounds) {
      const newShopsOnMap = shops.filter(shop =>
        bounds.contains({
          lat: shop.geocode.latitude,
          lng: shop.geocode.longitude,
        })
      )
      setShopsOnMap(newShopsOnMap)
    }
  }, [shops, bounds])

  if (loadError) return 'Error loading map'
  if (!isLoaded) return 'Loading map'

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        options={options}
        zoom={zoom}
        onLoad={handleLoad}
        onBoundsChanged={handleBoundsChange}
      >
        {/* Child components, such as shops, info windows, etc. */}
        {shopsOnMap.map((shop, i) => {
          let reviewNum = 0
          reviews.forEach(review => {
            if (review.shop && review.shop.isEqual(shop.ref)) {
              reviewNum++
            }
          })
          if (reviewNum === 0) return null

          return (
            <Marker
              key={i}
              position={{
                lat: shop.geocode.latitude,
                lng: shop.geocode.longitude,
              }}
              label={reviewNum.toString()}
              onClick={() => setSelected(shop)}
            />
          )
        })}
        {selected ? (
          <InfoWindow
            position={{
              lat: selected.geocode.latitude,
              lng: selected.geocode.longitude,
            }}
            onCloseClick={() => {
              setSelected(null)
            }}
          >
            <div className="info-window">
              <h5>{selected.name}</h5>
              {reviews
                .filter(review => selected.ref.isEqual(review.shop))
                .map((review, i) => (
                  <div key={review.ref.id}>
                    <h2>{review.drink_name}</h2>
                    <p>{review.drink_category}</p>
                    <p>${review.price}</p>
                    <p>{review.comment}</p>
                  </div>
                ))}
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>

      <div>
        <ul>
          {shopsOnMap.map(shop => (
            <li key={shop.ref.id} onClick={() => setSelected(shop)} style={{ cursor: 'pointer' }}>
              {shop.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default React.memo(Map)
