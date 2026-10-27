// // services/authService.js

// const API_URL = "http://localhost:8000/api/auth";

// /* -------------------------
//    Helper for API calls
// -------------------------- */
// const request = async (endpoint, data) => {
//   const response = await fetch(`${API_URL}${endpoint}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.message || "Something went wrong");
//   }

//   return result;
// };

// /* -------------------------
//    Auth APIs
// -------------------------- */
// export const login = (data) => {
//   return request("/login", data);
// };

// export const register = (data) => {
//   return request("/register", data);
// };

// export const forgotPassword = (data) => {
//   return request("/forgot-password", data);
// };

// export const resetPassword = (data) => {
//   return request("/reset-password", data);
// };

// export const logout = () => {
//   localStorage.removeItem("authToken");
//   localStorage.removeItem("user");
// };



// services/authService.js

const API_URL = "http://localhost:8000/api/auth";

const request = async (endpoint, data) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    const message =
      result?.message ||
      result?.detail?.message ||
      result?.detail ||
      "Something went wrong";

    throw new Error(
      typeof message === "string" ? message : "Something went wrong"
    );
  }

  return result;
};

/* Authentication APIs */

export const login = (data) => request("/login", data);

export const register = (data) => request("/register", data);

export const googleLogin = (data) => request("/google", data);

export const forgotPassword = (data) =>
  request("/forgot-password", data);

export const resetPassword = (data) =>
  request("/reset-password", data);

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};
