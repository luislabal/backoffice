const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("usuario").value.trim();
    const password = document.getElementById("clave").value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No se pudo iniciar sesion");

        if (!data.token) throw new Error("La API no regreso token: " + JSON.stringify(data));

        localStorage.setItem("authToken", data.token);
        if (data.user) {
            localStorage.setItem("userId", data.user.id || data.user._id);
        }
        window.location.href = "home.html";
    } catch (err) {
        alert(err.message);
    }
});
