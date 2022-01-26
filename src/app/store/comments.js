import { createSlice, createAction } from "@reduxjs/toolkit";
import commentService from "../services/comment.service";
import { nanoid } from "nanoid";
import { getCurrentUserId } from "./users";

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        entities: null,
        isLoading: true,
        error: null
    },
    reducers: {
        commentsRequested: (state) => {
          state.isLoading = true;
        },
        commentsReceived: (state, action) => {
            state.entities = action.payload;
            state.isLoading = false;
        },
        commentsReceiveFaild: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        commentCreateSuccess: (state, action) => {
            state.entities.push(action.payload);
        },
        commentDeleted: (state, action) => {
            state.entities = state.entities.filter(c => c._id !== action.payload);
        }
    }
});

const createCommentRequested = createAction("comment/createCommentRequested");
const createCommentRequestedFailed = createAction("comment/createCommentRequestedFailed");
const deleteCommentRequested = createAction("comment/deleteCommentRequested");
const deleteCommentFailed = createAction("comment/deleteCommentFailed");

const { reducer: commentsReducer, actions } = commentsSlice;
const { commentsRequested, commentsReceived, commentsReceiveFaild, commentCreateSuccess, commentDeleted } = actions;

export const loadCommentsList = (userId) => async (dispatch) => {
    dispatch(commentsRequested());
    try {
        const { content } = await commentService.getComments(userId);
        dispatch(commentsReceived(content));
    } catch (error) {
        dispatch(commentsReceiveFaild(error.message));
    };
};

export const getComments = () => (state) => state.comments.entities;
export const getCommentsLoadingStatus = () => (state) => state.comments.isLoading;

export const createComment = (payload) => async (dispatch, getState) => {
    dispatch(createCommentRequested());
    const comment = {
        ...payload,
        _id: nanoid(),
        created_at: Date.now(),
        userId: getCurrentUserId()(getState())
    };
    try {
           const { content } = await commentService.createComment(comment);
           dispatch(commentCreateSuccess(content));
        } catch (error) {
        dispatch(createCommentRequestedFailed(error.message));
    }
};

export const deleteComment = (commentId) => async (dispatch) => {
    dispatch(deleteCommentRequested());
    try {
        const { content } = await commentService.removeComment(commentId);
        if (content === null) {
        dispatch(commentDeleted(commentId));
        }
    } catch (error) {
        dispatch(deleteCommentFailed(error.message));
    }
};

export default commentsReducer;
