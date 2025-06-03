document.addEventListener('DOMContentLoaded', function() {
    // URL du fichier JSON
    const jsonUrl = '/pdf/exercice du jour/exercice-du-jour.json';

    // Fonction pour formater la date
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Fonction pour récupérer les données JSON
    async function fetchExercises() {
        try {
            const response = await fetch(jsonUrl);
            const data = await response.json();
            initializeExercises(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des données JSON:', error);
        }
    }

    // Fonction pour initialiser les exercices
    function initializeExercises(exercises) {
        // Filtrer les exercices par date
        const today = new Date();
        const filteredExercises = exercises.filter(exercise => {
            const exerciseDate = new Date(exercise.date);
            return exerciseDate <= today;
        });

        let currentIndex = filteredExercises.length - 1; // Par défaut, afficher l'exercice du jour

        const titleElement = document.getElementById('exercise-title');
        const dateElement = document.getElementById('exercise-date');
        const descriptionElement = document.getElementById('exercise-description');
        const solutionElement = document.getElementById('exercise-solution');
        const toggleSolutionBtn = document.getElementById('toggle-solution-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        function displayExercise(index) {
            const exercise = filteredExercises[index];
            titleElement.textContent = `${formatDate(new Date(exercise.date))}`;
            descriptionElement.textContent = exercise.description;
            solutionElement.textContent = exercise.solution;
            solutionElement.classList.add('hidden'); // Force la solution à être masquée
            toggleSolutionBtn.textContent = 'Afficher la solution';

            // Ensure the content is set before rendering math
            setTimeout(() => {
                renderMathInElement(document.getElementById('exercise-block'), {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false},
                        {left: "\\[", right: "\\]", display: true},
                        {left: "\\(", right: "\\)", display: false}
                    ]
                });
            }, 0);
        }

        toggleSolutionBtn.addEventListener('click', function() {
            if (solutionElement.classList.contains('hidden')) {
                solutionElement.classList.remove('hidden');
                toggleSolutionBtn.textContent = 'Masquer la solution';
                renderMathInElement(solutionElement, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false},
                        {left: "\\[", right: "\\]", display: true},
                        {left: "\\(", right: "\\)", display: false}
                    ]
                });
            } else {
                solutionElement.classList.add('hidden');
                toggleSolutionBtn.textContent = 'Afficher la solution';
            }
        });

        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                displayExercise(currentIndex);
            }
        });

        nextBtn.addEventListener('click', function() {
            if (currentIndex < filteredExercises.length - 1) {
                currentIndex++;
                displayExercise(currentIndex);
            }
        });

        // Afficher l'exercice du jour par défaut
        displayExercise(currentIndex);
    }

    // Récupérer et initialiser les exercices
    fetchExercises();
});
