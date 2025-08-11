document.addEventListener('DOMContentLoaded', () => {
    // A simple database simulation using localStorage
    const loadDataFromLocalStorage = () => ({
        users: JSON.parse(localStorage.getItem('users')) || {},
        quizzes: JSON.parse(localStorage.getItem('quizzes')) || {},
        scores: JSON.parse(localStorage.getItem('scores')) || {}
    });

    const saveDataToLocalStorage = (data) => {
        localStorage.setItem('users', JSON.stringify(data.users));
        localStorage.setItem('quizzes', JSON.stringify(data.quizzes));
        localStorage.setItem('scores', JSON.stringify(data.scores));
    };

    let data = loadDataFromLocalStorage();

    // Map all key DOM elements for easy access
    const elements = {
        // Auth pages
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginError: document.getElementById('login-error-message'),
        registerError: document.getElementById('register-error-message'),
        registerSuccess: document.getElementById('register-success-message'),

        // Dashboard page
        dashboardSection: document.getElementById('dashboard-section'),
        createQuizSection: document.getElementById('create-quiz-section'),
        quizResultsSection: document.getElementById('quiz-results-section'),
        navMenu: document.getElementById('nav-menu'),
        welcomeMessage: document.getElementById('welcome-message'),
        quizList: document.getElementById('quiz-list'),
        createQuizBtn: document.getElementById('create-quiz-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        createQuizForm: document.getElementById('create-quiz-form'),
        questionsContainer: document.getElementById('questions-container'),
        addQuestionBtn: document.getElementById('add-question-btn'),
        shareLinkSection: document.getElementById('share-link-section'),
        shareLinkText: document.getElementById('share-link-text'),
        copyLinkBtn: document.getElementById('copy-link-btn'),
        resultsQuizTitle: document.getElementById('results-quiz-title'),
        scoresTableBody: document.querySelector('#scores-table tbody'),
        backToDashboardFromResultsBtn: document.getElementById('back-to-dashboard-from-results-btn'),

        // Quiz page
        quizTakerSection: document.getElementById('quiz-taker-section'),
        quizTakerTitle: document.getElementById('quiz-taker-title'),
        quizContent: document.getElementById('quiz-content'),
        quizSubmitBtn: document.getElementById('quiz-submit-btn'),
        quizTakerResults: document.getElementById('quiz-taker-results'),
        quizTakerScore: document.getElementById('quiz-taker-score'),
    };
    
    // --- Helper Functions ---
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    
    const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser'));

    const showSection = (sectionId) => {
        const sections = [
            elements.dashboardSection,
            elements.createQuizSection,
            elements.quizResultsSection
        ];
        sections.forEach(section => {
            if (section) {
                section.style.display = section.id === sectionId ? 'block' : 'none';
            }
        });
    };

    // --- Authentication Logic ---
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            elements.loginError.style.display = 'none';
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const user = data.users[username];
            if (user && user.password === password) {
                localStorage.setItem('currentUser', JSON.stringify({ id: user.id, username: username }));
                window.location.href = 'dashboard.html';
            } else {
                elements.loginError.textContent = 'Invalid username or password.';
                elements.loginError.style.display = 'block';
            }
        });
    }

    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            elements.registerError.style.display = 'none';
            elements.registerSuccess.style.display = 'none';
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            if (data.users[username]) {
                elements.registerError.textContent = 'Username already exists.';
                elements.registerError.style.display = 'block';
                return;
            }
            const userId = Date.now().toString();
            data.users[username] = { id: userId, email, password, username };
            saveDataToLocalStorage(data);
            
            elements.registerForm.reset();
            elements.registerSuccess.style.display = 'block';
        });
    }

    // --- Dashboard Logic ---
    if (elements.dashboardSection) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        elements.welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;

        elements.logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });

        elements.createQuizBtn.addEventListener('click', () => {
            showSection('create-quiz-section');
            document.getElementById('create-quiz-form').reset();
            elements.questionsContainer.innerHTML = '<h3 class="questions-heading">Questions</h3>';
            addQuestionForm(); // Add one initial question
            elements.shareLinkSection.style.display = 'none';
        });

        const updateDashboard = () => {
            data = loadDataFromLocalStorage();
            elements.quizList.innerHTML = '';
            const userQuizzes = Object.entries(data.quizzes).filter(([id, quiz]) => quiz.creatorId === currentUser.id);

            if (userQuizzes.length === 0) {
                elements.quizList.innerHTML = '<p class="text-color-light">You have not created any quizzes yet. Click "Create New Quiz" to get started!</p>';
            } else {
                userQuizzes.forEach(([id, quiz]) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${quiz.title}</span>
                        <div class="quiz-actions">
                            <button class="btn btn-secondary quiz-link-btn" data-quiz-id="${id}">View Link</button>
                            <button class="btn btn-primary view-results-btn" data-quiz-id="${id}">View Scores</button>
                        </div>
                    `;
                    elements.quizList.appendChild(li);
                });
            }
        };

        const addQuestionForm = () => {
            const questionCount = elements.questionsContainer.querySelectorAll('.question-form').length;
            const newQuestionDiv = document.createElement('div');
            newQuestionDiv.classList.add('question-form', 'fade-in');
            newQuestionDiv.innerHTML = `
                <h4>Question ${questionCount + 1}</h4>
                <div class="form-group">
                    <label>Question Text</label>
                    <textarea required></textarea>
                </div>
                <div class="form-group">
                    <label>Answer Options</label>
                    <div class="answer-option">
                        <input type="radio" name="correct-answer-${questionCount}" value="0">
                        <input type="text" placeholder="Option 1" required>
                    </div>
                    <div class="answer-option">
                        <input type="radio" name="correct-answer-${questionCount}" value="1">
                        <input type="text" placeholder="Option 2" required>
                    </div>
                    <div class="answer-option">
                        <input type="radio" name="correct-answer-${questionCount}" value="2">
                        <input type="text" placeholder="Option 3" required>
                    </div>
                    <div class="answer-option">
                        <input type="radio" name="correct-answer-${questionCount}" value="3">
                        <input type="text" placeholder="Option 4" required>
                    </div>
                </div>
            `;
            elements.questionsContainer.appendChild(newQuestionDiv);
        };

        elements.addQuestionBtn.addEventListener('click', addQuestionForm);

        elements.createQuizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const quizTitle = document.getElementById('quiz-title').value;
            const questions = [];
            const questionForms = elements.questionsContainer.querySelectorAll('.question-form');

            let isValid = true;
            questionForms.forEach(form => {
                const qText = form.querySelector('textarea').value;
                const options = Array.from(form.querySelectorAll('.answer-option input[type="text"]')).map(input => input.value);
                const correct = form.querySelector('input[type="radio"]:checked');

                if (!qText || options.some(opt => !opt) || !correct) {
                    isValid = false;
                }

                if (isValid) {
                    questions.push({
                        questionText: qText,
                        options: options,
                        correctAnswerIndex: parseInt(correct.value)
                    });
                }
            });

            if (!quizTitle || questions.length === 0 || !isValid) {
                const errorEl = document.getElementById('quiz-creation-error-message');
                errorEl.textContent = 'Please fill out all fields for all questions.';
                errorEl.style.display = 'block';
                return;
            }

            const quizId = Date.now().toString();
            const newQuiz = {
                title: quizTitle,
                creatorId: currentUser.id,
                questions: questions
            };

            data.quizzes[quizId] = newQuiz;
            saveDataToLocalStorage(data);
            updateDashboard();

            const shareLink = `${window.location.origin}/quiz.html?quizId=${quizId}`;
            elements.shareLinkText.textContent = shareLink;
            elements.shareLinkSection.style.display = 'block';
        });

        elements.copyLinkBtn.addEventListener('click', () => {
            const linkText = elements.shareLinkText.textContent;
            navigator.clipboard.writeText(linkText).then(() => {
                alert('Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });

        elements.quizList.addEventListener('click', (e) => {
            const quizId = e.target.dataset.quizId;
            if (!quizId) return;
            if (e.target.classList.contains('view-results-btn')) {
                const quiz = data.quizzes[quizId];
                elements.resultsQuizTitle.textContent = quiz.title;
                elements.scoresTableBody.innerHTML = '';
                const quizScores = data.scores[quizId] || [];

                if (quizScores.length === 0) {
                    document.getElementById('results-empty-message').style.display = 'block';
                    document.getElementById('scores-table').style.display = 'none';
                } else {
                    document.getElementById('results-empty-message').style.display = 'none';
                    document.getElementById('scores-table').style.display = 'table';
                    quizScores.forEach(score => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${score.participantName}</td>
                            <td>${score.score} / ${quiz.questions.length}</td>
                        `;
                        elements.scoresTableBody.appendChild(tr);
                    });
                }
                showSection('quiz-results-section');
            } else if (e.target.classList.contains('quiz-link-btn')) {
                const shareLink = `${window.location.origin}/quiz.html?quizId=${quizId}`;
                alert(`Share this link: ${shareLink}`);
            }
        });

        elements.backToDashboardFromResultsBtn.addEventListener('click', () => {
            showSection('dashboard-section');
        });

        // Initialize dashboard view
        updateDashboard();
    }

    // --- Quiz Taker Logic ---
    if (elements.quizTakerSection) {
        const quizId = getUrlParameter('quizId');
        if (!quizId || !data.quizzes[quizId]) {
            elements.quizTakerTitle.textContent = 'Quiz not found!';
            elements.quizContent.innerHTML = '<p class="text-color-light">The quiz link is invalid or the quiz has been deleted.</p>';
            return;
        }

        const quiz = data.quizzes[quizId];
        elements.quizTakerTitle.textContent = quiz.title;

        quiz.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('quiz-question', 'fade-in');
            questionDiv.innerHTML = `
                <h4>${index + 1}. ${q.questionText}</h4>
                <div class="quiz-answers">
                    ${q.options.map((option, i) => `
                        <label>
                            <input type="radio" name="question-${index}" value="${i}">
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            elements.quizContent.appendChild(questionDiv);
        });

        elements.quizSubmitBtn.style.display = 'block';

        elements.quizSubmitBtn.addEventListener('click', () => {
            let score = 0;
            const questionForms = elements.quizContent.querySelectorAll('.quiz-question');
            let answeredCount = 0;

            questionForms.forEach((form, index) => {
                const selectedAnswer = form.querySelector(`input[name="question-${index}"]:checked`);
                if (selectedAnswer) {
                    answeredCount++;
                    if (parseInt(selectedAnswer.value) === quiz.questions[index].correctAnswerIndex) {
                        score++;
                    }
                }
            });

            if (answeredCount < quiz.questions.length) {
                alert('Please answer all questions before submitting.');
                return;
            }

            let participantName = prompt("Enter your name to save your score:");
            if (!participantName) {
                participantName = 'Anonymous';
            }

            if (!data.scores[quizId]) {
                data.scores[quizId] = [];
            }
            data.scores[quizId].push({ participantName, score });
            saveDataToLocalStorage(data);

            elements.quizTakerScore.textContent = `${score} out of ${quiz.questions.length}`;
            elements.quizTakerResults.style.display = 'block';
            elements.quizSubmitBtn.style.display = 'none';
        });
    }
});