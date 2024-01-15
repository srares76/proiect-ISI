// MapComponent.tsx
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import "@arcgis/core/assets/esri/themes/light/main.css";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import RouteLayer from "@arcgis/core/layers/RouteLayer.js";
import Stop from "@arcgis/core/rest/support/Stop.js";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters.js";
import { ref, set } from "firebase/database";
import { Store } from "./apiTypes";
import { API_KEY } from "./constants";
import useAuth from "./components/useAuth";
import { db } from "./firebase";

interface MapComponentProps {
  stores: Store[];
  favorites: string[];
  selectedJudet: string | null;
  setUserLocation: Dispatch<SetStateAction<Point | null>>;
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  nearestStore: Store | null;
  userLocation: Point | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  stores,
  favorites,
  selectedJudet,
  setUserLocation,
  setFavorites,
  nearestStore,
  userLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const map = new Map({ basemap: "streets" });
    const mapView = new MapView({
      container: mapRef.current!,
      map,
      center: [24.9668, 45.9432],
      zoom: 6,
    });
    setView(mapView);

    let filtered_stores: Store[] = [];
    if (selectedJudet) {
      filtered_stores = stores.filter((store) => {
        console.log(store.data.judet, selectedJudet);
        return store.data.judet === selectedJudet;
      });
    }

    if (!view) return;
    (selectedJudet ? filtered_stores : stores).forEach((store) => {
      const storeLong = store.data.location.longitude;
      const storeLat = store.data.location.latitude;
      const storeAddress = store.data.address;
      const storeJudet = store.data.judet;
      const storeName = store.data.name;
      const storeSchedule = `${store.data.opening_hours} - ${store.data.closing_hours}`;
      const storeRating = store.data.rating;

      const graphicsLayer = new GraphicsLayer();
      mapView.map.add(graphicsLayer);

      const point = new Point({
        longitude: storeLong,
        latitude: storeLat,
      });

      const simpleMarkerSymbol = {
        type: "simple-marker",
        color: [226, 0, 0],
        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      };

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol,
        attributes: {
          Name: storeName,
          Address: storeAddress,
          Schedule: storeSchedule,
          Rating: storeRating,
          Judet: storeJudet,
        },
        popupTemplate: {
          title: "{Name}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "Address",
                },
                {
                  fieldName: "Schedule",
                },
                {
                  fieldName: "Rating",
                },
                {
                  fieldName: "Judet",
                },
              ],
            },
            {
              type: "custom",
              creator() {
                const button = document.createElement("button");
                button.innerHTML = "Get directions";
                button.addEventListener("click", () => {
                  if (!userLocation) return;
                  const stops = [
                    new Stop({ geometry: userLocation }),
                    new Stop({ geometry: point }),
                  ];
                  const routeLayer = new RouteLayer({ stops });
                  mapView.map.add(routeLayer);
                  routeLayer
                    .solve({ apiKey: API_KEY } as RouteParameters)
                    .then((results) => {
                      routeLayer.update(results);
                      mapView.goTo(routeLayer.routeInfo.geometry);
                    });
                });
                return button;
              },
            },
            {
              type: "custom",
              creator(event) {
                const chosenStore = stores.find(
                  (kfd) => kfd.data.name === event.graphic.attributes.Name
                );
                const isFavorited = favorites.includes(
                  chosenStore!.store_id.toString()
                );
                const button = document.createElement("button");
                button.innerHTML = isFavorited
                  ? "Remove from favorites"
                  : "Save to favorites";

                button.addEventListener("click", async () => {
                  if (!chosenStore) return;
                  try {
                    const userProfileRef = ref(db, `userProfiles/${user!.uid}`);

                    if (!isFavorited) {
                      /* Set user profile data */
                      const newFavorites = [
                        ...favorites,
                        chosenStore.store_id.toString(),
                      ];
                      await set(userProfileRef, {
                        favorites: newFavorites,
                      });

                      setFavorites(newFavorites);
                      alert("Saved to favorites");
                    } else {
                      /* Remove from favorites */
                      const filteredFavorites = favorites.filter(
                        (fav) => fav !== chosenStore.store_id.toString()
                      );
                      await set(userProfileRef, {
                        favorites: filteredFavorites,
                      });
                      setFavorites(filteredFavorites);
                      alert("Removed from favorites");
                    }

                    console.log("User profile data saved successfully");
                  } catch (error) {
                    console.error("Error saving to favorites:", error);
                  }
                });
                return button;
              },
            },
          ],
        },
      });

      graphicsLayer.add(pointGraphic);
    });

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
            const userLoc = new Point({ x: longitude, y: latitude });
            setUserLocation(userLoc);
            mapView.goTo({
              target: userLoc,
              zoom: 12,
            });

            // Call the function to find and display the route
            // findAndDisplayRoute(userLocation);
          },
          (error) => console.error("Error getting user location:", error)
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    });

    mapView.ui.add(locateButton, "top-left");

    (async () => {
      /* Route to nearest store */
      if (!userLocation || !nearestStore) return;
      const stops = [
        new Stop({ geometry: userLocation }),
        new Stop({ geometry: nearestStore.data.location }),
      ];
      const routeLayer = new RouteLayer({ stops });
      mapView.map.add(routeLayer);
      const results = await routeLayer.solve({
        apiKey: API_KEY,
      } as RouteParameters);
      routeLayer.update(results);

      // Zoom to the extent of the solve route.
      view.goTo(routeLayer.routeInfo.geometry);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, selectedJudet]);

  return <div ref={mapRef} style={{ height: "750px" }} />;
};

export default MapComponent;
