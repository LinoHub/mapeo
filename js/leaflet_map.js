// BASIS OF THE MAP : Tile, map, minimap

// Tile layer
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
let imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});
let stoner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

// Map
let map = L.map('map', {center: [40.41, -3.7], zoom: 13, layers: stoner});

// Minimap
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data &copy; OpenStreetMap contributors';
    var osm3 = new L.TileLayer(osmUrl, {minZoom: 5, maxZoom: 18, attribution: osmAttrib});
    var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
    var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);


// SET UP THE URL LINK TO THE DIGITAL OCEAN DROPLET 

let droplet_IP = "https://community-radar.com";
let url = droplet_IP + "/sql?format=GeoJSON&q=";

// LOAD THE SITES ON THE GISDB TABLE SITES_SUB

// Create layer for submitted points 
let submittedData = L.layerGroup().addTo(map);

// Load existing data points
let sqlQuery_sub = "SELECT lat, long, tipo, barrio, nombre, contacto, ubicacion, web, red, geometry AS geom FROM sites_sub";

function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>NUEVO SITIO</b></br><b>Nombre: </b>"+feature.properties.nombre+
		"<br><b>Barrio: </b>"+feature.properties.barrio+
		"<br><b>Tipo: </b>"+feature.properties.tipo+
		"<br><b>Web: </b>"+feature.properties.web+
		"<br><b>Red: </b>"+feature.properties.red+
		"<br><b>Ubicacion: </b>"+feature.properties.ubicacion+
		"<br><b>Correo: </b>"+feature.properties.contacto
    );
}

fetch(url + sqlQuery_sub)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {
			onEachFeature: sites_pop2,
			pointToLayer: styles_sites,
		}).addTo(submittedData);
    });



// DRAWING CONTROL 

// Set it up 
let drawnItems = L.featureGroup().addTo(map);
new L.Control.Draw({
    draw : {
        polygon : false,
        polyline : false,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled 
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

// On draw - Create editable popup
map.addEventListener("draw:created", function(e) {
	e.layer.addTo(drawnItems);
    drawnItems.eachLayer(function(layer) {
        let geojson = JSON.stringify(layer.toGeoJSON().geometry);
        console.log(geojson);
    });
	createFormPopup();
});


// On edit or delete - Close popup
map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});


// Create editable form, on top of HTML code above script
function createFormPopup() {
    let popupContent = 
        '<form>' + 
        'Nombre:<br><input type="text" id="input_nombre"><br>' +
        'Barrio:<br><input type="text" id="input_barrio"><br>' +
		'Tipo:<br><select class="w3-select" name="option" id="input_tipo"> <option value="" disabled selected>Elige una opcion</option><option value="CSOA">CSOA</option> <option value="Libreria">Libreria</option><option value="NGO">NGO</option><option value="Huerto">Huerto</option><option value="CSA">CSA</option></select><br>' +
		'Sitio web:<br><input type="text" id="input_web"><br>' +
		'Red social:<br><input type="text" id="input_red"><br>' +
		'Contacto:<br><input type="text" id="input_contacto"><br>' +
		'Ubicacion:<br><input type="text" id="input_ubicacion"><br>' +
        '<input type="button" value="Submit" id="submit">' + 
        '</form>';
    drawnItems.bindPopup(popupContent).openPopup();
}


// SUBMISSION FUNCTION 

// Sending to GISDB Table sites_sub 
function setData(e) {
	if(e.target && e.target.id == "submit") {

		// Get user name and description
		let enteredNombre = document.getElementById("input_nombre").value;
		let enteredBarrio = document.getElementById("input_barrio").value;
		let enteredTipo = document.getElementById("input_tipo").value;
		let enteredWeb = document.getElementById("input_web").value;
		let enteredRed = document.getElementById("input_red").value;
		let enteredContacto = document.getElementById("input_contacto").value;
		let enteredUbicacion = document.getElementById("input_ubicacion").value;


		// Print user name and description
		console.log(enteredNombre);
		console.log(enteredBarrio);
		console.log(enteredTipo);
		console.log(enteredWeb);
		console.log(enteredRed);
		console.log(enteredContacto);
		console.log(enteredUbicacion);

		// Get and print GeoJSON for each drawn layer
		drawnItems.eachLayer(function(layer) {
			
			let drawing = JSON.stringify(layer.toGeoJSON().geometry);
			console.log(drawing);
			let lat = layer.toGeoJSON().geometry.coordinates[1]; 
			let long = layer.toGeoJSON().geometry.coordinates[0];   
			console.log(lat);
			console.log(long);
			
			let sql = 
                "INSERT INTO sites_sub (geometry, nombre, barrio, tipo, web, red, contacto, ubicacion, lat, long) " + 
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" + 
                drawing + "'), 4326), '" + 
                enteredNombre + "', '" + 
                enteredBarrio + "', '" +
				enteredTipo + "', '" +
				enteredWeb + "', '" +
				enteredRed + "', '" +
				enteredContacto + "', '" +
				enteredUbicacion + "', '" +
				lat + "', '" +
				long + "')" ;

			let encoded = encodeURI(sql);
			console.log(sql);
			console.log(encoded);
			console.log(url);
			console.log(url + sql);

			// Send the data
			fetch(url + encodeURI(sql))
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });
        
        // Transfer submitted drawing to the CARTO layer
        let newData = layer.toGeoJSON();
        newData.properties.nombre = enteredNombre;
        newData.properties.barrio = enteredBarrio;
		newData.properties.tipo = enteredTipo;
		newData.properties.web = enteredWeb;
		newData.properties.red = enteredRed;
		newData.properties.contacto = enteredContacto;
		newData.properties.ubicacion = enteredUbicacion;
        
		L.geoJSON(newData, {
			onEachFeature: addPopup
		}).addTo(submittedData);

    });

    // Clear drawn items layer
    drawnItems.closePopup();
    drawnItems.clearLayers();
    
}};


