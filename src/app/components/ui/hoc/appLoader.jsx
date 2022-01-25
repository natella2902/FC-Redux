import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUsersList, getIsLoggedIn, getUserLoadingStatus } from "../../../store/users";
import { loadQualitiesList } from "../../../store/qualities";
import { loadProfessionsList } from "../../../store/professions";
import propTypes from "prop-types";

const AppLoader = ({ children }) => {
    const dispatch = useDispatch();
    const userIsLoggedIn = useSelector(getIsLoggedIn());
    const userStatusLoading = useSelector(getUserLoadingStatus());

    useEffect(() => {
        dispatch(loadQualitiesList());
        dispatch(loadProfessionsList());
        if (userIsLoggedIn) {
            dispatch(loadUsersList());
        }
    }, [userIsLoggedIn]);
    if (userStatusLoading) return "Loading";
    return children;
};

AppLoader.propTypes = {
    children: propTypes.oneOfType([propTypes.arrayOf(propTypes.node), propTypes.node])
};

export default AppLoader;
