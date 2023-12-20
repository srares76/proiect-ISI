import { addDoc, collection, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "./firebase";

function App() {
  const storesRef = collection(db, "kaufland_stores");
  const fetchQuery = query(storesRef);
  const data = useCollectionData(fetchQuery);

  console.log(data);

  const handleAddDoc = async () => {
    try {
      await addDoc(collection(db, "test"), { name: "rares" });
      console.log("succes?");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-red-300">
      <button type="button" onClick={handleAddDoc}>
        Add Doc
      </button>
    </div>
  );
}

export default App;
