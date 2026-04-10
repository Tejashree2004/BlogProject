import axiosInstance from "./axiosInstance";

// ===================== BLOG ROUTES ===================== //

// 🔥 Paginated Blogs
export const getBlogs = async (pageNumber = 1, pageSize = 10) => {
  const res = await axiosInstance.get(
    `/blogs?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return res.data;
};

// 🔥 My Blogs (Paginated)
export const getMyBlogs = async (pageNumber = 1, pageSize = 10) => {
  const res = await axiosInstance.get(
    `/blogs/myblogs?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return res.data;
};

// 🔥 My Feed (Paginated)
export const getMyFeed = async (pageNumber = 1, pageSize = 10) => {
  const res = await axiosInstance.get(
    `/blogs/feed?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return res.data;
};

// 🔥 Single Blog
export const getBlogById = async (id) => {
  const res = await axiosInstance.get(`/blogs/${id}`);
  return res.data;
};

// ===================== CREATE ===================== //

export const createBlog = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("desc", data.desc);
  formData.append("category", data.category);
  formData.append("isActive", data.isActive);
  formData.append("isUserCreated", data.isUserCreated);

  if (data.file) {
    formData.append("image", data.file);
  }

  const res = await axiosInstance.post("/blogs", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;
};

// ===================== DELETE ===================== //

export const deleteBlogApi = async (id) => {
  const res = await axiosInstance.delete(`/blogs/${id}`);
  return res.data;
};

// ===================== AUTH ===================== //

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/auth/login", data);

  console.log("🔥 LOGIN RESPONSE:", res.data);

  if (res.data?.token) {
    localStorage.setItem("jwtToken", res.data.token);
    localStorage.setItem("username", res.data.username);
  } else {
    console.error("❌ Token missing in response");
  }

  return res.data;
};

export const signupUser = async (data) => {
  const res = await axiosInstance.post("/auth/signup", data);
  return res.data;
};

export const verifyEmailOtp = async (data) => {
  const res = await axiosInstance.post("/auth/verify-email", data);
  return res.data;
};