// Click on 'submit' event listener
document.addEventListener("click", setData);





// INFORMATION BOX AND BASEMAP/OVERLAY FOR MUNICIPIOS & DISTRITOS  

// Information box
let info = L.control({position: "bottomleft"});
info.onAdd = function() {
    let div = L.DomUtil.create("div", "info");
    div.innerHTML = '<p font size="12"><b>Municipios de Madrid</b></p><p id="currentMunicipios"></p><br><p><b>Distritos de Madrid</b></p><p id="currentDistritos">';
    return div;
};
info.addTo(map);

// OverlayMaps
let baseMaps = {
    "Stoner": stoner,
	"OSM": osm,
	"Imagery": imagery
};
let punto = L.marker([40.91, -3.1]).bindPopup('Soy un puntazo');
let overlayMaps = {
    "Puntazo": punto
};
let control = L.control.layers(baseMaps, overlayMaps, {
			position: 'topright', // 'topleft', 'bottomleft', 'bottomright'
			collapsed: false // true
		}).addTo(map);
control.removeLayer(punto);


// FUNCTIONS FOR THE STYLES OF MUNICIPIOS & DISTRITOS

// Highlight functions
let geojson_dis; 
let geojson_mun;
let info_mun = document.getElementById("currentMunicipios");
let info_dis = document.getElementById("currentDistritos");

let highlightStyle = {
    weight: 5,
    color: "black",
    fillOpacity: 0.5
};

function highlightFeature(e) {
    e.target.setStyle(highlightStyle);
    e.target.bringToFront();
    info_mun.innerHTML =
        e.target.feature.properties.NAMEUNIT;
	info_dis.innerHTML =
        e.target.feature.properties.NOMDIS;
}

function resetHighlight(e) {
    geojson_mun.resetStyle(e.target);
    info_mun.innerHTML = "";
}

// Function for random colors style
function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.2,
        fillColor: '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
    };
}


// ADD THE MUNICIPIOS & DISTRITOS

// Add the municipios of Madrid
fetch("../data/municipios.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        geojson_mun = L.geoJSON(data, {
			style: style,
			onEachFeature: function(feature, layer) {
                layer.addEventListener("mouseover", highlightFeature);
                layer.addEventListener("mouseout", resetHighlight);
            }
		}).addTo(map);
		let overlayMaps = {
			"Municipios": geojson_mun
		};
		let control_mun = L.control.layers(baseMaps, overlayMaps, {
			position: 'topleft', // 'topleft', 'bottomleft', 'bottomright'
			collapsed: false // true
		}).addTo(map);
		control_mun.removeLayer(stoner);
		control_mun.removeLayer(osm);
		control_mun.removeLayer(imagery);
    });


// Add the district of Madrid
let distritos = fetch("../data/distritos.geojson")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        geojson_dis = L.geoJSON(data, {
			style: style,
			onEachFeature: function(feature, layer) {
                layer.addEventListener("mouseover", highlightFeature);
                layer.addEventListener("mouseout", resetHighlight);
			}
		}).addTo(map);
		let overlayMaps = {
			"Distritos M": geojson_dis
		};
		let control_dis = L.control.layers(baseMaps, overlayMaps, {
			position: 'topleft', // 'topleft', 'bottomleft', 'bottomright'
			collapsed: false // true
		}).addTo(map);
		control_dis.removeLayer(stoner);
		control_dis.removeLayer(osm);
		control_dis.removeLayer(imagery);
    });



// FUNCTIONS FOR THE STYLE OF SITES (ICONS) AND THE POPUP INFO

