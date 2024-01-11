// MapComponent.js
import { loadModules } from "esri-loader";
import { useEffect, useRef } from "react";
import { Store } from "./components/apiTypes";

interface MapComponentProps {
  stores: Store[];
  selectedJudet: string | null;
}

function MapComponent({ stores, selectedJudet }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the ArcGIS API modules
    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/tasks/RouteTask",
        "esri/tasks/support/RouteParameters",
        "esri/tasks/support/FeatureSet",
      ],
      { css: true }
    )
      .then(
        ([
          Map,
          MapView,
          Graphic,
          Point,
          // RouteTask,
          // RouteParameters,
          // FeatureSet,
        ]) => {
          const map = new Map({ basemap: "streets" });
          const view = new MapView({
            container: mapRef.current,
            map,
            center: [24.9668, 45.9432],
            zoom: 7,
          });
          let filtered_stores: Store[] = [];

          // Add a button for displaying the user's current location
          const locateButton = document.createElement("button");
          locateButton.innerHTML = "+";
          locateButton.classList.add(
            "esri-widget",
            "esri-widget--button",
            "esri-interactive"
          );
          locateButton.addEventListener("click", () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  const userLocation = new Point({ x: longitude, y: latitude });
                  view.goTo({ target: userLocation, zoom: 12 });
                },
                (error) => console.error("Error getting user location:", error)
              );
            } else {
              console.error("Geolocation is not supported by this browser.");
            }
          });

          view.ui.add(locateButton, "top-left");

          if (selectedJudet) {
            // eslint-disable-next-line no-param-reassign
            filtered_stores = stores.filter((store) => {
              console.log(store.data.judet, selectedJudet);
              return store.data.judet === selectedJudet;
            });
          }
          // console.log(stores, selectedJudet);

          (selectedJudet ? filtered_stores : stores).forEach((store, index) => {
            const storeLong = store.data.location.longitude;
            const storeLat = store.data.location.latitude;
            const storeAddress = store.data.address;
            const storeJudet = store.data.judet;
            const storeName = store.data.name;
            const storeSchedule = `${store.data.opening_hours} - ${store.data.closing_hours}`;
            const storeRating = store.data.rating;

            const graphic = new Graphic({
              geometry: new Point({
                x: storeLong,
                y: storeLat,
              }),
              symbol: {
                type: "simple-marker",
                color: [255, 0, 0],
                outline: {
                  color: [255, 255, 255],
                  width: 2,
                },
              },
              attributes: { ObjectID: index + 1 },
              popupTemplate: {
                title: "Store Information",
                content: `<p>Name: ${storeName}</p><p>Adress: ${storeAddress}, ${storeJudet}</p><p>Schedule: ${storeSchedule}</p><p>Rating: ${storeRating} / 5</p>`,
              },
            });

            view.graphics.add(graphic);
          });
        }
      )
      .catch((err) => console.error("Error loading ArcGIS modules:", err));
  }, [stores, selectedJudet]);

  return <div ref={mapRef} className="h-[800px]" />;
}

export default MapComponent;
