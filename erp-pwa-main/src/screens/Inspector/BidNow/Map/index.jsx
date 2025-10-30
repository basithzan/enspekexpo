import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

const InspectionMap = ({ latitude, longitude, name }) => {
    // Debug logging
    console.log('InspectionMap received:', { latitude, longitude, name });

    // Validate coordinates - ensure they are valid numbers
    const validLatitude = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null;
    const validLongitude = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null;

    console.log('Validated coordinates:', { validLatitude, validLongitude });

    // Check if we have valid coordinates (not null, not 0, and within valid ranges)
    const hasValidCoordinates = validLatitude !== null &&
                                validLongitude !== null &&
                                validLatitude !== 0 &&
                                validLongitude !== 0 &&
                                validLatitude >= -90 &&
                                validLatitude <= 90 &&
                                validLongitude >= -180 &&
                                validLongitude <= 180;

    console.log('Has valid coordinates:', hasValidCoordinates);

    // Don't render map if coordinates are invalid
    if (!hasValidCoordinates) {
        return (
            <div className='border border-[#E2E8F0] rounded-lg px-3 py-2'>
                <div className="font-medium">Location </div>
                <h6>Address: {name || 'Location not available'}</h6>
                <div className='py-4 bg-gray-100 rounded-lg flex items-center justify-center h-[200px]'>
                    <p className='text-gray-500 text-sm'>Map coordinates not available</p>
                </div>
            </div>
        );
    }
    const __getDirectionToUser = () => {
        // http://maps.google.com/maps?q=24.197611,120.780512
        try {
            const directionUrl =
                "http://maps.google.com/maps?q=" +
                validLatitude +
                "," +
                validLongitude;
            //

            if (window.ReactNativeWebView) {
                const response = {
                  type: 'open_file_on_browser',
                  data: directionUrl,
                };
                window.ReactNativeWebView.postMessage(JSON.stringify(response));
              } else {
                window.open(directionUrl, "_blank");
              }
        } catch {
            alert("Unable To Get Direction");
        }
    };
    return (
        <div className='border border-[#E2E8F0] rounded-lg px-3 py-2'>
            <div className="font-medium">Location </div>

            <h6> Address :  {name || 'Not specified'}</h6>
            <div className='py-4' onClick={() =>
                __getDirectionToUser(validLatitude, validLongitude)
            }>

                <MapContainer
                    center={[validLatitude, validLongitude]}
                    zoom={7}
                    style={{ height: '200px', width: '100%', borderRadius: "10px", zIndex: 0 }} // Set explicit height
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[validLatitude, validLongitude]}>
                        <Popup>
                            {name || 'Location'}
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default InspectionMap;
