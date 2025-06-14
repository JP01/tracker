const routinesKey = 'workout_routines';
const historyKey = 'workout_history';

function validateRoutineForm() {
  const routineNameInput = document.getElementById('routineName');
  const newRoutineExercisesDiv = document.getElementById('newRoutineExercises');
  const createBtn = document.getElementById('createRoutineBtn');

  const isNameValid = routineNameInput.value.trim() !== '';
  const hasAtLeastOneExercise = newRoutineExercisesDiv.children.length > 0;

  if (isNameValid && hasAtLeastOneExercise) {
    createBtn.disabled = false;
  } else {
    createBtn.disabled = true;
  }
}

let currentlyEditingRoutineName = null; // For tracking edit state
let currentlyEditingWorkoutIndex = null; // For tracking workout edit state

function loadRoutineForEdit(routineName) {
  const routines = JSON.parse(localStorage.getItem(routinesKey) || '{}');
  const routineToEdit = routines[routineName];

  if (!routineToEdit) {
    alert('Error: Routine not found!');
    return;
  }

  document.getElementById('routineName').value = routineName;
  const newRoutineExercisesDiv = document.getElementById('newRoutineExercises');
  newRoutineExercisesDiv.innerHTML = ''; // Clear existing exercise inputs

  routineToEdit.forEach(exerciseName => {
    addExerciseToNewRoutine(exerciseName); // Pass name to prefill
  });

  document.getElementById('createRoutineBtn').textContent = 'Update Routine';
  currentlyEditingRoutineName = routineName;
  validateRoutineForm(); // Update button state
}

function loadSavedWorkouts() {
      const savedWorkoutsList = document.getElementById('savedWorkoutsList');
      savedWorkoutsList.innerHTML = ''; // Clear previous content

      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

      if (!history || history.length === 0) {
        savedWorkoutsList.innerHTML = '<p>No saved workouts yet.</p>';
        return;
      }

      // Iterate in reverse to show most recent workouts first
      for (let i = history.length - 1; i >= 0; i--) {
        const workout = history[i];
        const workoutItem = document.createElement('div');
        workoutItem.className = 'workout-item exercise-block'; // Re-use some styling

        const dateHeading = document.createElement('h3');
        dateHeading.textContent = `Workout Date: ${workout.date}`;
        workoutItem.appendChild(dateHeading);

        const editWorkoutBtn = document.createElement('button');
        editWorkoutBtn.textContent = 'Edit Workout';
        editWorkoutBtn.onclick = function() { loadWorkoutForEdit(i); }; // 'i' is the original index
        editWorkoutBtn.style.marginRight = '0.5rem';
        editWorkoutBtn.style.marginBottom = '0.5rem';
        workoutItem.appendChild(editWorkoutBtn);

        // Delete button for the workout
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Workout';
        // Pass original index before reversing. Since we iterate from history.length - 1 down to 0,
        // the index 'i' is the correct original index.
        deleteBtn.onclick = function() { deleteSavedWorkout(i); };
        deleteBtn.style.marginBottom = '0.5rem'; // Add some spacing
        workoutItem.appendChild(deleteBtn);

        workout.exercises.forEach(exercise => {
          const exerciseDiv = document.createElement('div');
          exerciseDiv.style.marginBottom = '0.5rem';
          const exerciseName = document.createElement('p');
          exerciseName.innerHTML = `<strong>${exercise.name}</strong>`;
          exerciseDiv.appendChild(exerciseName);

          const setsList = document.createElement('ul');
          setsList.style.listStyle = 'none';
          setsList.style.paddingLeft = '1rem';
          exercise.sets.forEach((set, index) => {
            const setItem = document.createElement('li');
            setItem.textContent = `Set ${index + 1}: ${set.reps} reps @ ${set.weight} kg`;
            setsList.appendChild(setItem);
          });
          exerciseDiv.appendChild(setsList);
          workoutItem.appendChild(exerciseDiv);
        });
        savedWorkoutsList.appendChild(workoutItem);
      }
    }

    function deleteSavedWorkout(workoutIndex) {
      if (!confirm('Are you sure you want to delete this workout?')) {
        return;
      }
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (workoutIndex >= 0 && workoutIndex < history.length) {
        history.splice(workoutIndex, 1);
        localStorage.setItem(historyKey, JSON.stringify(history));
        loadSavedWorkouts(); // Refresh the list
      } else {
        console.error('Invalid workout index for deletion:', workoutIndex);
      }
    }

    function loadWorkoutForEdit(workoutIndex) {
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const workoutToEdit = history[workoutIndex];

      if (!workoutToEdit) {
        console.error('Workout not found for editing at index:', workoutIndex);
        alert('Error: Could not load workout for editing.');
        return;
      }

      const workoutContainer = document.getElementById('workoutExercises');
      workoutContainer.innerHTML = ''; // Clear current workout display

      workoutToEdit.exercises.forEach(exercise => {
        const block = document.createElement('div');
        block.className = 'exercise-block';
        let setsHtml = '';
        exercise.sets.forEach((set, i) => {
          // Ensure values are not undefined before setting them in the input
          const repsValue = set.reps === undefined ? '' : set.reps;
          const weightValue = set.weight === undefined ? '' : set.weight;
          setsHtml += `Set ${i + 1}: <input type="number" placeholder="Reps" value="${repsValue}" /> reps @ <input type="number" placeholder="Weight" value="${weightValue}" /> kg<br/>`;
        });
        block.innerHTML = `<strong>${exercise.name}</strong><br/>${setsHtml}`;
        workoutContainer.appendChild(block);
      });

      currentlyEditingWorkoutIndex = workoutIndex;
      document.getElementById('workoutSection').style.display = 'block';
      document.getElementById('workoutSection').scrollIntoView({ behavior: 'smooth' });
    }

