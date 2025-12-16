// --- State ---
let tasks = [];
const TASKS_KEY = 'focus_app_tasks';

// --- Types & Config ---
// --- Types & Config ---
const TYPES = {
    'BUG': {
        label: 'Bug',
        colorBg: 'bg-bug-100',
        colorText: 'text-bug-800',
        border: 'border-bug-100',
        icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`
    },
    'FEATURE': {
        label: 'Fonctionnalité',
        colorBg: 'bg-feature-100',
        colorText: 'text-feature-800',
        border: 'border-feature-100',
        icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L10 3z"></path></svg>`
    },
    'TECH': {
        label: 'Technique',
        colorBg: 'bg-tech-100',
        colorText: 'text-tech-800',
        border: 'border-tech-100',
        icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
    },
    'IDEA': {
        label: 'Idée',
        colorBg: 'bg-idea-100',
        colorText: 'text-idea-800',
        border: 'border-idea-100',
        icon: `<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548 5.478a1 1 0 01-1.74 0l-.548-5.478z"></path></svg>`
    }
};

// --- Initialization ---
function init() {
    loadTasks();
    render();
}

// --- persistence ---
function loadTasks() {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored) {
        try {
            tasks = JSON.parse(stored);
            // Convert date strings back to objects if needed (not strictly used yet but good practice)
            tasks.forEach(t => t.createdAt = new Date(t.createdAt));
        } catch (e) {
            console.error("Failed to load tasks", e);
            tasks = [];
        }
    }
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    render();
}

// --- Actions ---

function addTask() {
    const input = document.getElementById('taskInput');
    const typeValue = document.getElementById('taskTypeValue').value;
    const title = input.value.trim();

    if (!title) return;

    const newTask = {
        id: crypto.randomUUID(),
        title: title,
        type: typeValue,
        status: 'INBOX',
        createdAt: new Date()
    };

    tasks.unshift(newTask); // Add to top
    input.value = '';
    saveTasks();
}

function moveTask(id, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    // Constraint Check: NOW limit
    if (newStatus === 'NOW') {
        const nowCount = tasks.filter(t => t.status === 'NOW').length;
        if (nowCount >= 3) {
            alert("STOP ! La colonne NOW est limitée à 3 tâches. Finis-en une avant d'en ajouter.");
            return;
        }
    }

    if (newStatus === 'DELETE') {
        // User Logic: Trash button moves to DONE first (Archive). 
        // Only deletes permanently if already in DONE.
        if (tasks[taskIndex].status === 'DONE') {
            if (confirm('Supprimer définitivement cette tâche ?')) {
                tasks.splice(taskIndex, 1);
            }
        } else {
            // "Archive" to Done
            tasks[taskIndex].status = 'DONE';
        }
    } else {
        tasks[taskIndex].status = newStatus;
        // Move to top of the new list (optional, but often good for visibility)
        // For NOW column, maybe append? Let's keep array order but re-render filters it correctly.
        // Actually, let's bump the modified task to the top of its new group conceptually
        // by removing and re-inserting if we wanted strict ordering, but filtering is fine.
    }
    saveTasks();
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "taches_backup_" + new Date().toISOString().slice(0, 10) + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function triggerImport() {
    document.getElementById('importFile').click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (Array.isArray(importedTasks)) {
                // Basic validation could go here
                if (confirm(`Importer ${importedTasks.length} tâches ? Cela REMPLACERA vos tâches actuelles.`)) {
                    tasks = importedTasks;
                    saveTasks();
                    alert('Importation réussie !');
                }
            } else {
                alert('Fichier invalide : format incorrect.');
            }
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la lecture du fichier JSON.');
        }
        // Reset input
        event.target.value = '';
    };
    reader.readAsText(file);
}

// --- Custom UI Helpers ---
function toggleTypeMenu() {
    document.getElementById('typeMenu').classList.toggle('hidden');
}

function selectType(type) {
    const config = TYPES[type];
    document.getElementById('taskTypeValue').value = type;
    document.getElementById('selectedLabel').textContent = config.label;

    // Extract emoji from icon string might be hard, so just hardcode/map simple icons for the dropdown display or simplified view
    const icons = { 'IDEA': '💡', 'BUG': '🐛', 'FEATURE': '✨', 'TECH': '⚙️' };
    document.getElementById('selectedTypeIcon').textContent = icons[type] || '💡';

    toggleTypeMenu();
}

