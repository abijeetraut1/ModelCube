import { combineReducers } from '@reduxjs/toolkit';
import promptsReducer from '@/lib/Redux/Reducers/SystemWorkflow';
import responseReducer from './Reducers/responseSlice';
import systemWorkflowReducer from './Reducers/systemWorkflowSlice';

const rootReducer = combineReducers({
  prompts: promptsReducer,
  response: responseReducer,
  systemWorkflow: systemWorkflowReducer,
});

export default rootReducer;