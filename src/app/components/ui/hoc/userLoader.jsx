import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUsersList, getDataStatus } from "../../../store/users";
import propTypes from "prop-types";

const UserLoader = ({ children }) => {
    const dispatch = useDispatch();
    const dataStatus = useSelector(getDataStatus());
    useEffect(() => {
        if (!dataStatus) {
            dispatch(loadUsersList());
        }
    }, []);
    if (!dataStatus) return "Loading...";
    return children;
};

UserLoader.propTypes = {
  children: propTypes.oneOfType([propTypes.arrayOf(propTypes.node), propTypes.node])
};

export default UserLoader;
