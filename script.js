// Data structure for questions
let questions = JSON.parse(localStorage.getItem('interviewQuestions')) || [];
let categories = ['introduction', 'project explain', 'Bootstrap', 'tailwind css', 'JavaScript', 'React', 'CSS', 'HTML', 'Node.js', 'HR Questions', 'Data Structures', 'Algorithms'];
let currentCategory = 'all';
let currentFilter = 'all';
let editingQuestionId = null;

// Example questions database
const exampleQuestions = {
    'JavaScript': [
        {
            question: "What is the difference between let, const, and var?",
            answer: "var is function-scoped and can be redeclared. let is block-scoped and can be reassigned. const is block-scoped but cannot be reassigned. var variables are hoisted, while let and const are not.",
            category: "JavaScript"
        },
        {
            question: "What are closures in JavaScript?",
            answer: "Closures are functions that have access to variables in their outer scope even after the outer function has returned. They're created every time a function is created.",
            category: "JavaScript"
        },
        {
            question: "Explain event delegation in JavaScript",
            answer: "Event delegation is a technique where instead of adding event listeners to individual elements, you add a single event listener to a parent element to handle events from its children.",
            category: "JavaScript"
        }
    ],
    'React': [
        {
            question: "What are React hooks?",
            answer: "Hooks are functions that let you use state and other React features in functional components. Examples include useState, useEffect, and useContext.",
            category: "React"
        },
        {
            question: "What is the virtual DOM?",
            answer: "The virtual DOM is a lightweight copy of the real DOM that React uses to optimize updates. It allows React to batch updates and minimize direct DOM manipulation.",
            category: "React"
        }
    ],
    'CSS': [
        {
            question: "What is the box model in CSS?",
            answer: "The CSS box model consists of content, padding, border, and margin. It defines how elements are sized and spaced on a web page.",
            category: "CSS"
        },
        {
            question: "What is Flexbox?",
            answer: "Flexbox is a CSS layout module that provides an efficient way to lay out, align, and distribute space among items in a container, even when their size is unknown.",
            category: "CSS"
        }
    ],
    'HTML': [
        {
            question: "What is semantic HTML?",
            answer: "Semantic HTML uses meaningful tags that describe their content (like <header>, <footer>, <article>) rather than just presentation tags (like <div>).",
            category: "HTML"
        }
    ],
    'HR Questions': [
        {
            question: "Tell me about yourself",
            answer: "Focus on your professional background, key skills, and what makes you a good fit for this role. Keep it concise (2-3 minutes) and relevant to the position.",
            category: "HR Questions"
        },
        {
            question: "What are your strengths?",
            answer: "Choose 3-4 strengths relevant to the job and provide specific examples of how you've demonstrated them in previous roles.",
            category: "HR Questions"
        }
    ],
    'introduction': [
        {
            question: "Why do you want to work for our company?",
            answer: "Research the company's values, mission, and recent achievements. Connect your skills and career goals with what the company offers.",
            category: "introduction"
        }
    ]
};

// DOM Elements
const questionList = document.getElementById('question-list');
const categoriesList = document.getElementById('categories-list');
const questionCategorySelect = document.getElementById('question-category');
const searchInput = document.getElementById('search-input');
const questionModal = document.getElementById('question-modal');
const randomModal = document.getElementById('random-modal');
const confirmModal = document.getElementById('confirm-modal');
const questionForm = document.getElementById('question-form');
const modalTitle = document.getElementById('modal-title');
const currentCategoryTitle = document.getElementById('current-category');
const totalQuestionsEl = document.getElementById('total-questions');
const reviewedQuestionsEl = document.getElementById('reviewed-questions');
const favoriteQuestionsEl = document.getElementById('favorite-questions');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Initialize the application
function init() {
    renderCategories();
    renderQuestions();
    updateStats();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Modal open/close events
    document.getElementById('add-question-btn').addEventListener('click', () => openQuestionModal());
    document.getElementById('random-mode-btn').addEventListener('click', () => openRandomModal());
    
    // Close modals when clicking X or outside
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === questionModal) closeModals();
        if (e.target === randomModal) closeModals();
        if (e.target === confirmModal) closeModals();
    });
    
    // Form submission
    questionForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', closeModals);
    
    // Example button
    document.getElementById('example-btn').addEventListener('click', openExampleModal);
    
    // Filter buttons
    document.getElementById('filter-all').addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-favorites').addEventListener('click', () => setFilter('favorites'));
    document.getElementById('filter-unreviewed').addEventListener('click', () => setFilter('unreviewed'));
    
    // Search functionality
    searchInput.addEventListener('input', renderQuestions);
    
    // Random mode functionality
    document.getElementById('show-answer-btn').addEventListener('click', showRandomAnswer);
    document.getElementById('next-random-btn').addEventListener('click', getRandomQuestion);
    document.getElementById('exit-random-btn').addEventListener('click', closeModals);
    
    // Confirmation modal
    document.getElementById('confirm-cancel').addEventListener('click', () => confirmModal.style.display = 'none');
    document.getElementById('confirm-ok').addEventListener('click', handleConfirmAction);
}

