import { configureStore, createSlice } from "@reduxjs/toolkit";

// define the initial state
export const initialState = {
    scaleAddress: "",
    printerAddress: "",
};

// create a slice
const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setScaleAddress(state, action) {
            state.scaleAddress = action.payload;
        },
        setPrinterAddress(state, action) {
            state.printerAddress = action.payload;
        },
    },
});

// export the actions
export const { setScaleAddress, setPrinterAddress } = settingsSlice.actions;

export default settingsSlice.reducer;