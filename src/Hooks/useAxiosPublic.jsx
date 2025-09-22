import Axios  from "axios";

const axiosPublic=Axios.create({
    baseURL: "https://e-commerce-server-api.onrender.com",
   
})
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;