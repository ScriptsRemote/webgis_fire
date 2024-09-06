// Inicializa o mapa
var map = L.map('map').setView([-23.5505, -46.6333], 10);

// Definir as camadas base
var baseMaps = {
    "OpenStreetMaps": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),  // Adiciona a camada padrão
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

// Camada WMS (exemplo)
var wmsLayer = L.tileLayer.wms('https://datageo.ambiente.sp.gov.br/geoserver/datageo/ows', {  
    layers: 'VWM_FOCOS_QUEIMADAS_INPE_NOAA_21_2024_PTO',  
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
}).addTo(map);

// Adiciona a camada WMS do Limite Estadual
var sp_limite_layer = L.tileLayer.wms('http://datageo.ambiente.sp.gov.br/geoserver/datageo/ows?', {
    layers: 'LimiteEstadual',  // Nome da camada
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
}).addTo(map);

// Adiciona a camada WMS do Limite Estadual
var sp_muni_layer = L.tileLayer.wms('http://datageo.ambiente.sp.gov.br/geoserver/datageo/ows?', {
    layers: 'VWM_MUNICIPIO_LIMITE_50_10_IGC_2021_POL',  // Nome da camada
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
}).addTo(map);

// Adiciona a camada WMS do Limite Estadual
var sp_sedes_layer = L.tileLayer.wms('http://datageo.ambiente.sp.gov.br/geoserver/datageo/ows?', {
    layers: 'SedesMunicipais',  // Nome da camada
    format: 'image/png',
    transparent: true,
    attribution: "Dados do GeoServer"
});


// Função que constrói a URL de solicitação GetFeatureInfo
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

    console.log(url);
    return url;
}

// Evento de clique no mapa
map.on('click', function (e) {
    if (activeWmsLayer) {
        var url = getFeatureInfoUrl(e.latlng, activeWmsLayer);  
        fetch(url)
            .then(response => response.text())  
            .then(data => {
                console.log(data);  
                var info = '';

                if (data) {
                    info = data;  
                } else {
                    info = 'Nenhuma feição encontrada';
                }

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

// Função para alterar a camada WMS ativa ao selecionar uma nova camada
map.on('overlayadd', function(e) {
    if (e.layer instanceof L.TileLayer.WMS) {
        activeWmsLayer = e.layer;  // Atualiza a camada ativa
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


// Variável para armazenar a camada GeoJSON
var geojsonLayer;

// Função para adicionar o GeoJSON ao mapa e ao controle de camadas
function addGeoJSONToMap(geojsonData) {
    // Remove a camada anterior, se houver
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    // Adiciona a nova camada GeoJSON
    geojsonLayer = L.geoJSON(geojsonData, {
        style: function (feature) {
            return {
                color: "#ff7800",
                weight: 2,
                opacity: 0.65
            };
        }
    }).addTo(map);

    // Ajusta a visualização do mapa para o GeoJSON
    map.fitBounds(geojsonLayer.getBounds());

    // Atualiza o controle de camadas com o novo GeoJSON
    overlayMaps["GeoJSON Carregado"] = geojsonLayer;
    controlLayers.addOverlay(geojsonLayer, "Área de Interesse");
}

// Manipular o upload do arquivo GeoJSON
document.getElementById('geojson-upload').addEventListener('change', function (event) {
    var file = event.target.files[0];
    
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var geojsonData = JSON.parse(e.target.result);
            addGeoJSONToMap(geojsonData);
        };
        reader.readAsText(file);
    }
});

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

    // Capturar o bounds (limites) da área desenhada
    var bounds = layer.getBounds();
    var bbox = bounds.toBBoxString(); // Converte o bounds para BBOX formato

    // Construir a URL de GetFeatureInfo ou WFS
    var wfsUrl = wmsLayer._url.replace('wms', 'wfs') + 
                 '?service=WFS&version=1.0.0&request=GetFeature' + 
                 '&typename=VWM_FOCOS_QUEIMADAS_INPE_NOAA_21_2024_PTO' + 
                 '&bbox=' + bbox + 
                 '&outputFormat=application/json';

    // Fazer a requisição para contar os focos
    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            var focosCount = data.features.length;

            // Atualizar o número de focos na sidebar
            document.getElementById('focus-count').textContent = focosCount;
        })
        .catch(err => console.log('Erro ao obter informações: ', err));
});
