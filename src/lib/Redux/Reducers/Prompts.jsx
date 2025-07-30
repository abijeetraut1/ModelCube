import { createSlice } from "@reduxjs/toolkit";

const prompt_control_slice = createSlice({
    name: "prompt_slice",

    // Refers Project Description
    initialState: {
        Title: "Explorer", // i.e Database Name also
        Category: "Category",
        Database: "mysql",
        ORM: "prisma",
        Frontend_Framework: "react",
        Backend_Framework: "nodejs",
        Description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sit, omnis iste accusamus consequatur velit dolore impedit aliquam dicta ullam in.",
        Prompt: "",
    },
    reducers: {
        setTitle: (state, action) => {
            console.log(action.payload)
            state.Title = action.payload;
        },
        // setDatabase: (state, action) => {
        //     console.log(action.payload)
        //     const CheckExistingTable = state.Database.some(el => el.Table == action.payload.Table);

        //     if (CheckExistingTable) return;

        //     const NewTable = {
        //         Table: action.payload.Table,
        //         Columns: []
        //     };

        //     state.Database.push(NewTable);
        // },
        setDatabase: (state, action) => {
            state.Database = action.payload;
        },
        setFrontendFramework: (state, action) => {
            state.Frontend_Framework = action.payload;
        },
        setBackendFramework: (state, action) => {
            state.Backend_Framework = action.payload;
        },
        setCategory: (state, action) => {
            state.Category = action.payload;
        },
        setDescription: (state, action) => {
            state.Description = action.payload;
        },
        setPrompt: (state, action) => {
            state.Prompt = action.payload;
        },


    },
});

export const {
    setTitle,
    setDatabase,
    setCategory,
    setDescription,
    setBackendFramework,
    setFrontendFramework,
    setPrompt
} = prompt_control_slice.actions;

export default prompt_control_slice.reducer;
