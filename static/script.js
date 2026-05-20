document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('seo-form');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const errorMessage = document.getElementById('error-message');
    const titlesList = document.getElementById('titles-list');
    const keywordsContainer = document.getElementById('keywords-container');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productName = document.getElementById('product_name').value.trim();
        if (!productName) return;

        // UI updates for loading state
        form.classList.add('hidden');
        results.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_name: productName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            renderResults(data);
            
            // Show results, hide loading, show form again
            loading.classList.add('hidden');
            results.classList.remove('hidden');
            form.classList.remove('hidden');
            
            // Update button text for next use
            btnText.textContent = 'Generate Again';

        } catch (error) {
            loading.classList.add('hidden');
            form.classList.remove('hidden');
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    });

    function renderResults(data) {
        // Render Titles
        titlesList.innerHTML = '';
        if (data.titles && Array.isArray(data.titles)) {
            data.titles.forEach(title => {
                const li = document.createElement('li');
                li.textContent = title;
                titlesList.appendChild(li);
            });
        }

        // Render Keywords
        keywordsContainer.innerHTML = '';
        if (data.keywords && Array.isArray(data.keywords)) {
            data.keywords.forEach(keyword => {
                const span = document.createElement('span');
                span.className = 'keyword-tag';
                span.textContent = keyword;
                keywordsContainer.appendChild(span);
            });
        }
        
        // Store data for copying
        window.currentSeoData = data;
    }

    copyBtn.addEventListener('click', () => {
        if (!window.currentSeoData) return;

        const data = window.currentSeoData;
        let copyText = "=== AMAZON SEO OPTIMIZED TITLES ===\n\n";
        
        data.titles.forEach((title, index) => {
            copyText += `${index + 1}. ${title}\n\n`;
        });
        
        copyText += "=== TOP SEARCH KEYWORDS ===\n\n";
        copyText += data.keywords.join(", ");

        navigator.clipboard.writeText(copyText).then(() => {
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="icon-small text-green-500"></i><span>Copied!</span>';
            lucide.createIcons();
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
                lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        });
    });
});
