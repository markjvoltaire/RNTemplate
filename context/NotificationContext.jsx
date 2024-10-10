import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

function NotificationProvider({ children }) {
  const [notification, setNotification] = useState();

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

function useNotification() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error(
      "useNotification needs to be inside the NotificationProvider"
    );
  }
  return context;
}

export { NotificationProvider, useNotification };
