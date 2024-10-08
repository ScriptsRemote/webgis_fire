// Inicializa o mapa
var map = L.map('map').setView([-23.5505, -46.6333], 10);

// Variável para armazenar a camada GeoJSON (declarada globalmente)
var geojsonLayer;

// Definir as camadas base
var baseMaps = {
    "OpenStreetMaps": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),  
    "Google-Satellite": L.tileLayer(
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
            minZoom: 0,
            maxZoom: 20,
            id: "google.satellite"
        }
    ),
    "ESRI": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.esri.com">ESRI</a> contributors'
        }
    ).addTo(map),
};

// Camada WMS de focos de incêndio (exemplo)
var wmsLayer = L.tileLayer.wms('https://datageo.ambiente.sp.gov.br/geoserver/datageo/ows', {  
    layers: 'VWM_FOCOS_QUEIMADAS_INPE_NOAA_21_2024_PTO',  
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
}).addTo(map);

// Outras camadas WMS (Limites, Municípios, etc.)
var sp_limite_layer = L.tileLayer.wms('http://datageo.ambiente.sp.gov.br/geoserver/datageo/ows?', {
    layers: 'LimiteEstadual',  
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
}).addTo(map);

var sp_muni_layer = L.tileLayer.wms('http://datageo.ambiente.sp.gov.br/geoserver/datageo/ows?', {
    layers: 'VWM_MUNICIPIO_LIMITE_50_10_IGC_2021_POL',  
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
}).addTo(map);

var sp_sedes_layer = L.tileLayer.wms('http://datageo.ambiente.sp.gov.br/geoserver/datageo/ows?', {
    layers: 'SedesMunicipais',  
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
});

// Função para construir a URL de GetFeatureInfo
function getFeatureInfoUrl(latlng, layer) {
    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
        size = map.getSize(),
        bounds = map.getBounds().toBBoxString(),
        url = layer._url + '?service=WMS&version=1.1.1&request=GetFeatureInfo' +
        '&layers=' + layer.wmsParams.layers +
        '&query_layers=' + layer.wmsParams.layers +
        '&bbox=' + bounds +
        '&width=' + size.x + '&height=' + size.y +
        '&srs=EPSG:4326' +
        '&info_format=text/html' +  
        '&x=' + point.x + '&y=' + point.y;

    return url;
}

// Evento de clique no mapa para obter informações de uma feição
map.on('click', function (e) {
    if (activeWmsLayer) {
        var url = getFeatureInfoUrl(e.latlng, activeWmsLayer);  
        fetch(url)
            .then(response => response.text())  
            .then(data => {
                var info = data || 'Nenhuma feição encontrada';
                document.getElementById('info-content').innerHTML = info;
                document.getElementById('info').style.display = 'block';
            })
            .catch(err => console.log('Erro ao obter informações:', err));
    }
});

// Adiciona funcionalidade de fechar a janela de informações
document.querySelector('#info .close-btn').addEventListener('click', function () {
    document.getElementById('info').style.display = 'none';
});

// Função para alterar a camada WMS ativa
map.on('overlayadd', function(e) {
    if (e.layer instanceof L.TileLayer.WMS) {
        activeWmsLayer = e.layer; 
    }
});

// Definir as sobreposições
var overlayMaps = {
    "Limite Estadual": sp_limite_layer,
    "Limites Municipais": sp_muni_layer,
    "Sedes Municipais": sp_sedes_layer,
    "Focos de Queimadas (WMS)": wmsLayer
};

// Adicionar controle de camadas ao mapa
var controlLayers = L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map);

// Função para contar focos de incêndio em uma área
function countFireFocuses(bbox) {
    var wfsUrl = wmsLayer._url.replace('wms', 'wfs') + 
                 '?service=WFS&version=1.0.0&request=GetFeature' + 
                 '&typename=VWM_FOCOS_QUEIMADAS_INPE_NOAA_21_2024_PTO' + 
                 '&bbox=' + bbox + 
                 '&outputFormat=application/json';

    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            var focosCount = data.features.length;
            document.getElementById('focus-count').textContent = focosCount;
        })
        .catch(err => console.log('Erro ao obter informações: ', err));
}

// Adiciona uma camada GeoJSON ao mapa e conta focos de incêndio na área carregada
function addGeoJSONToMap(geojsonData) {
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    geojsonLayer = L.geoJSON(geojsonData, {
        style: function (feature) {
            return {
                color: "#ff7800",
                weight: 2,
                opacity: 0.65
            };
        }
    }).addTo(map);

    map.fitBounds(geojsonLayer.getBounds());

    // Capturar o BBOX da área carregada e contar os focos de incêndio
    var bounds = geojsonLayer.getBounds();
    var bbox = bounds.toBBoxString();
    countFireFocuses(bbox);

    overlayMaps["GeoJSON Carregado"] = geojsonLayer;
    controlLayers.addOverlay(geojsonLayer, "Área de Interesse");
}

// Função para processar arquivos e adicionar ao mapa
document.getElementById('file-upload').addEventListener('change', function (event) {
    var file = event.target.files[0];

    if (file) {
        if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var geojsonData = JSON.parse(e.target.result);
                addGeoJSONToMap(geojsonData);
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.kml') || file.name.endsWith('.kmz')) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var kmlData = e.target.result;
                var kmlLayer = L.geoJSON(toGeoJSON.kml(new DOMParser().parseFromString(kmlData, 'text/xml')));
                map.addLayer(kmlLayer);
                map.fitBounds(kmlLayer.getBounds());

                // Capturar o BBOX da área KML carregada e contar os focos de incêndio
                var bounds = kmlLayer.getBounds();
                var bbox = bounds.toBBoxString();
                countFireFocuses(bbox);
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.zip')) {
            processShapefile(file);
        }
    }
});

// Função para processar Shapefiles carregados
async function processShapefile(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const geojson = await shp(arrayBuffer);
        const geojsonLayer = L.geoJSON(geojson).addTo(map);

        map.fitBounds(geojsonLayer.getBounds());

        // Capturar o BBOX da área Shapefile carregada e contar os focos de incêndio
        var bounds = geojsonLayer.getBounds();
        var bbox = bounds.toBBoxString();
        countFireFocuses(bbox);

        controlLayers.addOverlay(geojsonLayer, file.name);
    } catch (error) {
        console.error('Erro ao processar o shapefile:', error);
    }
}

// Inicializa a variável que vai armazenar a camada WMS ativa
var activeWmsLayer = wmsLayer;

// Adicionar o controle de desenho
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: true,
        rectangle: true,
        circle: false,
        marker: false,
        polyline: false
    }
});

map.addControl(drawControl);

// Evento de desenho finalizado
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    // Capturar o bounds da área desenhada e fazer a contagem de focos
    var bounds = layer.getBounds();
    var bbox = bounds.toBBoxString(); 
    countFireFocuses(bbox);
});
