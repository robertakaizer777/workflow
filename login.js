const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const btnSubmit = document.getElementById("btn-submit");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Reset error message state
    errorMessage.style.display = "none";
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Autenticando...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao fazer login.");
        }

        // Save token and user details to localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));

        // Redirect to dashboard index page
        window.location.href = "/index.html";

    } catch (err) {
        console.error(err);
        errorMessage.style.display = "flex";
        errorText.innerText = err.message;
        
        // Reset submit button state
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Entrar no Painel</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
});
