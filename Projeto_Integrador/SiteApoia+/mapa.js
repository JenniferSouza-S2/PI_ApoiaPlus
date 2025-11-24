const map = L.map("map").setView([-23.5505, -46.6333], 11);

L.tileLayer("https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=d198ccb4aa0c4a9f9deda14cbee2bbf6", {
    attribution: '© <a href="https://www.geoapify.com/">Geoapify</a> contributors',
    maxZoom: 19
}).addTo(map);

const ongIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", 
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const userIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", 
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png", 
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});


const ongs = [
    {
        nome: "Coopcent ABC",
        endereco: "Av. Doná Ida, 182 - São José, Santo André, SP",
        coords: [-23.6931, -46.5056]
    },
    {
        nome: "Associação Amigos dos Animais de Diadema",
        endereco: "Rua Pau do Café, 1530 - Jardim Santa Elisabeth, Diadema, SP",
        coords: [-23.7088, -46.6026]
    },
    {
        nome: "Instituto Autismo & Vida",
        endereco: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP",
        coords: [-23.5613, -46.6565]
    },
    {
        nome: "Projeto Recicla SP",
        endereco: "Rua Vergueiro, 1000 - Liberdade, São Paulo - SP",
        coords: [-23.5733, -46.6408]
    },
    {
        nome: "Instituto Casa do Caminho",
        endereco: "R. Estado de Israel, 59 - Vila Mariana, São Paulo - SP",
        coords: [-23.5930, -46.6341]
    },
    {
        nome: "ONG Criança Feliz",
        endereco: "R. Guaranésia, 175 - Vila Maria, São Paulo - SP",
        coords: [-23.5262, -46.6111]
    },
    {
        nome: "Associação Lar dos Velhinhos",
        endereco: "Alameda Cassaquera, 250 - Barcelona, S. Caetano do Sul, SP",
        coords: [-23.6144, -46.5746]
    },
    {
        nome: "ONG Amor Animal",
        endereco: "R. Pará, 345 - Vila Vitória, Mauá, SP",
        coords: [-23.6674, -46.4601]
    },
    {
        nome: "Projeto Esperança",
        endereco: "R. Silveira da Mota, 114 - Vila Mariana, São Paulo, SP",
        coords: [-23.5857, -46.6293]
    },
    {
        nome: "Instituto Viva Melhor",
        endereco: "R. Amador Bueno, 900 - Santo André, SP",
        coords: [-23.6610, -46.5290]
    },
    {
        nome: "GASS – Grupo de Apoio Social ao Sorocabano",
        endereco: "R. Sorocaba, 396 - São Bernardo do Campo, SP",
        coords: [-23.7142, -46.5498]
    },
    {
        nome: "Associação São Judas Tadeu",
        endereco: "Av. Bosque da Saúde, 1373 - Saúde, São Paulo, SP",
        coords: [-23.6264, -46.6346]
    },
    {
        nome: "Instituto Gerando Falcões",
        endereco: "R. Alfredo Pinto, 185 - Poá, SP",
        coords: [-23.5794, -46.3312]
    },
    {
        nome: "AACD - Associação de Assistência à Criança Deficiente",
        endereco: "Av. Prof. Ascendino Reis, 724 - Vila Clementino, SP",
        coords: [-23.5976, -46.6391]
    },
    {
        nome: "Amparo Animal",
        endereco: "R. João Gualberto de Abreu, 219 - Mandaqui, São Paulo, SP",
        coords: [-23.4777, -46.6579]
    },
    {
        nome: "Hospitalhaços",
        endereco: "R. Dr. João Vilar, 114 - Santo André, SP",
        coords: [-23.6669, -46.5358]
    },
    {
        nome: "ONG Turma do Bem",
        endereco: "Av. Paulista, 726 - Bela Vista, São Paulo, SP",
        coords: [-23.5658, -46.6499]
    },
    {
        nome: "SOS Mata Atlântica",
        endereco: "R. Conselheiro Ramalho, 727 - Bela Vista, São Paulo, SP",
        coords: [-23.5615, -46.6450]
    },
    {
        nome: "Associação Maria Helen Drexel",
        endereco: "R. Dr. Mário Vicente, 622 - Ipiranga, São Paulo, SP",
        coords: [-23.5936, -46.6083]
    },
    {
        nome: "APAE de São Paulo",
        endereco: "R. Loefgren, 2109 - Vila Clementino, São Paulo, SP",
        coords: [-23.6166, -46.6360]
    },
    {
        nome: "Projeto Arrastão",
        endereco: "R. Dr. Joviano Pacheco de Aguirre, 255 - Campo Limpo, SP",
        coords: [-23.6495, -46.7725]
    },
    {
        nome: "Instituto Reciclar",
        endereco: "Av. Dr. Gastão Vidigal, 1339 - Vila Leopoldina, SP",
        coords: [-23.5356, -46.7454]
    },
    {
        nome: "ASPAS – Associação de Proteção e Amparo Social",
        endereco: "R. D. Mateus, 26 - Vila Prudente, São Paulo, SP",
        coords: [-23.5852, -46.5714]
    },
    {
        nome: "Casa do Zezinho",
        endereco: "R. Anália Dolácio Albino, 30 - Parelheiros, São Paulo, SP",
        coords: [-23.7951, -46.7265]
    },
    {
        nome: "Lar Escola São Francisco",
        endereco: "Av. Eng. Francisco de Paula Brandão, 1400 - Butantã, SP",
        coords: [-23.5707, -46.7329]
    },
    {
        nome: "Instituto Akatu",
        endereco: "R. General Jardim, 633 - Consolação, São Paulo, SP",
        coords: [-23.5458, -46.6468]
    },
    {
        nome: "Adote Um Gatinho",
        endereco: "R. Dr. Adhemar de Barros, 111 - Tatuapé, São Paulo, SP",
        coords: [-23.5414, -46.5866]
    },
    {
        nome: "Associação Evangélica Beneficente",
        endereco: "R. Dr. João Vilar, 335 - Santo André, SP",
        coords: [-23.6662, -46.5385]
    },
    {
        nome: "Instituição Dona Zica",
        endereco: "R. Turiassu, 1400 - Perdizes, São Paulo, SP",
        coords: [-23.5354, -46.6806]
    },
    {
        nome: "Associação Vaga Lume",
        endereco: "R. Major Sertório, 210 - República, São Paulo, SP",
        coords: [-23.5463, -46.6441]
    }
];

