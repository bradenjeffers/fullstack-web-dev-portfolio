// Describes the three collections an admin can manage so that one add-form and
// one list component can serve all of them (the original had six near-copies).
export const ENTITIES = {
  categories: {
    key: "categories",
    singular: "Category",
    plural: "Categories",
    detailField: "description",
    detailLabel: "Description",
  },
  cuisines: {
    key: "cuisines",
    singular: "Cuisine",
    plural: "Cuisines",
    detailField: "description",
    detailLabel: "Description",
  },
  restaurants: {
    key: "restaurants",
    singular: "Restaurant",
    plural: "Restaurants",
    detailField: "address",
    detailLabel: "Address",
  },
};

// Route params are user-controlled, so guard against keys like "constructor".
export const getEntity = (key) =>
  Object.prototype.hasOwnProperty.call(ENTITIES, key) ? ENTITIES[key] : undefined;
