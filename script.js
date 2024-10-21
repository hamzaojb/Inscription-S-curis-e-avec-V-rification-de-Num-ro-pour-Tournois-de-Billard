document.getElementById('tournamentForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le formulaire de se soumettre

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const experience = document.getElementById('experience').value;

    // Envoie une demande pour vérifier le numéro de téléphone
    const response = await fetch('http://localhost:5000/api/verify-phone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('verificationSection').classList.remove('hidden');
        // Vous pouvez stocker les informations utilisateur quelque part pour l'étape suivante
        sessionStorage.setItem('userData', JSON.stringify({ name, email, phone, experience }));
    } else {
        alert(data.error);
    }
});

document.getElementById('verifyButton').addEventListener('click', async () => {
    const verificationCode = document.getElementById('verificationCode').value;

    // Vérifiez le code de vérification
    const response = await fetch('http://localhost:5000/api/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationCode })
        
    });

    const data = await response.json();
    if (response.ok) {
        // Inscription réussie, enregistrez les données
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        await fetch('http://localhost:5000/api/inscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        document.getElementById('successMessage').classList.remove('hidden');
    } else {
        alert(data.error);
    }
});
document.getElementById('verifyPhone').addEventListener('click', async () => {
    const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value; // Assurez-vous d'avoir un champ pour l'email

    try {
        const response = await fetch('http://localhost:5000/api/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone , email}),
        });
        const data = await response.json();
        alert(data.message);

        // Ouvrir le modal si le code est envoyé avec succès
        if (response.ok) {
            document.getElementById('verificationModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});

// Vérification du code de vérification
document.getElementById('verifyButton').addEventListener('click', async () => {
    const verificationCode = document.getElementById('verificationCode').value;
    const phone = document.getElementById('phone').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const experience = document.getElementById('experience').value;

    try {
        const response = await fetch('http://localhost:5000/api/inscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                experience,
                verificationCode
            }),
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('successMessageText').textContent = data.message;
            document.getElementById('successModal').style.display = 'block'; // Ouvrir le modal de succès
            document.getElementById('verificationModal').style.display = 'none'; // Fermer le modal de vérification
            document.getElementById('tournamentForm').reset(); // Réinitialiser le formulaire
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});

// Fermer le modal de vérification
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('verificationModal').style.display = 'none';
});

// Fermer le modal de succès
document.querySelector('.close-success').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Fermer le modal si l'utilisateur clique en dehors du modal
window.onclick = function(event) {
    const verificationModal = document.getElementById('verificationModal');
    const successModal = document.getElementById('successModal');
    if (event.target === verificationModal) {
        verificationModal.style.display = 'none';
    } else if (event.target === successModal) {
        successModal.style.display = 'none';
    }
};

function setPrefix() {
    var phoneInput = document.getElementById("phone");
    // Si le champ est vide, on initialise avec +212
    if (phoneInput.value === "") {
        phoneInput.value = "+212 ";
    }
}

function keepPrefix() {
    var phoneInput = document.getElementById("phone");
    
    // Vérifie que le préfixe est toujours présent
    if (!phoneInput.value.startsWith("+212 ")) {
        phoneInput.value = "+212 ";
    }

    // Maintient le curseur à la fin du champ
    phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
}