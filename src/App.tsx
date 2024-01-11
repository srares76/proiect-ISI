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
          onClick={() => null}
        >
          Route to nearest store
        </button>
      </div>
      <MapComponent
        stores={shouldDisplayStores ? stores : []}
        selectedJudet={selectedJudet}
      />
    </div>
  );
}

export default App;
