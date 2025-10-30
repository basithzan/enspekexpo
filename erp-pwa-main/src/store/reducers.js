import { combineReducers } from "redux";
import inspectorSlice from "./inspector/inspectorSlice";
import clientSlice from "./client/clientSlice";


const rootReducer = combineReducers({
  inspector:inspectorSlice,
  client:clientSlice,
});

export default rootReducer;