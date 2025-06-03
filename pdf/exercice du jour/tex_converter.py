from TexSoup import TexSoup
import json

def latex_to_json(latex_content):
    soup = TexSoup(latex_content)
    exercises = []

    # Trouver tous les environnements 'exercise'
    exercise_blocks = soup.find_all('exercise')

    for block in exercise_blocks:
        title = block.title.string.strip()
        date = block.date.string.strip()
        description = block.content.string.strip()
        solution = block.solution.string.strip()

        exercise = {
            "date": date,
            "title": title,
            "description": description,
            "solution": solution
        }
        exercises.append(exercise)

    return exercises

# Lire le fichier LaTeX
with open('exercice-du-jour.tex', 'r', encoding='utf-8') as file:
    latex_content = file.read()

# Convertir en JSON
exercises_json = latex_to_json(latex_content)

# Écrire dans un fichier JSON
with open('exercice-du-jour.json', 'w', encoding='utf-8') as file:
    json.dump(exercises_json, file, ensure_ascii=False, indent=4)

print("Conversion terminée ! Les exercices ont été écrits dans exercises.json")