// Close menu if clicked outside
window.addEventListener('click', function (e) {
    if (!document.getElementById('typeTrigger').contains(e.target)) {
        document.getElementById('typeMenu').classList.add('hidden');
    }
});

// --- Rendering ---

function render() {
    const cols = {
        'INBOX': document.getElementById('col-INBOX'),
        'NOW': document.getElementById('col-NOW'),
        'LATER': document.getElementById('col-LATER'),
        'DONE': document.getElementById('col-DONE')
    };

    // Clear all
    Object.values(cols).forEach(col => col.innerHTML = '');

    // Counts
    const counts = { 'INBOX': 0, 'NOW': 0, 'LATER': 0, 'DONE': 0 };

    tasks.forEach(task => {
        counts[task.status]++;
        const taskEl = createTaskElement(task);
        cols[task.status].appendChild(taskEl);
    });

    // Update counters
    document.getElementById('count-INBOX').textContent = counts['INBOX'];
    document.getElementById('count-NOW').textContent = `${counts['NOW']}/3`;
    document.getElementById('count-LATER').textContent = counts['LATER'];
    document.getElementById('count-DONE').textContent = counts['DONE'];

    // Visual cue if NOW is full
    const countNowEl = document.getElementById('count-NOW');
    if (counts['NOW'] >= 3) {
        countNowEl.classList.remove('bg-indigo-100', 'text-indigo-700');
        countNowEl.classList.add('bg-red-100', 'text-red-700');
    } else {
        countNowEl.classList.add('bg-indigo-100', 'text-indigo-700');
        countNowEl.classList.remove('bg-red-100', 'text-red-700');
    }
}

