import { LOCAL_ITEM_ADD, LOCAL_ITEM_REMOVE } from "../constants/localCatalogConstants";

// `entity` is one of "categories" | "cuisines" | "restaurants".
// The id is generated here (not in the reducer) to keep the reducer pure.
export const addLocalItem = (entity, fields) => ({
  type: LOCAL_ITEM_ADD,
  entity,
  item: {
    ...fields,
    id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    local: true,
  },
});

export const removeLocalItem = (entity, id) => ({
  type: LOCAL_ITEM_REMOVE,
  entity,
  id,
});
