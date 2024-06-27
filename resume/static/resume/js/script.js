document.addEventListener('DOMContentLoaded', function() {
    const resumeForm = document.getElementById('resume-form');
    const addSectionButton = document.getElementById('add-section');
    const analyzeResumeButton = document.getElementById('analyze-resume');

    if (addSectionButton) {
        addSectionButton.addEventListener('click', addSection);
    }

    if (analyzeResumeButton) {
        analyzeResumeButton.addEventListener('click', analyzeResume);
    }

    if (resumeForm) {
        resumeForm.addEventListener('submit', handleSubmit);
    }
});

function addSection() {
    console.log('addSection function called'); // 调试信息
    const sectionsContainer = document.getElementById('sections-container');
    console.log('Sections container:', sectionsContainer); // 调试信息

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
    `;

    sectionsContainer.appendChild(newSection);
    console.log('New section added'); // 调试信息
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
        }
    })
    .catch(error => console.error('Error:', error));
}

function analyzeResume() {
    // 实现分析简历的逻辑
    console.log('Analyzing resume...');
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