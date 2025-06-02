document.addEventListener('DOMContentLoaded', function () {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  const locations = JSON.parse(mapElement.dataset.locations);

  const map = L.map('map').setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const bounds = [];

  locations.forEach(loc => {
    const [lng, lat] = loc.coordinates;
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<strong>${loc.description}</strong>`)
      .openPopup();
    bounds.push([lat, lng]);
  });

  map.fitBounds(bounds, { padding: [50, 50] });
});
