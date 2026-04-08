import axiosInstance from "./axiosInstance";

// ===================== BLOG ROUTES ===================== //

export const getBlogs = async () => {
  const res = await axiosInstance.get("/blogs");
  return res.data;
};

export const getMyBlogs = async () => {
  const res = await axiosInstance.get("/blogs/myblogs");
  return res.data;
};

export const getMyFeed = async () => {
  const res = await axiosInstance.get("/blogs/feed");
  return res.data;
};

export const getBlogById = async (id) => {
  const res = await axiosInstance.get(`/blogs/${id}`);
  return res.data;
};

// 🔥 UPDATED (FILE UPLOAD SUPPORT + PREVIEW SAFE)
export const createBlog = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("desc", data.desc);
  formData.append("category", data.category);
  formData.append("isActive", data.isActive);
  formData.append("isUserCreated", data.isUserCreated);

  // 🔥 send actual file
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