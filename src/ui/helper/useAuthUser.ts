import { useSelector } from "react-redux";
import { RootState } from "../types";

export const useAuthUser = () => {
  const { user } = useSelector((state: RootState) => state.user);
  console.log('====================================');
  console.log(user);
  console.log('====================================');

  if (!user || !user.id) {
    console.error("User is not authenticated or user ID is missing");
    return null;
  }

  return user;
};