// Render categories in sidebar and form
function renderCategories() {
    categoriesList.innerHTML = '';
    questionCategorySelect.innerHTML = '';
    
    // Add "All Categories" option
    const allItem = document.createElement('li');
    allItem.textContent = 'All Categories';
    allItem.classList.add('active');
    allItem.addEventListener('click', () => setCategory('all'));
    categoriesList.appendChild(allItem);
    
    // Add each category
    categories.forEach(category => {
        // Add to sidebar
        const li = document.createElement('li');
        li.textContent = category;
        li.addEventListener('click', () => setCategory(category));
        
        const countSpan = document.createElement('span');
        countSpan.className = 'category-count';
        countSpan.textContent = getQuestionsByCategory(category).length;
        li.appendChild(countSpan);
        
        categoriesList.appendChild(li);
        
        // Add to form select
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        questionCategorySelect.appendChild(option);
    });
}

// Render questions based on current category and filter
function renderQuestions() {
    let filteredQuestions = getFilteredQuestions();
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredQuestions = filteredQuestions.filter(q => 
            q.question.toLowerCase().includes(searchTerm) || 
            q.answer.toLowerCase().includes(searchTerm)
        );
    }
    
    questionList.innerHTML = '';
    
    if (filteredQuestions.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-inbox"></i>
            <h3>No questions found</h3>
            <p>${searchTerm ? 'Try adjusting your search' : 'Add your first question to get started!'}</p>
        `;
        questionList.appendChild(emptyState);
        return;
    }
    
    filteredQuestions.forEach(question => {
        const questionEl = createQuestionElement(question);
        questionList.appendChild(questionEl);
    });
}

// Create HTML for a question item
function createQuestionElement(question) {
    const questionEl = document.createElement('div');
    questionEl.className = 'question-item';
    questionEl.innerHTML = `
        <div class="question-item-header">
            <div class="question-text">${question.question}</div>
            <div class="question-actions">
                <button class="action-btn favorite-btn ${question.isFavorite ? 'active' : ''}" 
                        data-id="${question.id}">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${question.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${question.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="question-category">${question.category}</div>
        ${question.isReviewed ? '<span class="reviewed-badge"><i class="fas fa-check"></i> Reviewed</span>' : ''}
        <div class="question-answer">${question.answer}</div>
    `;
    
    // Add event listeners to action buttons
    questionEl.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(question.id));
    questionEl.querySelector('.edit-btn').addEventListener('click', () => editQuestion(question.id));
    questionEl.querySelector('.delete-btn').addEventListener('click', () => deleteQuestion(question.id));
    
    return questionEl;
}

// Get questions filtered by current category and filter
function getFilteredQuestions() {
    let filtered = questions;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(q => q.category === currentCategory);
    }
    
    // Apply additional filters
    if (currentFilter === 'favorites') {
        filtered = filtered.filter(q => q.isFavorite);
    } else if (currentFilter === 'unreviewed') {
        filtered = filtered.filter(q => !q.isReviewed);
    }
    
    return filtered;
}

// Get questions by category
function getQuestionsByCategory(category) {
    if (category === 'all') return questions;
    return questions.filter(q => q.category === category);
}

// Set current category and update UI
function setCategory(category) {
    currentCategory = category;
    
    // Update active category in sidebar
    document.querySelectorAll('#categories-list li').forEach(li => {
        li.classList.remove('active');
        if (li.textContent.includes(category) || (category === 'all' && li.textContent === 'All Categories')) {
            li.classList.add('active');
        }
    });
    
    // Update category title
    currentCategoryTitle.textContent = category === 'all' ? 'All Questions' : category;
    
    renderQuestions();
    updateStats();
}

// Set current filter and update UI
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    renderQuestions();
    updateStats();
}

// Update statistics in sidebar
function updateStats() {
    const total = questions.length;
    const reviewed = questions.filter(q => q.isReviewed).length;
    const favorites = questions.filter(q => q.isFavorite).length;
    const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
    
    totalQuestionsEl.textContent = total;
    reviewedQuestionsEl.textContent = reviewed;
    favoriteQuestionsEl.textContent = favorites;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}% Complete`;
    
    // Update category counts
    document.querySelectorAll('#categories-list li').forEach(li => {
        const countSpan = li.querySelector('.category-count');
        if (countSpan) {
            const category = li.textContent.replace(countSpan.textContent, '').trim();
            countSpan.textContent = getQuestionsByCategory(category).length;
        }
    });
}

// Open question modal for adding/editing
function openQuestionModal(questionId = null) {
    editingQuestionId = questionId;
    
    if (questionId) {
        // Editing existing question
        modalTitle.textContent = 'Edit Question';
        const question = questions.find(q => q.id === questionId);
        document.getElementById('question-text').value = question.question;
        document.getElementById('answer-text').value = question.answer;
        document.getElementById('question-category').value = question.category;
        document.getElementById('is-favorite').checked = question.isFavorite;
        document.getElementById('is-reviewed').checked = question.isReviewed;
    } else {
        // Adding new question
        modalTitle.textContent = 'Add New Question';
        questionForm.reset();
    }
    
    questionModal.style.display = 'flex';
}

// Open example questions modal
function openExampleModal() {
    // Create example modal if it doesn't exist
    let exampleModal = document.getElementById('example-modal');
    if (!exampleModal) {
        exampleModal = document.createElement('div');
        exampleModal.id = 'example-modal';
        exampleModal.className = 'modal';
        exampleModal.innerHTML = `
            <div class="modal-content example-modal">
                <div class="modal-header">
                    <h2>Select Example Questions</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="example-categories" id="example-categories"></div>
                    <div class="examples-grid" id="examples-grid"></div>
                    <div class="form-actions">
                        <button type="button" id="close-example-btn" class="btn btn-secondary">Close</button>
                        <button type="button" id="add-selected-btn" class="btn btn-primary">Add Selected Questions</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(exampleModal);
        
        // Add event listeners for the new modal
        exampleModal.querySelector('.close').addEventListener('click', () => {
            exampleModal.style.display = 'none';
        });
        
        exampleModal.querySelector('#close-example-btn').addEventListener('click', () => {
            exampleModal.style.display = 'none';
        });
        
        exampleModal.querySelector('#add-selected-btn').addEventListener('click', addSelectedExamples);
        
        window.addEventListener('click', (e) => {
            if (e.target === exampleModal) {
                exampleModal.style.display = 'none';
            }
        });
    }
    
    renderExampleCategories();
    exampleModal.style.display = 'flex';
}

// Render example categories
function renderExampleCategories() {
    const categoriesContainer = document.getElementById('example-categories');
    const examplesGrid = document.getElementById('examples-grid');
    
    categoriesContainer.innerHTML = '';
    examplesGrid.innerHTML = '';
    
    // Add "All" category
    const allBtn = document.createElement('button');
    allBtn.className = 'example-category-btn active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.example-category-btn').forEach(btn => btn.classList.remove('active'));
        allBtn.classList.add('active');
        renderExamples('all');
    });
    categoriesContainer.appendChild(allBtn);
    
    // Add each category that has examples
    Object.keys(exampleQuestions).forEach(category => {
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'example-category-btn';
        categoryBtn.textContent = category;
        categoryBtn.addEventListener('click', () => {
            document.querySelectorAll('.example-category-btn').forEach(btn => btn.classList.remove('active'));
            categoryBtn.classList.add('active');
            renderExamples(category);
        });
        categoriesContainer.appendChild(categoryBtn);
    });
    
    // Render all examples initially
    renderExamples('all');
}

// Render examples for a specific category
function renderExamples(category) {
    const examplesGrid = document.getElementById('examples-grid');
    examplesGrid.innerHTML = '';
    
    let examplesToShow = [];
    
    if (category === 'all') {
        // Show all examples from all categories
        Object.values(exampleQuestions).forEach(categoryExamples => {
            examplesToShow = examplesToShow.concat(categoryExamples);
        });
    } else {
        // Show examples from specific category
        examplesToShow = exampleQuestions[category] || [];
    }
    
    if (examplesToShow.length === 0) {
        examplesGrid.innerHTML = '<p>No examples found for this category.</p>';
        return;
    }
    
    examplesToShow.forEach((example, index) => {
        const exampleCard = document.createElement('div');
        exampleCard.className = 'example-card';
        exampleCard.innerHTML = `
            <div class="example-question">${example.question}</div>
            <div class="example-answer">${example.answer}</div>
            <div class="example-category">${example.category}</div>
            <input type="checkbox" class="example-checkbox" data-index="${index}" data-category="${example.category}">
        `;
        
        exampleCard.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const checkbox = exampleCard.querySelector('.example-checkbox');
                checkbox.checked = !checkbox.checked;
                exampleCard.classList.toggle('selected', checkbox.checked);
            }
        });
        
        examplesGrid.appendChild(exampleCard);
    });
}

// Add selected examples to question bank
function addSelectedExamples() {
    const checkboxes = document.querySelectorAll('.example-checkbox:checked');
    let addedCount = 0;
    
    checkboxes.forEach(checkbox => {
        const category = checkbox.dataset.category;
        const index = parseInt(checkbox.dataset.index);
        
        const example = exampleQuestions[category][index];
        
        // Check if this example already exists
        const exists = questions.some(q => 
            q.question === example.question && q.answer === example.answer
        );
        
        if (!exists) {
            const newQuestion = {
                id: Date.now().toString() + Math.random(),
                question: example.question,
                answer: example.answer,
                category: example.category,
                isFavorite: false,
                isReviewed: false,
                createdAt: new Date().toISOString()
            };
            questions.push(newQuestion);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        saveQuestions();
        renderQuestions();
        updateStats();
        alert(`Successfully added ${addedCount} question(s) to your question bank!`);
    } else {
        alert('No new questions were added (they may already exist in your question bank).');
    }
    
    document.getElementById('example-modal').style.display = 'none';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const questionText = document.getElementById('question-text').value.trim();
    const answerText = document.getElementById('answer-text').value.trim();
    const category = document.getElementById('question-category').value;
    const isFavorite = document.getElementById('is-favorite').checked;
    const isReviewed = document.getElementById('is-reviewed').checked;
    
    if (!questionText || !answerText || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    if (editingQuestionId) {
        // Update existing question
        const questionIndex = questions.findIndex(q => q.id === editingQuestionId);
        questions[questionIndex] = {
            ...questions[questionIndex],
            question: questionText,
            answer: answerText,
            category,
            isFavorite,
            isReviewed
        };
    } else {
        // Add new question
        const newQuestion = {
            id: Date.now().toString(),
            question: questionText,
            answer: answerText,
            category,
            isFavorite,
            isReviewed,
            createdAt: new Date().toISOString()
        };
        questions.push(newQuestion);
    }
    
    saveQuestions();
    closeModals();
    renderQuestions();
    updateStats();
}

// Toggle favorite status of a question
function toggleFavorite(questionId) {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    questions[questionIndex].isFavorite = !questions[questionIndex].isFavorite;
    saveQuestions();
    renderQuestions();
    updateStats();
}

// Edit a question
function editQuestion(questionId) {
    openQuestionModal(questionId);
}

// Delete a question with confirmation
function deleteQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    document.getElementById('confirm-message').textContent = `Are you sure you want to delete the question: "${question.question}"?`;
    confirmModal.style.display = 'flex';
    
    // Store the question ID to delete if confirmed
    document.getElementById('confirm-ok').dataset.id = questionId;
}

// Handle confirmation of delete action
function handleConfirmAction() {
    const questionId = document.getElementById('confirm-ok').dataset.id;
    questions = questions.filter(q => q.id !== questionId);
    saveQuestions();
    confirmModal.style.display = 'none';
    renderQuestions();
    updateStats();
}

// Open random question mode
function openRandomModal() {
    if (questions.length === 0) {
        alert('Add some questions first!');
        return;
    }
    
    randomModal.style.display = 'flex';
    getRandomQuestion();
}

// Get a random question for practice mode
function getRandomQuestion() {
    const filteredQuestions = getFilteredQuestions();
    
    if (filteredQuestions.length === 0) {
        document.getElementById('random-question-text').textContent = 'No questions available with current filters';
        document.getElementById('show-answer-btn').style.display = 'none';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    const randomQuestion = filteredQuestions[randomIndex];
    
    document.getElementById('random-question-text').textContent = randomQuestion.question;
    document.getElementById('random-answer-text').innerHTML = `<p>${randomQuestion.answer}</p>`;
    document.getElementById('random-answer-text').classList.add('hidden');
    document.getElementById('show-answer-btn').style.display = 'block';
    document.getElementById('show-answer-btn').textContent = 'Show Answer';
}

// Show answer in random mode
function showRandomAnswer() {
    const answerElement = document.getElementById('random-answer-text');
    const showButton = document.getElementById('show-answer-btn');
    
    if (answerElement.classList.contains('hidden')) {
        answerElement.classList.remove('hidden');
        showButton.textContent = 'Hide Answer';
    } else {
        answerElement.classList.add('hidden');
        showButton.textContent = 'Show Answer';
    }
}

// Close all modals
function closeModals() {
    questionModal.style.display = 'none';
    randomModal.style.display = 'none';
    confirmModal.style.display = 'none';
    const exampleModal = document.getElementById('example-modal');
    if (exampleModal) exampleModal.style.display = 'none';
    editingQuestionId = null;
}

// Save questions to localStorage
function saveQuestions() {
    localStorage.setItem('interviewQuestions', JSON.stringify(questions));
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);