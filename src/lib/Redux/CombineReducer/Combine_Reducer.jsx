import { combineReducers } from "@reduxjs/toolkit";
import prompt from "../Reducers/Prompts";
import response from "../Reducers/response";
// import Auth from "../Reducers/Auth";
import SystemWorkflow from "../Reducers/SystemWorkflow";

const combine_reducer = combineReducers({
    prompt,
    response,
    workflow: SystemWorkflow
});

export default combine_reducer;