function createTaskElement(task) {
    const typeConfig = TYPES[task.type] || TYPES['IDEA'];

    const div = document.createElement('div');
    let extraClasses = '';
    if (task.status === 'INBOX') {
        // Blur by default, reveal when the entire INBOX column (group/inbox) is hovered
        extraClasses = 'opacity-40 blur-[1px] grayscale group-hover/inbox:opacity-100 group-hover/inbox:blur-0 group-hover/inbox:grayscale-0 transition-all duration-300';
    }

    div.className = `bg-white p-3 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group relative animate-fade-in ${extraClasses}`;
    // Tiny border left based on type
    div.style.borderLeft = `4px solid ${getColorCode(task.type)}`;

    const dateStr = new Date(task.createdAt).toLocaleDateString();

    let actionsHtml = '';

    // Action Logic based on current status
    // Icons: Heroicons (Outline/Solid mixed)

    // Icon: Play/Move to Now
    const iconNow = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>`;

    // Icon: Clock/Later
    const iconLater = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

    // Icon: Check/Done
    const iconDone = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;

    // Icon: Trash/Delete
    const iconDelete = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

    // Icon: Undo/Restore
    const iconRestore = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>`;


    if (task.status === 'INBOX' || task.status === 'LATER') {
        actionsHtml += `<button onclick="moveTask('${task.id}', 'NOW')" class="p-1.5 hover:bg-indigo-50 rounded text-slate-400 hover:text-indigo-600 transition-colors" title="Faire maintenant">${iconNow}</button>`;
        actionsHtml += `<button onclick="moveTask('${task.id}', 'DONE')" class="p-1.5 hover:bg-emerald-50 rounded text-slate-400 hover:text-emerald-500 transition-colors" title="Terminé">${iconDone}</button>`;
        if (task.status === 'INBOX') {
            actionsHtml += `<button onclick="moveTask('${task.id}', 'LATER')" class="p-1.5 hover:bg-orange-50 rounded text-slate-400 hover:text-orange-500 transition-colors" title="Plus tard">${iconLater}</button>`;
        }
    }

    if (task.status === 'NOW') {
        actionsHtml += `<button onclick="moveTask('${task.id}', 'DONE')" class="p-1.5 hover:bg-emerald-50 rounded text-slate-400 hover:text-emerald-500 transition-colors" title="Terminé">${iconDone}</button>`;
        actionsHtml += `<button onclick="moveTask('${task.id}', 'LATER')" class="p-1.5 hover:bg-orange-50 rounded text-slate-400 hover:text-orange-500 transition-colors" title="Plus tard">${iconLater}</button>`;
    }

    if (task.status === 'DONE') {
        actionsHtml += `<button onclick="moveTask('${task.id}', 'INBOX')" class="p-1.5 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-500 transition-colors" title="Restaurer">${iconRestore}</button>`;
    }

    // Always allow delete
    actionsHtml += `<button onclick="moveTask('${task.id}', 'DELETE')" class="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 ml-auto transition-colors" title="Supprimer">${iconDelete}</button>`;


    div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="${typeConfig.colorBg} ${typeConfig.colorText} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${typeConfig.border} border-opacity-20 flex items-center">
                ${typeConfig.icon} ${typeConfig.label}
            </span>
        </div>
        <h3 class="text-sm font-medium text-slate-700 leading-snug mb-3">${escapeHtml(task.title)}</h3>
        
        <div class="flex items-center gap-1 mt-auto pt-2 border-t border-slate-50">
            ${actionsHtml}
        </div>
    `;

    return div;
}

function getColorCode(type) {
    if (type === 'BUG') return '#ef4444'; // red-500
    if (type === 'FEATURE') return '#3b82f6'; // blue-500
    if (type === 'TECH') return '#f97316'; // orange-500
    return '#64748b'; // slate-500
}

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- UI Helpers ---

function toggleColumn(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    const isCollapsed = wrapper.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        wrapper.classList.remove('collapsed', 'w-12');
        wrapper.classList.add('w-full', 'md:w-80', 'shrink-0');

        // Show Content
        wrapper.querySelector('.p-4').classList.remove('hidden');
        wrapper.querySelector('.p-4').classList.add('flex');

        wrapper.querySelector('.column-content').classList.remove('hidden');

        // Hide Vertical Title
        wrapper.querySelector('.collapsed-title').classList.add('hidden');
        wrapper.querySelector('.collapsed-title').classList.remove('flex');

    } else {
        // Collapse
        wrapper.classList.remove('w-full', 'md:w-80');
        wrapper.classList.add('collapsed', 'w-12', 'shrink-0');

        // Hide Content
        wrapper.querySelector('.p-4').classList.remove('flex');
        wrapper.querySelector('.p-4').classList.add('hidden');

        wrapper.querySelector('.column-content').classList.add('hidden');

        // Show Vertical Title
        wrapper.querySelector('.collapsed-title').classList.remove('hidden');
        wrapper.querySelector('.collapsed-title').classList.add('flex');
    }

    checkAutoCollapseX();
}

function checkAutoCollapseX() {
    const inbox = document.getElementById('wrapper-INBOX');
    const later = document.getElementById('wrapper-LATER');
    const done = document.getElementById('wrapper-DONE');
    const now = document.getElementById('wrapper-NOW');

    const isInboxOpen = !inbox.classList.contains('collapsed');
    const isLaterOpen = !later.classList.contains('collapsed');
    const isDoneOpen = !done.classList.contains('collapsed');

    // Logic: If all side columns are OPEN -> Collapse NOW
    if (isInboxOpen && isLaterOpen && isDoneOpen) {
        if (!now.classList.contains('collapsed')) {
            // Force collapse NOW
            // We can just call toggleColumn('wrapper-NOW') ?? 
            // Better to apply classes directly to avoid recursion loops or just reuse logic
            applyCollapse(now, true);
        }
    } else {
        // If space is available, Expand NOW
        // (Optional: User didn't strictly say this, but it makes sense)
        if (now.classList.contains('collapsed')) {
            applyCollapse(now, false);
        }
    }
}

function applyCollapse(wrapper, shouldCollapse) {
    if (shouldCollapse) {
        wrapper.classList.remove('flex-1'); // Remove flex-1 to allow it to shrink
        wrapper.classList.add('collapsed', 'w-12', 'shrink-0');

        wrapper.querySelector('.p-5').classList.remove('flex');
        wrapper.querySelector('.p-5').classList.add('hidden'); // Header NOW is p-5
        wrapper.querySelector('.column-content').classList.add('hidden');
        wrapper.querySelector('.collapsed-title').classList.remove('hidden');
        wrapper.querySelector('.collapsed-title').classList.add('flex');
    } else {
        wrapper.classList.remove('collapsed', 'w-12', 'shrink-0');
        wrapper.classList.add('flex-1'); // Restore flex-1

        wrapper.querySelector('.p-5').classList.remove('hidden');
        wrapper.querySelector('.p-5').classList.add('flex');
        wrapper.querySelector('.column-content').classList.remove('hidden');
        wrapper.querySelector('.collapsed-title').classList.add('hidden');
        wrapper.querySelector('.collapsed-title').classList.remove('flex');
    }
}
// Start
document.addEventListener('DOMContentLoaded', init);
