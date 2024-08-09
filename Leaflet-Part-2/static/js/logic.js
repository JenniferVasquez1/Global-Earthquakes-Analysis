let map = L.map('map').setView([20, -20], 3);

let grayscale = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let street = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

satellite.addTo(map)

const url1 = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson';
const url2 = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

d3.json(url1).then(data => {

    let earthquakes = new L.layerGroup();

    L.geoJSON(data, {
        style: function (feature) {
            let depth = feature.geometry.coordinates[2];
            let mag = feature.properties.mag;
            return {
                radius: mag * 4,
                color: 'black',
                weight: .5,
                fillOpacity: .6,
                fillColor:
                    depth > 90 ? 'red' :
                        depth > 70 ? 'darkorange' :
                            depth > 50 ? 'orange' :
                                depth > 30 ? 'yellow' :
                                    depth > 10 ? 'lime' : '#14e80f'
            };
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        }
    }).bindPopup(function (layer) {
        let depth = layer._latlng.alt;
        let place = layer.feature.properties.place;
        let mag = layer.feature.properties.mag;
        let time = new Date(layer.feature.properties.time).toLocaleString();

        return `
            <h5>
                ${place}<br>
                Magnitude: ${mag}<br>
                Depth: ${depth}<br>
                ${time}
            </h5>
        `;
    }).addTo(earthquakes);

    earthquakes.addTo(map);

    d3.json(url2).then(plates => {
        console.log(plates);

        let tectonicplates = new L.layerGroup();

        L.geoJSON(plates, {
            color: 'red',
            weight: 2
        }).addTo(tectonicplates);

        L.control.layers(
            {
                Grayscale: grayscale,
                Outdoor: street,
                Satellite: satellite
            }, { 
                Earthquakes: earthquakes, 
                'Tectonic Plates': tectonicplates 
            }, { collapsed: false }).addTo(map)
    })
});

let legend = L.control({ position: 'bottomright' });

legend.onAdd = () => {
    let div = L.DomUtil.create('div', 'legend');

    div.innerHTML = `
        <h3>Depth</h3>
        <i style="background:#14e80f"></i> -10-10 <br>
        <i style="background:lime"></i> 10 - 30 <br>
        <i style="background:yellow"></i> 30 - 50 <br>
        <i style="background:orange"></i> 50 - 70 <br>
        <i style="background:darkorange"></i> 70 - 90 <br>
        <i style="background:red"></i> 90+ <br>
    `;

    return div;
};

legend.addTo(map);

