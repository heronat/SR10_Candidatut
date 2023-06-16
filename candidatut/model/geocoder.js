const NodeGeocoder = require('node-geocoder');

// Configuration du géocodeur
const geocoder = NodeGeocoder({
  provider: 'openstreetmap', // Utilisation du fournisseur OpenStreetMap (Nominatim)
});

function geocoding(address) {
    return geocoder.geocode(address)
        .then((res) => {
            if (res.length === 0) {
                throw new Error('Invalid address'); // Adresse invalide
            }
        
            const { latitude, longitude } = res[0];
        
            return { latitude, longitude };
        })
        .catch((err) => {
            throw err;
        });
}

function reverseGeocoding(latitude, longitude) {
    return geocoder.reverse({ lat: latitude, lon: longitude })
        .then((res) => {
            if (res.length === 0) {
                throw new Error('Invalid coordinates'); // Coordonnées invalides
            }

            const { formattedAddress } = res[0];

            return formattedAddress;
        })
        .catch((err) => {
            throw err;
        });
}


module.exports = geocoding, reverseGeocoding;