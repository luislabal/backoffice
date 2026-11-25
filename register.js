const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
        name: document.getElementById("nombre").value.trim(),
        email: document.getElementById("usuario").value.trim(),
        itsonId: document.getElementById("itsonId").value.trim(),
        password: document.getElementById("clave").value
    };

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No se pudo registrar");

        alert("Cuenta creada!");
        window.location.href = "login.html";
    } catch (err) {
        alert(err.message);
    }
});
