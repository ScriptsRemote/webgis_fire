
# WebGIS Fire - Monitoramento de Focos de Queimadas

Este projeto WebGIS foi desenvolvido para monitoramento de focos de queimadas e incêndios florestais utilizando dados do satélite NOAA-21, integrados com uma interface interativa baseada em Leaflet. A aplicação permite ao usuário visualizar, analisar e contabilizar focos de queimadas dentro de uma área de interesse desenhada no mapa.

## Funcionalidades

- **Visualização de Focos de Queimadas**: Mapa que mostra a localização dos focos de queimadas acumulados desde 01/01/2024 até a data atual.
- **Camadas de Limite Geográfico**: Inclui camadas WMS como limites estaduais e municipais.
- **Desenho de Áreas de Interesse**: Permite desenhar áreas de interesse no mapa (polígonos e retângulos) para calcular o número de focos de queimadas presentes dentro da área.
- **Upload de Arquivos GeoJSON/KML**: O usuário pode fazer upload de arquivos GeoJSON ou KML para análise espacial.
- **Contador de Focos de Queimadas**: Um contador que exibe a quantidade de focos dentro da área de interesse selecionada.
  
## Tecnologias Utilizadas

- **Frontend**: 
  - HTML5, CSS3
  - Leaflet.js (Mapas)
  - Leaflet.draw (Ferramentas de desenho)
  - Fetch API para solicitações WMS/WFS

- **Backend**:
  - Node.js para servir os arquivos estáticos e manipular as requisições.
  - Express.js para configurar o servidor (inclua se necessário no `server.js`).
  
- **Serviços de Dados**:
  - **WMS (Web Map Service)**: Fornece dados geoespaciais, como limites estaduais e focos de queimadas, do GeoServer do [DataGeo](https://datageo.ambiente.sp.gov.br/).
  - **WFS (Web Feature Service)**: Utilizado para obter dados vetoriais (focos de queimadas) dentro da área de interesse desenhada.

## Como Usar

### Pré-requisitos
Para rodar o projeto localmente, você precisará do Node.js instalado em sua máquina. Se ainda não o tiver, pode baixá-lo [aqui](https://nodejs.org/).

### Passos para Execução Local

1. **Clone este repositório**:
   ```bash
   git clone https://github.com/ScriptsRemote/webgis_fire.git
   cd webgis_fire
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor**:
   ```bash
   npm start
   ```

4. Abra seu navegador e acesse o seguinte endereço:
   ```
   http://localhost:3000
   ```

### Deploy no Render.com

O deploy pode ser feito facilmente através da plataforma [Render.com](https://render.com/), utilizando os seguintes comandos:

- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Funcionalidades Principais:

1. **Upload de Arquivos GeoJSON/KML**:
   - Carregue seus arquivos de geodados no formato GeoJSON ou KML para análise.
   - Faça o upload no botão localizado na barra lateral.

2. **Desenho de Áreas de Interesse**:
   - Utilize a ferramenta de desenho para criar polígonos ou retângulos sobre o mapa.
   - O número de focos de queimadas será atualizado no contador na barra lateral.

3. **Contagem de Focos de Queimadas**:
   - O contador exibirá automaticamente o número de focos de queimadas encontrados na área desenhada.

### Fontes dos Dados

- [DataGeo Ambiente SP](https://datageo.ambiente.sp.gov.br/app/#)
- [Focos de Queimadas - Geoportal](https://datageo.ambiente.sp.gov.br/geoportal/catalog/search/resource/details.page?uuid=%7B13EF2A15-1600-4513-BB81-858B1DF21A6A%7D)

### Autor

Este WebGIS foi desenvolvido por **Christhian Cunha** da AmbGEO Cursos e Treinamento LTDA. Para mais informações, acesse o site: [AmbGEO](https://ambgeo.com/).
