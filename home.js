const panel = document.getElementById("panel");
const form = document.getElementById("formProyecto");
const tituloForm = document.getElementById("tituloForm");

let proyectos = [];

function obtenerUserId() {
    let id = localStorage.getItem("userId");
    if (id && id !== "undefined") return id;
    try {
        const payload = JSON.parse(atob(getToken().split(".")[1]));
        return payload._id || payload.id || payload.userId;
    } catch {
        return null;
    }
}
let editandoId = null; 

document.getElementById("btnSalir").addEventListener("click", logout);

document.getElementById("btnAgregar").addEventListener("click", () => {
    abrirForm(null);
});

document.getElementById("btnCancelar").addEventListener("click", cerrarForm);

function abrirForm(proyecto) {
    editandoId = proyecto ? proyecto._id : null;
    tituloForm.textContent = proyecto ? "Actualizar proyecto" : "Nuevo proyecto";
    document.getElementById("titulo").value = proyecto ? proyecto.title : "";
    document.getElementById("descripcion").value = proyecto ? proyecto.description : "";
    document.getElementById("tecnologias").value = proyecto ? (proyecto.technologies || []).join(", ") : "";
    document.getElementById("repositorio").value = proyecto ? (proyecto.repository || "") : "";
    form.hidden = false;
}

function cerrarForm() {
    form.reset();
    editandoId = null;
    form.hidden = true;
}

async function cargarProyectos() {
    try {
        const res = await fetch(`${API_BASE}/projects`, {
            headers: { "auth-token": getToken() }
        });
        // Token invalido o vencido
        if (res.status === 401 || res.status === 403) {
            alert("Sesion invalida (" + res.status + "), inicia sesion de nuevo");
            logout();
            return;
        }
        if (!res.ok) {
            const info = await res.text();
            throw new Error("Error al obtener proyectos (" + res.status + "): " + info);
        }

        proyectos = await res.json();
        mostrarProyectos();
    } catch (err) {
        alert(err.message);
    }
}

function mostrarProyectos() {
    panel.innerHTML = "";

    if (proyectos.length === 0) {
        panel.textContent = "No hay proyectos registrados.";
        return;
    }

    proyectos.forEach((p) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "proyecto";

        const titulo = document.createElement("h3");
        titulo.textContent = p.title;

        const desc = document.createElement("p");
        desc.textContent = p.description;

        const tecs = document.createElement("p");
        tecs.textContent = "Tecnologias: " + (p.technologies || []).join(", ");

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Actualizar";
        btnEditar.addEventListener("click", () => abrirForm(p));

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => eliminarProyecto(p._id));

        tarjeta.append(titulo, desc, tecs);

        if (p.repository) {
            const repo = document.createElement("a");
            repo.href = p.repository;
            repo.textContent = p.repository;
            repo.target = "_blank";
            tarjeta.appendChild(repo);
        }

        tarjeta.append(btnEditar, btnEliminar);
        panel.appendChild(tarjeta);
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const proyecto = {
        title: document.getElementById("titulo").value.trim(),
        description: document.getElementById("descripcion").value.trim(),
        technologies: document.getElementById("tecnologias").value
            .split(",").map((t) => t.trim()).filter(Boolean),
        repository: document.getElementById("repositorio").value.trim(),
        images: []
    };

    const headers = {
        "Content-Type": "application/json",
        "auth-token": getToken()
    };

    try {
        let res;
        if (editandoId) {
            res = await fetch(`${API_BASE}/projects/${editandoId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(proyecto)
            });
        } else {
            proyecto.userId = obtenerUserId();
            res = await fetch(`${API_BASE}/projects`, {
                method: "POST",
                headers,
                body: JSON.stringify(proyecto)
            });
        }
        if (!res.ok) {
            const info = await res.text();
            throw new Error((editandoId ? "Error al actualizar" : "Error al crear proyecto")
                + " (" + res.status + "): " + info
                + "\nuserId enviado: " + proyecto.userId);
        }

        cerrarForm();
        cargarProyectos();
    } catch (err) {
        alert(err.message);
    }
});

async function eliminarProyecto(id) {
    if (!confirm("¿Eliminar este proyecto?")) return;

    try {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
            method: "DELETE",
            headers: { "auth-token": getToken() }
        });
        if (!res.ok) {
            const info = await res.text();
            throw new Error("Error al eliminar (" + res.status + "): " + info);
        }

        cargarProyectos();
    } catch (err) {
        alert(err.message);
    }
}

cargarProyectos();
