import { LOCAL_ITEM_ADD, LOCAL_ITEM_REMOVE } from "../constants/localCatalogConstants";

// Items an admin adds in the UI. The backends this client talks to are
// read-only for these collections (05) or not wired up here (06), so the
// additions live in the browser and are merged into the fetched lists.
export const initialLocalCatalog = {
  categories: [],
  cuisines: [],
  restaurants: [],
};

export const localCatalogReducer = (state = initialLocalCatalog, action) => {
  switch (action.type) {
    case LOCAL_ITEM_ADD:
      return { ...state, [action.entity]: [...state[action.entity], action.item] };
    case LOCAL_ITEM_REMOVE:
      return {
        ...state,
        [action.entity]: state[action.entity].filter((item) => item.id !== action.id),
      };
    default:
      return state;
  }
};
