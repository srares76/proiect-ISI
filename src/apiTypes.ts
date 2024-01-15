type StoreLocation = {
  latitude: number;
  longitude: number;
};

type StoreData = {
  address: string;
  closing_hours: string;
  judet: string;
  location: StoreLocation;
  name: string;
  opening_hours: string;
  rating: number;
};

export type Store = {
  data: StoreData;
  store_id: number;
};
