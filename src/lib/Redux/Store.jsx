import { configureStore, createListenerMiddleware, current } from "@reduxjs/toolkit"; // Correct import
import combine_reducer from "./CombineReducer/Combine_Reducer"; // Use default import syntax
// import { authMiddleware } from "@/Middleware/AuthMiddleware";

const store = configureStore({
    reducer: combine_reducer,
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authMiddleware),
});

export default store;
