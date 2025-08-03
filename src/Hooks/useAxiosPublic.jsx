import Axios  from "axios";

const axiosPublic=Axios.create({
    baseURL: "http://localhost:5173",
   
})
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;