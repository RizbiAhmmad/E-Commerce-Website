import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllReviews = () => {
  const axiosPublic = useAxiosPublic();
  // Fetch all reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await axiosPublic.get("/reviews");
      return res.data;
    },
  });

  // Fetch all products for mapping productId => product data
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data;
    },
  });

  const getProductName = (productId) => {
    const product = products.find((p) => p._id === productId);
    return product ? product.name : "Unknown Product";
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This review will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/reviews/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            Swal.fire("Deleted!", "Review has been deleted.", "success");
            refetchReviews();
          }
        });
      }
    });
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Reviews
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Reviewer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <tr
                  key={review._id}
                  className="transition duration-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-4">{index + 1}</td>

                  {/* Product Image + Name */}
                  <td className="px-4 py-4 font-semibold text-gray-800 flex items-center gap-3">
                    <img
                      src={
                        products.find((p) => p._id === review.productId)
                          ?.images?.[0] || "https://via.placeholder.com/40"
                      }
                      alt={getProductName(review.productId)}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{getProductName(review.productId)}</span>
                  </td>

                  <td className="px-4 py-4">{review.name}</td>
                  <td className="px-4 py-4">{review.email || "-"}</td>
                  <td className="px-4 py-4">{review.rating}</td>
                  <td
                    className="px-4 py-4 max-w-xs truncate"
                    title={review.text}
                  >
                    {review.text}
                  </td>
                  <td className="px-4 py-4">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Review"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllReviews;
