import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
	mobileSidebarOpen: boolean;
	rightDrawerOpen: boolean;
};

const initialState: UiState = {
	mobileSidebarOpen: false,
	rightDrawerOpen: false,
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
			state.mobileSidebarOpen = action.payload;
		},

		setRightDrawerOpen(state, action: PayloadAction<boolean>) {
			state.rightDrawerOpen = action.payload;
		},
	},
});

export const { setMobileSidebarOpen, setRightDrawerOpen } = uiSlice.actions;

export default uiSlice.reducer;
