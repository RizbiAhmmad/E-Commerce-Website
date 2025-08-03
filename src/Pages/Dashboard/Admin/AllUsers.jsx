import { useQuery } from "@tanstack/react-query";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";


const AllUsers = () => {
    const axiosPublic = useAxiosPublic(); 

    const { data: users = [], refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosPublic.get('/users');
            return res.data;
        }
    });

    const handleMakeAdmin = user => {
        axiosPublic.patch(`/users/admin/${user._id}`)
            .then(res => {
                if (res.data.modifiedCount > 0) {
                    refetch();
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: `${user.name} is now an Admin!`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            });
    };

    const handleDeleteUser = user => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.delete(`/users/${user._id}`)
                    .then(res => {
                        if (res.data.deletedCount > 0) {
                            refetch();
                            Swal.fire({
                                title: "Deleted!",
                                text: "User has been removed.",
                                icon: "success"
                            });
                        }
                    });
            }
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8 border-b-2 border-gray-200 pb-4">All Users</h2>
            <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="w-full text-sm text-left table-auto">
                    <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition duration-200">
                                <td className="px-6 py-4 font-medium text-gray-800">{index + 1}</td>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.role === 'admin' ? (
                                        <span className="text-green-600 font-semibold">Admin</span>
                                    ) : (
                                        <button
                                            onClick={() => handleMakeAdmin(user)}
                                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-md transition duration-200"
                                        >
                                            Make Admin
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDeleteUser(user)}
                                        className="text-red-600 hover:text-red-800 transition duration-200"
                                        title="Delete User"
                                    >
                                        <FaTrashAlt className="text-lg" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUsers;
