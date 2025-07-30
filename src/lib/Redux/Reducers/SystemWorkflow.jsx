import { createSlice } from "@reduxjs/toolkit";

const SystemWorkflow = createSlice({
    name: "SystemWorkflow",
    initialState: {
        currentViewingFile: "root/app.js",
        onAuthSectionToggle: true,
        loading: false,
        error: "",
        currentProjectType: "",
        panelView: 'code',
        slug: ''
    },
    reducers: {
        setSlug: (state, action) => {
            state.slug = action.payload;
        },
        setPanelView: (state, action) => {
            console.log(action.payload)
            state.panelView = action.payload;
        },

        setCurrentProjectType: (state, action) => {
            if (action.payload == "new") {
                state.currentProjectType = "new_project";
            } else if (action.payload == "clone") {
                console.log(action.payload)
                state.currentProjectType = "clone";
            } else if (action.payload == "clear   ") {
                state.currentProjectType = "";
            }
        },

        setCurrentViewingFile: (state, action) => {
            state.currentViewingFile = action.payload;
        },

        setOnAuthSectionToggle: (state, action) => {
            state.onAuthSectionToggle = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },




    }
})

export const { setSlug, setPanelView, setToggleErrorSolveMode, setCurrentViewingFile, setOnAuthSectionToggle, setLoading, setError, setCurrentProjectType } = SystemWorkflow.actions;
export default SystemWorkflow.reducer;

