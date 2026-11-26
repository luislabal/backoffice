const panel = document.getElementById("panel");
const form = document.getElementById("formProyecto");
let editandoId = null; 

async function pedir(ruta, metodo = "GET", body) {
    const res = await fetch(API + ruta, {
        method: metodo,
        headers: { "Content-Type": "application/json", "auth-token": getToken() },
        body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401 || res.status === 403) {
        logout();
        return;
    }
    if (!res.ok) throw new Error(res.status + ": " + await res.text());
    return res.json().catch(() => null);
}

function userId() {
    const datos = JSON.parse(atob(getToken().split(".")[1]));
    return datos._id || datos.id;
}

async function cargar() {
    try {
        const proyectos = (await pedir("/projects")) || [];
        panel.innerHTML = "";
        if (proyectos.length === 0) panel.textContent = "No hay proyectos registrados.";
        proyectos.forEach(mostrar);
    } catch (err) {
        alert(err.message);
    }
}

function mostrar(p) {
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
    btnEditar.addEventListener("click", () => editar(p._id));

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => eliminar(p._id));

    tarjeta.append(titulo, desc, tecs, btnEditar, btnEliminar);
    panel.appendChild(tarjeta);
}

async function editar(id) {
    try {
        const p = await pedir("/projects/" + id);
        editandoId = id;
        document.getElementById("tituloForm").textContent = "Actualizar proyecto";
        document.getElementById("titulo").value = p.title;
        document.getElementById("descripcion").value = p.description;
        document.getElementById("tecnologias").value = (p.technologies || []).join(", ");
        document.getElementById("repositorio").value = p.repository || "";
        form.hidden = false;
    } catch (err) {
        alert(err.message);
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const proyecto = {
        title: document.getElementById("titulo").value,
        description: document.getElementById("descripcion").value,
        technologies: document.getElementById("tecnologias").value
            .split(",").map((t) => t.trim()).filter(Boolean),
        repository: document.getElementById("repositorio").value,
        images: []
    };

    try {
        if (editandoId) {
            await pedir("/projects/" + editandoId, "PUT", proyecto);
        } else {
            proyecto.userId = userId();
            await pedir("/projects", "POST", proyecto);
        }
        cerrarForm();
        cargar();
    } catch (err) {
        alert(err.message);
    }
});


async function eliminar(id) {
    if (!confirm("¿Eliminar este proyecto?")) return;
    try {
        await pedir("/projects/" + id, "DELETE");
        cargar();
    } catch (err) {
        alert(err.message);
    }
}

function cerrarForm() {
    form.reset();
    editandoId = null;
    document.getElementById("tituloForm").textContent = "Nuevo proyecto";
    form.hidden = true;
}

document.getElementById("btnAgregar").addEventListener("click", () => {
    cerrarForm();
    form.hidden = false;
});
document.getElementById("btnCancelar").addEventListener("click", cerrarForm);
document.getElementById("btnSalir").addEventListener("click", logout);

cargar();
