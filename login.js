const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("usuario").value;
    const password = document.getElementById("clave").value;

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No se pudo iniciar sesion");

        localStorage.setItem("authToken", data.token);
        window.location.href = "home.html";
    } catch (err) {
        alert(err.message);
    }
});
