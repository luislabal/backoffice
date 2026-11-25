const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

function getToken() {
    return localStorage.getItem("authToken");
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
}
