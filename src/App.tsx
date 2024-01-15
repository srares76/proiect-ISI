import Point from "@arcgis/core/geometry/Point";
import { child, get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import MapComponent from "./MapComponent";
import { Store } from "./apiTypes";
import { auth, db } from "./firebase";
import useAuth from "./components/useAuth";

function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [selectedJudet, seSelectedJudet] = useState<string | null>(null);
  const [shouldDisplayStores, setShouldDisplayStores] =
    useState<boolean>(false);
  const [shouldDisplayFavorites, setShouldDisplayFavorites] =
    useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<Point | null>(null);
  const [nearestStore, setNearestStore] = useState<Store | null>(null);

  console.log(favorites);

  const { user } = useAuth();

  /* Fetches the stores information from Firebase */
  useEffect(() => {
    const fetchData = async () => {
      try {
        /* Stores data */
        const storesRef = ref(db, "kaufland_stores");
        const storesSnapshot = await get(child(storesRef, "/"));

        if (storesSnapshot.exists()) {
          setStores(storesSnapshot.val());
        } else {
          console.log("No data available");
        }

        /* Favorites data */
        const favoritesData = ref(db, `userProfiles/${user!.uid}/favorites}`);
        const favoritesSnapshot = await get(child(favoritesData, "/"));

        if (favoritesSnapshot.exists()) {
          setFavorites(favoritesSnapshot.val());
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        },
        (error) => console.error("Error getting user location:", error)
      );
    }
    if (!userLoc) {
      return;
    }

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out failed", error);
    }
  };

  // eslint-disable-next-line no-nested-ternary
  const storesToDisplay = shouldDisplayStores
    ? shouldDisplayFavorites
      ? favorites.map(
          (fav) => stores.find((store) => store.store_id.toString() === fav)!
        )
      : stores
    : [];

  return (
    <div>
      <div className="ml-4 mt-2 flex gap-4">
        <button
          type="button"
          className={`p-2 mb-2 border-black border-2 ${
            shouldDisplayStores ? "bg-green-500" : ""
          }`}
          onClick={() => {
            setShouldDisplayStores((prev) => !prev);
          }}
        >
          Display all stores
        </button>
        <button
          type="button"
          className={`p-2 mb-2 border-black border-2 ${
            shouldDisplayFavorites ? "bg-green-500" : ""
          }`}
          onClick={() => {
            setShouldDisplayFavorites((prev) => !prev);
          }}
        >
          Display favorites
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
        <button
          type="button"
          onClick={handleSignOut}
          className="p-2 mb-2 border-black border-2"
        >
          Log out
        </button>
      </div>
      <MapComponent
        stores={storesToDisplay}
        favorites={favorites}
        setFavorites={setFavorites}
        selectedJudet={selectedJudet}
        setUserLocation={setUserLocation}
        userLocation={userLocation}
        nearestStore={nearestStore}
      />
    </div>
  );
}

export default App;
