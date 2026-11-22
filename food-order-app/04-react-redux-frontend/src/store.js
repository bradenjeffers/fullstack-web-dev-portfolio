import { legacy_createStore as createStore, applyMiddleware, combineReducers, compose } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import localStorageEngine from "redux-persist/lib/storage";
import sessionStorageEngine from "redux-persist/lib/storage/session";

import { appReducers } from "./reducers";

// redux-persist is the single place state touches browser storage:
//  - the logged-in user lives in sessionStorage (gone when the tab closes),
//  - admin-added catalogue items live in localStorage.
// API list state (loading/error/fetched data) is deliberately not persisted.
const rootReducer = combineReducers({
  ...appReducers,
  login: persistReducer(
    { key: "login", storage: sessionStorageEngine, whitelist: ["userInfo"] },
    appReducers.login
  ),
  localCatalog: persistReducer({ key: "localCatalog", storage: localStorageEngine }, appReducers.localCatalog),
});

const composeEnhancers =
  (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
export const persistor = persistStore(store);

export default store;
