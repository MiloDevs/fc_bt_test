import { configureStore, createSlice } from "@reduxjs/toolkit";

// define the initial state
export const initialState = {
    loggedIn: false,
    user: null,
    scaleAddress: "",
    printerAddress: "",
    BusinessId: "",
    records: 0,
    collections: [],
    suppliers: [],
    products: [],
    locations: [],
    sublocations: [],
};

// create a slice
const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setLoggedIn(state, action) {
            state.loggedIn = action.payload;
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        setScaleAddress(state, action) {
            state.scaleAddress = action.payload;
        },
        setPrinterAddress(state, action) {
            state.printerAddress = action.payload;
        },
        setBusinessId(state, action) {
            state.BusinessId = action.payload;
        },
        setCollections(state, action) {
            state.collections = action.payload;
        },
        setSuppliers(state, action) {
            state.suppliers = action.payload;
        },
        setProducts(state, action) {
            state.products = action.payload;
        },
        setLocations(state, action) {
            state.locations = action.payload;
        },
    },
});


// export the actions
export const { setScaleAddress, setPrinterAddress, setLoggedIn, setUser, setBusinessId } = settingsSlice.actions;

export default settingsSlice.reducer;