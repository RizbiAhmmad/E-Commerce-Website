import Axios  from "axios";

const axiosPublic=Axios.create({
    baseURL: "https://api.sports.bangladeshiit.com",
   
})
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;