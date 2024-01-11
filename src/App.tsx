import Point from "@arcgis/core/geometry/Point";
import { child, get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import { Store } from "./components/apiTypes";
import { db } from "./firebase";

function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedJudet, seSelectedJudet] = useState<string | null>(null);
  const [shouldDisplayStores, setShouldDisplayStores] =
    useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<Point | null>(null);
  const [nearestStore, setNearestStore] = useState<Store | null>(null);

  /* Fetches the stores information from Firebase */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRef = ref(db, "kaufland_stores");
        const snapshot = await get(child(dataRef, "/"));

        if (snapshot.exists()) {
          setStores(snapshot.val());
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const judete = stores.reduce((acc: string[], store) => {
    const { judet } = store.data;
    if (!acc.includes(judet)) {
      acc.push(judet);
    }
    return acc;
  }, []);

  const findNearestStore = () => {
    let userLoc = userLocation;
    if (userLoc === null) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLoc = new Point({ x: longitude, y: latitude });
          setUserLocation(userLoc);

          // Call the function to find and display the route
          // findAndDisplayRoute(userLocation);
        },
        (error) => console.error("Error getting user location:", error)
      );
    }
    if (!userLoc) return;

    const userLong = userLoc.longitude;
    const userLat = userLoc.latitude;

    const nrstStore = stores.reduce((acc: Store | null, store) => {
      const storeLong = store.data.location.longitude;
      const storeLat = store.data.location.latitude;

      const distance = Math.sqrt(
        (userLong - storeLong) ** 2 + (userLat - storeLat) ** 2
      );

      if (!acc) {
        acc = store;
      } else {
        const accLong = acc.data.location.longitude;
        const accLat = acc.data.location.latitude;

        const accDistance = Math.sqrt(
          (userLong - accLong) ** 2 + (userLat - accLat) ** 2
        );

        if (distance < accDistance) {
          acc = store;
        }
      }

      return acc;
    }, null);

    setNearestStore(nrstStore);
    console.log(nrstStore);
  };

  return (
    <div>
      <div className="flex gap-4">
        <button
          type="button"
          className="p-2 mb-2 border-black border-2"
          onClick={() => {
            setShouldDisplayStores((prev) => !prev);
          }}
        >
          Display stores
        </button>
        <select
          className="p-2 mb-2 border-black border-2"
          onChange={(option) => {
            if (option.target.value === "All") {
              seSelectedJudet(null);
              return;
            }
            seSelectedJudet(option.target.value);
          }}
        >
          <option>All</option>
          {judete.map((judet) => (
            <option key={judet}>{judet}</option>
          ))}
        </select>
        <button
          type="button"
          className="p-2 mb-2 border-black border-2"
          onClick={() => findNearestStore()}
        >
          Route to nearest store
        </button>
      </div>
      <MapComponent
        stores={shouldDisplayStores ? stores : []}
        selectedJudet={selectedJudet}
        setUserLocation={setUserLocation}
        userLocation={userLocation}
        nearestStore={nearestStore}
      />
    </div>
  );
}

export default App;
