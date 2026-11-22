// Shared reducer for "fetch a list" state. `key` is the name of the array in
// state (e.g. "categories"). Previously loaded items are kept while a refresh
// is in flight or fails, so the UI does not flash empty.
const createListReducer = (key, types) => {
  const initialState = { loading: false, error: null, [key]: [] };

  return (state = initialState, action) => {
    switch (action.type) {
      case types.REQUEST:
        return { ...state, loading: true, error: null };
      case types.SUCCESS:
        return { ...state, loading: false, error: null, [key]: action.payload };
      case types.FAIL:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
};

export default createListReducer;
