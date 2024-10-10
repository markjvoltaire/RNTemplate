import { createContext, useContext, useState } from "react";

const LocationContext = createContext();

function LocationProvider({ children }) {
  const [location, setLocation] = useState();

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

function useLocation() {
  const context = useContext(LocationContext);

  if (context === undefined) {
    throw new Error("useLocation needs to be inside the UserProvider");
  }
  return context;
}

export { LocationProvider, useLocation };