// Function of style of sites 
function styles_sites(feature, latlng) {
				if (feature.properties.tipo === "Libreria") {
				return L.marker(latlng, {
					icon: L.AwesomeMarkers.icon({icon: 'book', iconColor: 'black', markerColor: 'red', prefix: 'fa'}) 
				});
				} 
				else if (feature.properties.tipo === "CSOA") {
				  return L.marker(latlng, {
					icon: L.AwesomeMarkers.icon({icon: 'users', iconColor: 'black', markerColor: 'blue', prefix: 'fa'}) 
				  });
				}
				else if (feature.properties.tipo === "Huerto") {
				  return L.marker(latlng, {
					icon: L.AwesomeMarkers.icon({icon: 'tree', iconColor: 'black', markerColor: 'green', prefix: 'fa'}) 
				  });
				}
				else if (feature.properties.tipo === "NGO") {
				  return L.marker(latlng, {
					icon: L.AwesomeMarkers.icon({icon: 'globe', iconColor: 'black', markerColor: 'pink', prefix: 'fa'}) 
				  });
				}
				else if (feature.properties.tipo === "CSA") {
				  return L.marker(latlng, {
					icon: L.AwesomeMarkers.icon({icon: 'users', iconColor: 'black', markerColor: 'darkblue', prefix: 'fa'}) 
				  });
				}
			};


// Function for the popup of sites
function sites_pop(feature, layer) {
	var popupText = "<b>" + feature.properties.nombre + "<br>";
				layer.bindPopup(popupText);
				category = feature.properties.tipo;
         		 // Initialize the category array if not already set.
				if (typeof categories[category] === "undefined") {
					categories[category] = L.layerGroup().addTo(map);
					layersControl.addOverlay(categories[category], category);
        		}	
          		categories[category].addLayer(layer);
				layer.on('mouseover', function() { 
					layer.openPopup(layer.bindPopup("<b>"+feature.properties.nombre+"</b>"))
				});
				layer.on('mouseout', function() { 
					layer.closePopup(); 
				});
				layer.on('click', function () {
					layer.bindPopup("<b>Nombre: </b>"+feature.properties.nombre+"<br><b>Barrio: </b>"+feature.properties.barrio+"<br><b>Tipo: </b>"+feature.properties.tipo+ "<br><b>Sitio web: </b>"+feature.properties.web+"<br><b>Red social: </b>"+feature.properties.red+"<br><b>Ubicacion: </b>"+feature.properties.ubicacion+"<br><b>Correo: </b>"+feature.properties.contacto);
				});
}

function sites_pop2(feature, layer) {
	var popupText = "<b>" + feature.properties.nombre + "<br>";
				layer.bindPopup(popupText);
				category = feature.properties.tipo;
         		 // Initialize the category array if not already set.
				if (typeof categories[category] === "undefined") {
					categories[category] = L.layerGroup().addTo(map);
					layersControl.addOverlay(categories[category], category);
        		}	
          		categories[category].addLayer(layer);
				layer.on('mouseover', function() { 
					layer.openPopup(layer.bindPopup("<b>(NUEVO SITIO)</b><b>"+feature.properties.nombre+"</b>"))
				});
				layer.on('mouseout', function() { 
					layer.closePopup(); 
				});
				layer.on('click', function () {
					layer.bindPopup("<b>Nombre: </b>"+feature.properties.nombre+"<br><b>Barrio: </b>"+feature.properties.barrio+"<br><b>Tipo: </b>"+feature.properties.tipo+ "<br><b>Sitio web: </b>"+feature.properties.web+"<br><b>Red social: </b>"+feature.properties.red+"<br><b>Ubicacion: </b>"+feature.properties.ubicacion+"<br><b>Correo: </b>"+feature.properties.contacto);
				});
}

// Set up categories for sites legend breakdown
var categories = {},
      category;
var layersControl = L.control.layers(null, null,{
	position: 'topright', // 'topleft', 'bottomleft', 'bottomright'
	collapsed: false // true
} ).addTo(map);



// ADD THE SITES FROM GISDB VALIDATED TABLE 'SITES_VAL'

// Insert the URL for the Droplet DB 
let sqlQuery = "SELECT lat, long, tipo, barrio, nombre, contacto, ubicacion, web, red, geometry AS geom FROM sites_val";


// Load the sites from droplet gisdb nombre db with fetch 
async function getData() {
	const response = await fetch(url + sqlQuery);
	const sites = await response.json();
	return sites;
}

let sites = getData()
	.then((function(data) {
		L.geoJSON(data, {
		pointToLayer: styles_sites,
		onEachFeature: sites_pop
		}).addTo(map);
	}));




// OTHER MAP FEATURES 


	
