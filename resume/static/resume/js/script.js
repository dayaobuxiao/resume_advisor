document.addEventListener('DOMContentLoaded', function() {
    const resumeForm = document.getElementById('resume-form');
    const addSectionButton = document.getElementById('add-section');
    const sectionsContainer = document.getElementById('sections-container');
    const analyzeResumeButton = document.getElementById('analyze-resume');
    const selectAllCheckbox = document.getElementById('select-all');

    if (addSectionButton) {
        addSectionButton.addEventListener('click', addSection);
    }

    if (sectionsContainer) {
        sectionsContainer.addEventListener('click', deleteSection);
    }

    if (analyzeResumeButton) {
        analyzeResumeButton.addEventListener('click', analyzeResume);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', deleteResume);
    }

    if (resumeForm) {
        resumeForm.addEventListener('submit', handleSubmit);
    }
});

function addSection() {
    const sectionsContainer = document.getElementById('sections-container');
    if (!sectionsContainer) {
        console.error('Sections container not found');
        return;
    }

    const sectionCount = sectionsContainer.children.length;

    const newSection = document.createElement('div');
    newSection.className = 'resume-section';
    newSection.innerHTML = `
        <label for="section-title-${sectionCount}">Section Title:</label>
        <input type="text" id="section-title-${sectionCount}" class="section-title" name="section-title-${sectionCount}" required>

        <label for="section-content-${sectionCount}">Content:</label>
        <textarea id="section-content-${sectionCount}" class="section-content" name="section-content-${sectionCount}" required></textarea>

        <label for="section-analysis-${sectionCount}">Analysis:</label>
        <textarea id="section-analysis-${sectionCount}" class="section-analysis" name="section-analysis-${sectionCount}" required></textarea>
        <button type="button" class="delete-section">Delete Section</button>
    `;

    sectionsContainer.appendChild(newSection);
}

function deleteSection(event) {
    if (event.target.classList.contains('delete-section')) {
        const sectionToDelete = event.target.closest('.resume-section');
        if (sectionToDelete) {
            sectionToDelete.remove();
        }
    }
}

function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const jsonData = {
        name: formData.get('name'),
        sections: []
    };
    document.querySelectorAll('.resume-section').forEach((section, index) => {
        jsonData.sections.push({
            title: section.querySelector('.section-title').value,
            content: section.querySelector('.section-content').value,
            analysis: section.querySelector('.section-analysis').value,
            order: index
        });
    });

    fetch(this.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(jsonData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.href = '/dashboard/';
        } else {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.textContent = data.message;
                nameError.style.display = 'block';
            } else {
                console.error('Error element not found:', data.message);
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const nameError = document.getElementById('name-error');
        if (nameError) {
            nameError.textContent = 'An error occurred while saving the resume.';
            nameError.style.display = 'block';
        } else {
            alert('An error occurred while saving the resume.');
        }
    });
}

function analyzeResume() {
    const sections = document.querySelectorAll('.resume-section');
    const csrfToken = getCookie('csrftoken');

    sections.forEach((section, index) => {
        const sectionContent = section.querySelector('.section-content').value;

        fetch('/api/analyze_section', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content: sectionContent
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const analysisTextarea = section.querySelector('.section-analysis');
                analysisTextarea.value = data.analysis; // 更新分析结果
            } else {
                console.error('Analysis failed:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

function deleteResume() {
    const checkboxes = document.querySelectorAll('input[name="resume_ids"]');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}