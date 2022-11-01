document.addEventListener("contextmenu", (event) => event.preventDefault()); //disable right click for map

fetch(
  "https://phl.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM public_cases_fc WHERE requested_datetime >= current_date - 7"
)
  .then((response) => response.json())
  .then((data) => {
    const philly311 = data.features.filter(
      (d) => d.geometry !== null && d.properties.status === "Open"
    );

    const deckgl = new deck.DeckGL({
      container: "map",
      // Set your Mapbox access token here
      mapboxApiAccessToken:
        "pk.eyJ1Ijoibmlrby1kZWxsaWMiLCJhIjoiY2w5c3p5bGx1MDh2eTNvcnVhdG0wYWxkMCJ9.4uQZqVYvQ51iZ64yG8oong",
      // Set your Mapbox style here
      mapStyle: "mapbox://styles/niko-dellic/cl9t226as000x14pr1hgle9az",
      initialViewState: {
        latitude: 39.9526,
        longitude: -75.1652,
        zoom: 12,
        bearing: 0,
        pitch: 0,
      },
      controller: true,

      layers: [
        new deck.ScatterplotLayer({
          id: "points-311", // layer id
          data: philly311, // data formatted as array of objects
          getPosition: (d) => d.geometry.coordinates, // coordinates [lng, lat] for each data point
          // Styles
          opacity: 0.7,
          stroked: false,
          filled: true,
          radiusScale: 20,
          radiusMinPixels: 2,
          radiusMaxPixels: 50,
          lineWidthMinPixels: 1,
          getFillColor: [255, 255, 255],
        }),
      ],
    });
  });
