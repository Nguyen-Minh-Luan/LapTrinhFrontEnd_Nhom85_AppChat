import { AppDispatch,RootState } from "../redux/store";
import { useDispatch,useSelector,TypedUseSelectorHook } from "react-redux";
// Sử dụng thay vì useDispatch và useSelector thông thường
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
