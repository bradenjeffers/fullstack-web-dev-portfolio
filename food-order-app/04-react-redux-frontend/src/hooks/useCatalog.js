import { useMemo } from "react";
import { useSelector } from "react-redux";

const LIST_STATE_KEY = {
  categories: "categoryList",
  cuisines: "cuisineList",
  restaurants: "restaurantList",
};

// Items for one collection: whatever the API returned plus anything an admin
// added locally. `entity` is "categories" | "cuisines" | "restaurants".
const useCatalog = (entity) => {
  const listState = useSelector((state) => state[LIST_STATE_KEY[entity]]);
  const local = useSelector((state) => state.localCatalog[entity]);

  return useMemo(
    () => ({
      items: [...(listState[entity] || []), ...local],
      loading: Boolean(listState.loading),
      error: listState.error,
    }),
    [listState, local, entity]
  );
};

export default useCatalog;