function loadRoutines() {
      const routines = JSON.parse(localStorage.getItem(routinesKey) || '{}'); // TODO: currentlyEditingRoutineName should be reset if this is called.
      const savedListDiv = document.getElementById('savedRoutinesList');
      savedListDiv.innerHTML = ''; // Clear previous entries

      if (Object.keys(routines).length === 0) {
        savedListDiv.innerHTML = '<p>No saved routines yet.</p>';
        return;
      }

      for (const routineName in routines) {
        const routineItemDiv = document.createElement('div');
        routineItemDiv.className = 'routine-item'; // For potential styling
        routineItemDiv.style.marginBottom = '0.5rem';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = routineName;
        nameSpan.style.marginRight = '0.5rem';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = function() { loadRoutineForEdit(routineName); };
        editBtn.style.marginRight = '0.5rem';

        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Workout';
        startBtn.onclick = function() { startWorkoutFromRoutine(routineName); };
        startBtn.style.marginRight = '0.5rem';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function() { deleteRoutine(routineName); };

        routineItemDiv.appendChild(nameSpan);
        routineItemDiv.appendChild(editBtn);
        routineItemDiv.appendChild(startBtn);
        routineItemDiv.appendChild(deleteBtn);
        savedListDiv.appendChild(routineItemDiv);
      }
    }

    function deleteRoutine(routineName) {
      if (!confirm(`Are you sure you want to delete the routine "${routineName}"?`)) {
        return;
      }
      const routines = JSON.parse(localStorage.getItem(routinesKey) || '{}');
      delete routines[routineName];
      localStorage.setItem(routinesKey, JSON.stringify(routines));
      loadRoutines(); // Refresh the list
    }

                                      function createRoutine() {
                                             const nameInput = document.getElementById('routineName');
                                             const name = nameInput.value.trim();
                                             const exercises = [...document.querySelectorAll('.exercise-name')].map(el => el.value.trim()).filter(exName => exName); // Ensure no empty exercise names

                                             if (!name || exercises.length === 0) {
                                               alert('Enter routine name and at least one exercise');
                                               return;
                                             }

                                             const routines = JSON.parse(localStorage.getItem(routinesKey) || '{}');

                                             if (currentlyEditingRoutineName && currentlyEditingRoutineName !== name) {
                                               // If name changed, delete old routine entry
                                               delete routines[currentlyEditingRoutineName];
                                             }
                                             // Add or update the routine
                                             routines[name] = exercises;
                                             localStorage.setItem(routinesKey, JSON.stringify(routines));

                                             alert(currentlyEditingRoutineName ? 'Routine updated!' : 'Routine saved!');

                                             // Reset form and state
                                             nameInput.value = '';
                                             document.getElementById('newRoutineExercises').innerHTML = '';
                                             document.getElementById('createRoutineBtn').textContent = 'Create';
                                             currentlyEditingRoutineName = null;
                                             loadRoutines(); // Refresh the list of routines
                                             validateRoutineForm(); // Reset button state
                                           }

                                                               function addExerciseToNewRoutine(exerciseName = '') { // Optional parameter
                                                                    const routineExercisesContainer = document.getElementById('newRoutineExercises');

                                                                    const exerciseEntryDiv = document.createElement('div');
                                                                    exerciseEntryDiv.style.display = 'flex'; // Align items inline
                                                                    exerciseEntryDiv.style.alignItems = 'center'; // Vertically align items
                                                                    exerciseEntryDiv.style.marginBottom = '0.25rem'; // Spacing

                                                                    const input = document.createElement('input');
                                                                    input.placeholder = 'Exercise name';
                                                                    input.className = 'exercise-name'; // Crucial for createRoutine()
                                                                    input.value = exerciseName; // Set value if provided
                                                                    input.style.marginRight = '0.5rem'; // Space before button

                                                                    const removeBtn = document.createElement('button');
                                                                    removeBtn.textContent = 'Remove';
                                                                    removeBtn.onclick = function() {
                                                                      this.parentElement.remove();
                                                                      validateRoutineForm();
                                                                    };

                                                                    exerciseEntryDiv.appendChild(input);
                                                                    exerciseEntryDiv.appendChild(removeBtn);
                                                                    routineExercisesContainer.appendChild(exerciseEntryDiv);
                                                                    validateRoutineForm(); // Call after adding
                                                                  }

                                                                                                    function startWorkoutFromRoutine(routineName) { // Modified signature
                                                                                                                      const routines = JSON.parse(localStorage.getItem(routinesKey) || '{}');
                                                                                                                            const exercises = routines[routineName] || [];

                                                                                                                                  const workoutContainer = document.getElementById('workoutExercises');
                                                                                                                                        workoutContainer.innerHTML = '';

                                                                                                                                              exercises.forEach(name => {
                                                                                                                                                      const block = document.createElement('div');
                                                                                                                                                              block.className = 'exercise-block';
                                                                                                                                                                      block.innerHTML = `<strong>${name}</strong><br/>` +
                                                                                                                                                                                [...Array(3)].map((_, i) => `Set ${i+1}: <input type="number" placeholder="Reps" /> reps @ <input type="number" placeholder="Weight" /> kg<br/>`).join('');
                                                                                                                                                                                        workoutContainer.appendChild(block);
                                                                                                                                                                                              });

                                                                                                                                                                                                    document.getElementById('workoutSection').style.display = 'block';
                                                                                                                                                                                                        }

                                                                                                                                                                                                            function saveWorkout() {
                                                                                                                                                                                                                  const blocks = document.querySelectorAll('.exercise-block');
                                                                                                                                                                                                                  const workoutDataFromForm = { exercises: [] }; // Date will be handled based on new/edit

                                                                                                                                                                                                                  blocks.forEach(block => {
                                                                                                                                                                                                                    const name = block.querySelector('strong').textContent;
                                                                                                                                                                                                                    const inputs = block.querySelectorAll('input');
                                                                                                                                                                                                                    const sets = [];
                                                                                                                                                                                                                    for (let i = 0; i < inputs.length; i += 2) {
                                                                                                                                                                                                                      sets.push({ reps: Number(inputs[i].value), weight: Number(inputs[i + 1].value) });
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    workoutDataFromForm.exercises.push({ name, sets });
                                                                                                                                                                                                                  });

                                                                                                                                                                                                                  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

                                                                                                                                                                                                                  if (currentlyEditingWorkoutIndex !== null) {
                                                                                                                                                                                                                    // This is an update to an existing workout
                                                                                                                                                                                                                    if (history[currentlyEditingWorkoutIndex]) {
                                                                                                                                                                                                                      workoutDataFromForm.date = history[currentlyEditingWorkoutIndex].date; // Preserve original date
                                                                                                                                                                                                                      history[currentlyEditingWorkoutIndex] = workoutDataFromForm;
                                                                                                                                                                                                                      localStorage.setItem(historyKey, JSON.stringify(history));
                                                                                                                                                                                                                      alert('Workout updated successfully!');
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                      alert('Error: Could not find workout to update.'); // Should not happen ideally
                                                                                                                                                                                                                      currentlyEditingWorkoutIndex = null; // Reset to avoid issues
                                                                                                                                                                                                                      document.getElementById('workoutSection').style.display = 'none';
                                                                                                                                                                                                                      document.getElementById('workoutExercises').innerHTML = '';
                                                                                                                                                                                                                      loadSavedWorkouts();
                                                                                                                                                                                                                      return;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                  } else {
                                                                                                                                                                                                                    // This is a new workout
                                                                                                                                                                                                                    workoutDataFromForm.date = new Date().toISOString().split('T')[0];
                                                                                                                                                                                                                    history.push(workoutDataFromForm);
                                                                                                                                                                                                                    localStorage.setItem(historyKey, JSON.stringify(history));
                                                                                                                                                                                                                    alert('Workout saved!');
                                                                                                                                                                                                                  }

                                                                                                                                                                                                                  // Common post-save operations
                                                                                                                                                                                                                  currentlyEditingWorkoutIndex = null;
                                                                                                                                                                                                                  document.getElementById('workoutSection').style.display = 'none';
                                                                                                                                                                                                                  document.getElementById('workoutExercises').innerHTML = ''; // Clear the form
                                                                                                                                                                                                                  loadSavedWorkouts(); // Refresh the list of saved workouts
                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                        function toggleSavedWorkoutsDisplay() {
                                                                                                                                                                                                                                                                                                                                                          const list = document.getElementById('savedWorkoutsList');
                                                                                                                                                                                                                                                                                                                                                          if (list.style.display === 'none' || list.style.display === '') {
                                                                                                                                                                                                                                                                                                                                                            list.style.display = 'block';
                                                                                                                                                                                                                                                                                                                                                          } else {
                                                                                                                                                                                                                                                                                                                                                            list.style.display = 'none';
                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                        }

loadRoutines();
loadSavedWorkouts();
document.getElementById('toggleSavedWorkoutsBtn').addEventListener('click', toggleSavedWorkoutsDisplay);
document.getElementById('routineName').addEventListener('input', validateRoutineForm);
validateRoutineForm(); // Initial check
