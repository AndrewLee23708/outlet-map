/* global document */
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import Map, {Marker} from 'react-map-gl';
import MapboxGeocoder, {GeocoderOptions} from '@mapbox/mapbox-gl-geocoder'
import GeocoderControl from './geocoder-control';
import { GeolocateControl, NavigationControl } from 'react-map-gl';
import { Popup } from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
const MAPBOX_TOKEN = 'pk.eyJ1Ijoia3dhbmcyMDAyIiwiYSI6ImNsZ2d5dXRnYjBnY3IzZW1vMmZhZmlmNHgifQ.X2yO9r0KRGfgdkly34ophw'; // Set your mapbox token here

function Root() {
    const [viewState, setViewState] = React.useState({
        longitude: -74.003207,
        latitude: 40.719632,
        zoom: 14
    });
    const [adding, setAdding] = React.useState(false)
    const [popup, setPopup] = React.useState(null)
    const [markers, setMarkers] = React.useState([])
    
    React.useEffect(() => {
        const getMarkers = async () => {
            const body = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const res = await fetch('/api/locations', body)
            const data = await res.json()
            // console.log(data)
            setMarkers(data)
        }
        getMarkers()
            .catch(err => console.log(err))
    }, [])

    const handleOnResult = (evt) => {
        const { result } = evt;
        const location =
          result &&
          (result.center || (result.geometry?.type === 'Point' && result.geometry.coordinates));
        if (location) {
            console.log('getting set')
          setPopup({
            longitude: location[0],
            latitude: location[1],
          });
        } else {
          setPopup(null);
        }
      };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        console.log('submitting')
        setAdding(false)
        const body = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(popup)
        }
        const res = await fetch('/api/locations', body)
        console.log(body)
        console.log(res)
    }

    const mapContent = (
        <>
          <NavigationControl position="bottom-right" />
          <GeolocateControl
            position="top-left"
            trackUserLocation
            onGeolocate={(e) => console.log(e.coords)}
          />
          {adding && <GeocoderControl mapboxAccessToken={MAPBOX_TOKEN} position="top-left" onResult={handleOnResult} style={{ backgroundColor: 'white' }}/>}
        </>
      );

    if (adding) {
        return (
            <>
            <button onClick={() => setAdding(!adding)}>add marker</button>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{width: 800, height: 600}}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                mapboxAccessToken={MAPBOX_TOKEN}
                maxBounds={[-74.09919,40.573975,-73.563774,40.873196]}
            >
                {mapContent}
                {popup && (
              <Popup
                longitude={popup.longitude}
                latitude={popup.latitude}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setPopup(null)}
                anchor="top"
              >
                <div>
                    {/* {console.log('at')} */}
                  <label htmlFor="name">Name: </label>
                  <input type="text" id="name" />
                  <button onClick={handleSubmit}>Submit</button>
                </div>
              </Popup>
            )}
            </Map>
            
            </>
        );
    }
    else {
        return (
        <>
        <button onClick={() => setAdding(!adding)}>not add marker</button>
        <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            style={{width: 800, height: 600}}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken={MAPBOX_TOKEN}
            maxBounds={[-74.09919,40.573975,-73.563774,40.873196]}

        >
            {mapContent}
            {markers.map(element => {
                return <Marker key={element[0] + '' + element[1]} longitude={element[0]} latitude={element[1]} />
            })}
        </Map>
        
        </>
        );
    }
}

const root = createRoot(document.body.appendChild(document.createElement('div')));
root.render(<Root />);