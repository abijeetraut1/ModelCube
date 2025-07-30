import { combineReducers } from '@reduxjs/toolkit';
import promptsReducer from './features/promptsSlice';
import responseReducer from './features/responseSlice';
import systemWorkflowReducer from './features/systemWorkflowSlice';

const rootReducer = combineReducers({
  prompts: promptsReducer,
  response: responseReducer,
  systemWorkflow: systemWorkflowReducer,
});

export default rootReducer;