import { createSlice, createAction } from "@reduxjs/toolkit";
import userService from "../services/user.service";
import authService from "../services/auth.service";
import { setTokens, getAccessToken, getUserId, removeAuthData } from "../services/localStorage.service";
import getRandomInt from "../utils/getRandomInt";
import history from "../utils/history";

const initialState = getAccessToken() ? {
        entities: null,
        isLoading: true,
        errors: null,
        auth: { userId: getUserId() },
        isLoggedIn: true,
        dataStatus: false

    } : {
        entities: null,
        isLoading: false,
        errors: null,
        auth: null,
        isLoggedIn: false,
        dataStatus: false
};
const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        usersRequested: (state) => {
          state.isLoading = true;
        },
        usersReceived: (state, action) => {
            state.entities = action.payload;
            state.dataStatus = true;
            state.isLoading = false;
        },
        usersReceiveFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        authRequestedSuccess: (state, action) => {
            state.auth = action.payload;
            state.isLoggedIn = true;
        },
        authRequestedFailed: (state, action) => {
           state.error = action.payload;
        },
        createUserSuccess: (state, action) => {
            state.entities.push(action.payload);
        },
        userLoggedOut: (state) => {
            state.entities = null;
            state.auth = null;
            state.isLoggedIn = false;
            state.isLoading = false;
        },
        userUpdated: (state, action) => {
            const userUpdateIdx = state.entities.findIndex(el => el._id === action.payload._id);
            state.entities[userUpdateIdx] = action.payload;
        },
         userUpdateFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        }
    }
});

const authRequested = createAction("users/authRequested");
const createUserRequested = createAction("users/createUserRequested");
const createUserRequestedFailed = createAction("users/createUserRequestedFailed");
const updateUserRequested = createAction("users/updateUserRequested");

const { reducer: usersReducer, actions } = usersSlice;
const {
        usersRequested,
        usersReceived,
        usersReceiveFailed,
        authRequestedSuccess,
        authRequestedFailed,
        createUserSuccess,
        userLoggedOut,
        userUpdated,
        userUpdateFailed
    } = actions;

export const loadUsersList = () => async (dispatch) => {
    dispatch(usersRequested());
    try {
        const { content } = await userService.get();
        dispatch(usersReceived(content));
    } catch (error) {
        dispatch(usersReceiveFailed(error.message));
    };
};

export const getUsers = () => (state) => state.users.entities;
export const getUserLoadingStatus = () => (state) => state.users.isLoading;
export const getUserById = (userId) => (state) => {
    return state.users.entities.find((user) => user._id === userId);
};
export const getIsLoggedIn = () => (state) => state.users.isLoggedIn;
export const getDataStatus = () => (state) => state.users.dataStatus;
export const getCurrentUserId = () => (state) => state.users.auth.userId;
export const getCurrentUserData = () => (state) => {
            return state.users.entities ? state.users.entities.find((u) => u._id === state.users.auth.userId) : null;
    };
export const signUp = ({ email, password, ...rest }) => async (dispatch) => {
    dispatch(authRequested());
    try {
        const data = await authService.register({ email, password });
        setTokens(data);
        dispatch(authRequestedSuccess({ userId: data.localId }));
        dispatch(createUser({
                _id: data.localId,
                email,
                rate: getRandomInt(1, 5),
                completedMeetings: getRandomInt(0, 200),
                image: `https://avatars.dicebear.com/api/avataaars/${(
                    Math.random() + 1
                )
                    .toString(36)
                    .substring(7)}.svg`,
                ...rest
            }
        ));
    } catch (error) {
        dispatch(authRequestedFailed(error.message));
    }

    function createUser(payload) {
        return async function (dispatch) {
            dispatch(createUserRequested());
            try {
                const { content } = await userService.create(payload);
                dispatch(createUserSuccess(content));
                history.push("/users");
            } catch (error) {
                dispatch(createUserRequestedFailed(error.message));
            }
        };
    }
};

export const logIn = ({ payload, redirect }) => async (dispatch) => {
      dispatch(authRequested());
      const { email, password } = payload;
      try {
        const data = await authService.login({ email, password });
        dispatch(authRequestedSuccess({ userId: data.localId }));
        setTokens(data);
        history.push(redirect);
      } catch (error) {
        dispatch(authRequestedFailed(error.message));
      }
};

export const logOut = () => (dispatch) => {
     removeAuthData();
     dispatch(userLoggedOut());
     history.push("/");
};

export const updateUserData = (payload) => async (dispatch) => {
    dispatch(updateUserRequested());
    try {
        const { content } = await userService.update(payload);
        dispatch(userUpdated(content));
        history.push(`/users/${content._id}`);
    } catch (error) {
        dispatch(userUpdateFailed());
    }
};

export default usersReducer;