ongs.forEach((ong) => {
    
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${ong.coords[0]},${ong.coords[1]}`;
    L.marker(ong.coords, { icon: ongIcon })
        .addTo(map)
        .bindPopup(`
            <b>${ong.nome}</b><br>
            ${ong.endereco}<br>
            <a href="${mapsLink}" target="_blank">Ver no Google Maps</a>
        `);
});


const info = document.getElementById("info");
const popup = document.getElementById("popup-localizacao");
const botaoPermitir = document.getElementById("permitir");
const botaoNegar = document.getElementById("negar");

function buscarLocalizacao() {

  popup.style.display = "none";
  info.textContent = "Buscando sua localização...";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
    (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            map.setView([lat, lon], 13);

            L.marker([lat, lon], { icon: userIcon })
                .addTo(map)
                .bindPopup("<b>Você está aqui!</b>")
                .openPopup();

            info.textContent = "";
            info.style.display = 'none';
        },
        (error) => {
            console.error("Erro na geolocalização:", error);
            info.textContent = "Permissão negada. Exibindo ONGs da região de São Paulo.";
            map.setView([-23.5505, -46.6333], 11);
        }
    );
  } else {
    info.textContent = "Geolocalização não suportada neste navegador.";
  }
}

botaoPermitir.addEventListener("click", buscarLocalizacao);

botaoNegar.addEventListener("click", () => {
    popup.style.display = "none";
    info.textContent = "Localização manual. Exibindo ONGs da região de São Paulo.";
    info.style.display = 'block'; 
});

popup.style.display = "flex";