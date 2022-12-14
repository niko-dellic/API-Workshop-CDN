document.addEventListener("contextmenu", (event) => event.preventDefault()); //disable right click for map

fetch(
  "https://phl.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM public_cases_fc WHERE requested_datetime >= current_date - 30"
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
        new deck.HexagonLayer({
          id: "hex-311", // layer id
          data: philly311, // data formatted as array of objects
          // Styles
          extruded: true,
          radius: 200,
          elevationScale: 4,
          getPosition: (d) => d.geometry.coordinates, // coordinates [lng, lat] for each data point
          pickable: true, // enable picking
          autoHighlight: true, // highlight on hover
          highlightColor: [255, 255, 255, 200], // highlight color
          colorRange: [
            [237, 248, 251],
            [191, 211, 230],
            [158, 188, 218],
            [140, 150, 198],
            [136, 86, 167],
            [129, 15, 124],
          ],
          onClick: (info) => {
            flyToClick(info.object.position);

            const report = {};
            let serviceSentence = "";
            info.object.points.forEach((element) => {
              report[element.source.properties.service_request_id] =
                element.source.properties.service_name;
              serviceSentence = [...new Set(Object.values(report))].join(", ");
            });
            panel.style.opacity = 1;

            if (!document.querySelector("#exit")) {
              const exit = document.createElement("div");
              exit.id = "exit";
              exit.innerHTML = "X";
              exit.addEventListener("click", hidePanel);
              panel.appendChild(exit);
            }

            document.querySelector("#complaints")?.remove();
            const complaintsDiv = document.createElement("div");
            complaintsDiv.id = "complaints";
            complaintsDiv.innerHTML = `<h3>311 complaints in Philadelphia in the last 30 days</h3><p>${serviceSentence}</p>`;
            panel.appendChild(complaintsDiv);
          },
        }),
      ],

      getTooltip: ({ object }) => {
        if (object) {
          return (
            object && {
              html: `${object.points.length} complaints in this hexagon.`,
              style: { maxWidth: "300px", backgroundColor: "black" },
            }
          );
        }
      },
    });

    function flyToClick(coords) {
      deckgl.setProps({
        initialViewState: {
          longitude: coords[0],
          latitude: coords[1],
          zoom: 13,
          bearing: 0,
          pitch: 0,
          transitionDuration: 500,
          transitionInterpolator: new deck.FlyToInterpolator(),
        },
      });
    }
    function hidePanel() {
      document.getElementById("panel").style.opacity = 0;
    }
  });
