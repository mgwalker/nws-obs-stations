import * as leaflet from "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js";

const main = async () => {
  const stations = await fetch("stations.json").then((response) =>
    response.json(),
  );

  const conusCenter = [39.8333, -98.5833];

  const map = leaflet.map("map").setView(conusCenter, 5);
  leaflet
    .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    .addTo(map);

  const stationRenderer = leaflet.canvas({});
  for (const station of stations) {
    leaflet
      .circleMarker([station.geo.lat, station.geo.lon], {
        color: "blue",
        radius: 3,
        renderer: stationRenderer,
      })
      .addTo(map)
      .bindPopup(
        `<strong>${station.name}</strong><br>Elevation: ${station.geo.elevation.feet} feet<br><a href="${station.id}/observations?limit=1" target="_blank">obs</a>`,
      );
  }
};

document.addEventListener("DOMContentLoaded", main);
