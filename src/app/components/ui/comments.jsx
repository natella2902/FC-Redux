import { orderBy } from "lodash";
import React, { useEffect } from "react";
import CommentsList, { AddCommentForm } from "../common/comments";
import { useDispatch, useSelector } from "react-redux";
import { loadCommentsList, getCommentsLoadingStatus, getComments, createComment, deleteComment } from "../../store/comments";
import { useParams } from "react-router-dom";

const Comments = () => {
    const { userId } = useParams();
    const dispatch = useDispatch();
    useEffect(() => { dispatch(loadCommentsList(userId)); }, []);
    const comments = useSelector(getComments());
    const isLoading = useSelector(getCommentsLoadingStatus());

    const handleSubmit = (data) => {
        console.log(data);
        dispatch(createComment({ data, pageId: userId }));
    };
    const handleRemoveComment = (id) => {
        dispatch(deleteComment(id));
        // api.comments.remove(id).then((id) => {
        //     setComments(comments.filter((x) => x._id !== id));
        // });
    };
    const sortedComments = orderBy(comments, ["created_at"], ["desc"]);
    return (
        <>
            <div className="card mb-2">
                {" "}
                <div className="card-body ">
                    <AddCommentForm onSubmit={handleSubmit} />
                </div>
            </div>
            {sortedComments.length > 0 && (
                <div className="card mb-3">
                    <div className="card-body ">
                        <h2>Comments</h2>
                        <hr />
                        {!isLoading && <CommentsList
                            comments={sortedComments}
                            onRemove={handleRemoveComment}
                        />}
                    </div>
                </div>
            )}
        </>
    );
};

export default Comments;
