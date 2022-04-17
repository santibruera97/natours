export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic2JydWVyYSIsImEiOiJja3U2Y3E5YncwZjQwMnBwYWQ4bWo5eW9kIn0.CgoQKSXE9wGUOijIQUKkQw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/sbruera/cku6d0jkm1dvw18od4xl19gc0',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //Extend map bound to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 200, right: 200 },
  });
};
