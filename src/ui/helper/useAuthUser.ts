import { useSelector } from "react-redux";
import { RootState } from "../types";

export const useAuthUser = () => {
  const {user} = useSelector((state: RootState) => state.user);
  if (!user || !user.id) {
    throw new Error("User is not authenticated or user ID is missing");
  }
  return user;
};