const API = "https://portfolio-api-three-black.vercel.app/api/v1";

function getToken() {
    return localStorage.getItem("authToken");
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "index.html";
}
